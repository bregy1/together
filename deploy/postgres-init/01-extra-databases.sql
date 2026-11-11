-- Runs once, when the local development volume is empty (deploy/docker-compose.yml).
-- yaruno (development data) is created by the image from POSTGRES_DB.
-- Tests use their own database so they never touch development data.
CREATE DATABASE yaruno_test OWNER yaruno;
-- Empty scratch database for Atlas; Atlas may wipe it at any time.
CREATE DATABASE yaruno_atlas_dev OWNER yaruno;
