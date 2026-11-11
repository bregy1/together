#!/usr/bin/env node
// One root command for local development (ADR-0012, ADR-0009):
//   1. PostgreSQL in Docker (deploy/docker-compose.yml), if Docker is available
//   2. the Go server in server/ through `air` (rebuild and restart on save)
//   3. the Expo dev server for the web in app/ (hot reload in the browser)
// Every line of output is prefixed with the name of the process it came from.
// Ctrl-C stops the server and the app together; PostgreSQL keeps running
// (stop it with `npm run db:stop`). If the server or the app process dies,
// the other one is stopped and this script exits with a non-zero code.
//
// Plain Node, standard library only; run with `npm run dev` from the repository root.
// `node scripts/dev.mjs go <args>` and `node scripts/dev.mjs gofmt <args>` run the
// same Go in server/ (used by the root package scripts).
//
// Finding Go and air (see README.md -> Prerequisites):
//   - YARUNO_GO_BIN, if set, is the folder that holds the `go` executable to use.
//   - Otherwise, on Windows, "<Program Files>\Go\bin" (the default folder of the
//     64-bit Go installer) is put ahead of anything else on the PATH, so an older
//     or 32-bit Go elsewhere on the PATH is not used.
//   - Otherwise `go` is taken from the PATH.
//   - air is looked up in Go's own bin folder (`go env GOBIN`, else the first
//     entry of `go env GOPATH` plus "bin"), where `go install` puts it, then on the PATH.
//
// spec: ADR-0012

import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const isWindows = process.platform === 'win32';
const exe = isWindows ? '.exe' : '';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const serverDir = path.join(root, 'server');
const appDir = path.join(root, 'app');
const composeFile = path.join(root, 'deploy', 'docker-compose.yml');

// Local development values only (deploy/docker-compose.yml). Never production.
const LOCAL_DATABASE_URL = 'postgres://yaruno:yaruno-local-dev@127.0.0.1:5432/yaruno?sslmode=disable';
const LOCAL_API_BASE_URL = 'http://127.0.0.1:8080';

// ---------------------------------------------------------------- output

const useColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
const colors = { dev: 90, db: 36, server: 33, app: 35 };
const width = Math.max(...Object.keys(colors).map((n) => n.length));

function prefix(name) {
  const label = `[${name}]`.padEnd(width + 2);
  return useColor ? `\x1b[${colors[name]}m${label}\x1b[0m ` : `${label} `;
}

function log(name, line) {
  process.stdout.write(`${prefix(name)}${line}\n`);
}

function pipeLines(name, stream) {
  if (!stream) return;
  readline.createInterface({ input: stream, crlfDelay: Infinity }).on('line', (line) => log(name, line));
}

function fail(message) {
  log('dev', message);
  process.exit(1);
}

// ---------------------------------------------------------------- Go and air

function findGo() {
  const candidates = [];
  if (process.env.YARUNO_GO_BIN) {
    const goPath = path.join(process.env.YARUNO_GO_BIN, `go${exe}`);
    if (!existsSync(goPath)) fail(`YARUNO_GO_BIN is set, but there is no go${exe} in it.`);
    return { go: goPath, binDir: process.env.YARUNO_GO_BIN };
  }
  if (isWindows) {
    // ProgramW6432 points to the 64-bit Program Files even from a 32-bit Node.
    for (const dir of [process.env.ProgramW6432, process.env.ProgramFiles]) {
      if (dir) candidates.push(path.join(dir, 'Go', 'bin'));
    }
  }
  for (const dir of candidates) {
    const goPath = path.join(dir, `go${exe}`);
    if (existsSync(goPath)) return { go: goPath, binDir: dir };
  }
  return { go: 'go', binDir: null };
}

