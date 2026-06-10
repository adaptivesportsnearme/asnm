#!/usr/bin/env bash
# Run the validate lane end-to-end as the restricted asnm_pipeline role.
# Writes: link_checks (every result), pipeline_runs (the run record),
#         review_queue (one item per dead website). Never touches organizations.
set -euo pipefail
cd "$(dirname "$0")/.."
PIPE_URL=$(grep '^PIPELINE_DATABASE_URL=' .env | cut -d= -f2-)
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

psql "$PIPE_URL" -At -F$'\t' -c \
  "select organization_id, website_url from organizations
   where website_url is not null and website_url <> ''" > "$WORK/input.tsv"

echo "checking $(wc -l < "$WORK/input.tsv") websites..."
python3 pipeline/validate.py < "$WORK/input.tsv" > "$WORK/results.tsv"

psql "$PIPE_URL" -v ON_ERROR_STOP=1 -q <<SQL
create temp table _results (organization_id uuid, ok boolean, http_status int, detail text);
\copy _results from '$WORK/results.tsv' with (format text, null '')

insert into link_checks (organization_id, lane, ok, http_status, detail)
select organization_id, 'validate', ok, http_status, nullif(detail,'') from _results;

insert into review_queue (organization_id, proposed_change, evidence, confidence, agent_lane)
select r.organization_id,
       jsonb_build_object('website_status', jsonb_build_object('from','assumed-live','to','dead')),
       jsonb_build_object('url', o.website_url, 'http_status', r.http_status, 'detail', r.detail,
                          'checked_at', now()),
       0.9, 'validate'
from _results r join organizations o using (organization_id)
where not r.ok;

insert into pipeline_runs (lane, finished_at, ok, stats)
values ('validate', now(), true, (
  select jsonb_build_object('checked', count(*), 'alive', count(*) filter (where ok),
                            'dead', count(*) filter (where not ok))
  from _results));

select 'alive: ' || count(*) filter (where ok) || ' / dead: ' || count(*) filter (where not ok)
       || ' / total: ' || count(*) from _results;
SQL
