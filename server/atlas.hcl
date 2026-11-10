# Atlas project file (ADR-0004): versioned migrations generated from the ent schema.
# Not verified on this machine: the Atlas CLI is not installed (it cannot be
# installed with `go install`); see server/README.md.
#
#   DATABASE_URL    the database to migrate (never production from a laptop)
#   ATLAS_DEV_URL   an empty scratch PostgreSQL database Atlas may wipe,
#                   for example docker://postgres/<version>/dev?search_path=public

env "local" {
  src = "ent://ent/schema"
  url = getenv("DATABASE_URL")
  dev = getenv("ATLAS_DEV_URL")

  migration {
    dir = "file://ent/migrate/migrations"
  }
}
