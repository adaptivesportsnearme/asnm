#!/usr/bin/env bash
# One-time local setup: database, roles with least-privilege grants, migrations, seed import.
# Run: sudo ./db/setup.sh   (from the repo root; idempotent)
#
# Roles (the spec's one invariant, enforced in grants):
#   asnm_app      — the website. Full DML; decides review_queue items.
#   asnm_pipeline — agent lanes. SELECT everywhere; INSERT only on link_checks, pipeline_runs,
#                   review_queue. CANNOT write organizations, ever.
set -euo pipefail
cd "$(dirname "$0")/.."

ENVFILE=".env"
if [[ ! -f "$ENVFILE" ]]; then
  APP_PW="$(openssl rand -hex 24)"; PIPE_PW="$(openssl rand -hex 24)"
  cat > "$ENVFILE" <<EOF
DATABASE_URL=postgresql://asnm_app:${APP_PW}@localhost:5432/asnm
PIPELINE_DATABASE_URL=postgresql://asnm_pipeline:${PIPE_PW}@localhost:5432/asnm
EOF
  chmod 600 "$ENVFILE"; chown "${SUDO_USER:-$USER}" "$ENVFILE"
fi
APP_PW="$(grep -oP '(?<=asnm_app:)[^@]+' "$ENVFILE")"
PIPE_PW="$(grep -oP '(?<=asnm_pipeline:)[^@]+' "$ENVFILE")"

sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
do \$\$ begin
  if not exists (select from pg_roles where rolname='asnm_app') then
    create role asnm_app login password '${APP_PW}';
  else
    alter role asnm_app with login password '${APP_PW}';
  end if;
  if not exists (select from pg_roles where rolname='asnm_pipeline') then
    create role asnm_pipeline login password '${PIPE_PW}';
  else
    alter role asnm_pipeline with login password '${PIPE_PW}';
  end if;
end \$\$;
SQL
sudo -u postgres psql -tc "select 1 from pg_database where datname='asnm'" | grep -q 1 \
  || sudo -u postgres createdb asnm

for m in db/migrations/*.sql; do
  echo "applying $m"
  sudo -u postgres psql -d asnm -v ON_ERROR_STOP=1 -q -f "$m"
done

sudo -u postgres psql -d asnm -v ON_ERROR_STOP=1 -q <<'SQL'
-- least-privilege grants (re-runnable)
grant connect on database asnm to asnm_app, asnm_pipeline;
grant usage on schema public to asnm_app, asnm_pipeline;
grant select, insert, update, delete on all tables in schema public to asnm_app;
grant usage on all sequences in schema public to asnm_app;
revoke all on all tables in schema public from asnm_pipeline;
grant select on all tables in schema public to asnm_pipeline;
grant select on org_freshness to asnm_pipeline, asnm_app;
grant insert on link_checks, pipeline_runs, review_queue to asnm_pipeline;
grant usage on all sequences in schema public to asnm_pipeline;
SQL

echo "setup complete"