function goEnv(go, env, names) {
  const result = spawnSync(go, ['env', ...names], { env, encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    fail('Go was not found. Install Go 1.27 (64-bit) from https://go.dev/dl/ or set YARUNO_GO_BIN; see README.md.');
  }
  const lines = result.stdout.split(/\r?\n/);
  return Object.fromEntries(names.map((name, i) => [name, (lines[i] ?? '').trim()]));
}

function findAir(goVars, pathValue) {
  const dirs = [];
  if (goVars.GOBIN) dirs.push(goVars.GOBIN);
  const firstGopath = goVars.GOPATH.split(path.delimiter).find(Boolean);
  if (firstGopath) dirs.push(path.join(firstGopath, 'bin'));
  dirs.push(...pathValue.split(path.delimiter).filter(Boolean));
  for (const dir of dirs) {
    const airPath = path.join(dir, `air${exe}`);
    if (existsSync(airPath)) return airPath;
  }
  return null;
}

// Environment shared by every child: the chosen Go first on the PATH.
const childEnv = { ...process.env };
const pathKey = Object.keys(childEnv).find((k) => k.toUpperCase() === 'PATH') ?? 'PATH';
const { go, binDir } = findGo();
if (binDir) childEnv[pathKey] = [binDir, childEnv[pathKey]].filter(Boolean).join(path.delimiter);

const goVars = goEnv(go, childEnv, ['GOVERSION', 'GOARCH', 'GOOS', 'GOBIN', 'GOPATH', 'GOROOT']);
if (goVars.GOARCH === '386' || goVars.GOARCH === 'arm') {
  fail(`Found ${goVars.GOVERSION} ${goVars.GOOS}/${goVars.GOARCH} (${go}); a 64-bit Go 1.27 is needed. See README.md.`);
}

// Tool mode: `node scripts/dev.mjs go <args>` or `node scripts/dev.mjs gofmt <args>`
// runs the same Go in server/, so the root package scripts never pick up an
// older Go from the PATH. `gofmt -l` fails when it lists any file.
const tool = process.argv[2];
if (tool === 'go' || tool === 'gofmt') {
  const command = tool === 'go' ? go : path.join(goVars.GOROOT, 'bin', `gofmt${exe}`);
  const args = process.argv.slice(3);
  const listOnly = tool === 'gofmt' && args.includes('-l');
  const result = spawnSync(command, args, {
    cwd: serverDir,
    env: childEnv,
    stdio: ['inherit', listOnly ? 'pipe' : 'inherit', 'inherit'],
    encoding: 'utf8',
  });
  if (result.error) fail(`Could not run ${tool}: ${result.error.message}`);
  if (listOnly && result.stdout.trim() !== '') {
    process.stdout.write(result.stdout);
    log('dev', 'gofmt: the files above are not formatted (run gofmt -w on them in server/).');
    process.exit(1);
  }
  process.exit(result.status ?? 1);
}
if (tool) fail(`Unknown argument "${tool}". Use: node scripts/dev.mjs [go|gofmt <args>]`);

const air = findAir(goVars, childEnv[pathKey] ?? '');
if (!air) {
  fail('air was not found. Install it with: go install github.com/air-verse/air@v1.67.4 (see README.md).');
}
const expoCli = path.join(appDir, 'node_modules', 'expo', 'bin', 'cli');
if (!existsSync(expoCli)) {
  fail('The app dependencies are missing. Run: cd app && npm ci --ignore-scripts');
}
log('dev', `Go: ${goVars.GOVERSION} ${goVars.GOOS}/${goVars.GOARCH} (${go})`);
log('dev', `air: ${air}`);

// ---------------------------------------------------------------- PostgreSQL

function startDatabase() {
  return new Promise((resolve) => {
    const info = spawnSync('docker', ['info', '--format', '{{.ServerVersion}}'], {
      encoding: 'utf8',
      timeout: 20_000,
    });
    if (info.error || info.status !== 0) {
      const why = info.error?.code === 'ENOENT' ? 'Docker is not installed' : 'Docker is not running';
      log('db', `${why}: PostgreSQL is not started. The server runs without it and /healthz answers "unavailable".`);
      resolve(false);
      return;
    }
    const compose = spawn(
      'docker',
      ['compose', '-f', composeFile, 'up', '-d', '--wait', '--wait-timeout', '90', 'postgres'],
      { cwd: root, env: childEnv, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    pipeLines('db', compose.stdout);
    pipeLines('db', compose.stderr);
    compose.on('error', (err) => {
      log('db', `Could not run docker compose (${err.message}): PostgreSQL is not started.`);
      resolve(false);
    });
    compose.on('exit', (code) => {
      if (code === 0) log('db', 'PostgreSQL is ready on 127.0.0.1:5432 (stop it with: npm run db:stop).');
      else log('db', `docker compose exited with code ${code}: PostgreSQL may not be running.`);
      resolve(code === 0);
    });
  });
}

// ---------------------------------------------------------------- processes

const children = new Map(); // name -> ChildProcess
let stopping = false;
let exitCode = 0;

function start(name, command, args, options) {
  const child = spawn(command, args, {
    ...options,
    stdio: ['ignore', 'pipe', 'pipe'],
    // POSIX: own process group, so the whole tree can be signalled at once.
    detached: !isWindows,
    windowsHide: true,
  });
  children.set(name, child);
  pipeLines(name, child.stdout);
  pipeLines(name, child.stderr);
  child.on('error', (err) => {
    log(name, `could not start: ${err.message}`);
  });
  child.on('exit', (code, signal) => {
    children.delete(name);
    // On Windows, Ctrl-C reaches the children at the same time as this script;
    // wait a moment so a child ending on Ctrl-C is not reported as a crash.
    setTimeout(() => {
      if (!stopping) {
        log('dev', `${name} stopped unexpectedly (${signal ?? `exit code ${code}`}); stopping everything.`);
        exitCode = 1;
        stopAll();
      } else if (children.size === 0) {
        finish();
      }
    }, isWindows ? 750 : 0);
  });
  return child;
}

function killTree(child, force) {
  if (child.exitCode !== null || child.signalCode !== null || !child.pid) return;
  try {
    if (isWindows) {
      // Windows has no signals for console processes started this way; end the
      // whole tree (air, the server binary, Metro workers).
      spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      process.kill(-child.pid, force ? 'SIGKILL' : 'SIGINT');
    }
  } catch {
    // already gone
  }
}

function stopAll(fromCtrlC = false) {
  if (stopping) return;
  stopping = true;
  if (children.size === 0) return finish();
  log('dev', 'Stopping the server and the app ...');
  if (!isWindows) {
    for (const child of children.values()) killTree(child, false);
  } else if (!fromCtrlC) {
    // Ctrl-C already reached every process in this console; otherwise end them now.
    for (const child of children.values()) killTree(child, true);
  }
  // Grace period, then force.
  setTimeout(() => {
    for (const child of children.values()) killTree(child, true);
  }, isWindows ? 3000 : 5000).unref();
  // Last resort, if a process does not report its exit.
  setTimeout(finish, 10_000).unref();
}

function finish() {
  log('dev', exitCode === 0 ? 'Stopped.' : 'Stopped with errors.');
  process.exit(exitCode);
}

process.on('SIGINT', () => stopAll(true));
process.on('SIGTERM', () => stopAll(false));
process.on('SIGHUP', () => stopAll(false)); // console window closed (Windows)

// ---------------------------------------------------------------- main

await startDatabase();
if (stopping) process.exit(exitCode);

const serverEnv = { ...childEnv, DATABASE_URL: process.env.DATABASE_URL || LOCAL_DATABASE_URL };
log('server', `starting air in server/ (DATABASE_URL ${process.env.DATABASE_URL ? 'from your environment' : 'set to the local database'})`);
start('server', air, [], { cwd: serverDir, env: serverEnv });

const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || LOCAL_API_BASE_URL;
const appEnv = { ...childEnv, EXPO_PUBLIC_API_BASE_URL: apiBaseUrl };
log('app', `starting the Expo dev server for the web in app/ (API ${apiBaseUrl})`);
start('app', process.execPath, [expoCli, 'start', '--web'], { cwd: appDir, env: appEnv });

log('dev', 'Server: http://127.0.0.1:8080/healthz   App: http://localhost:8081   Ctrl-C stops both.');
