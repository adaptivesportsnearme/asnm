#!/usr/bin/env bash
# Snapshot Postgres → JSON for the static site. Runs on the Hetzner box (where the DB lives);
# pipeline lanes call this after data changes so the public site stays current.
# Output: apps/web/public/data/programs.json (+ meta.json with counts and generated-at).
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="apps/web/public/data"
mkdir -p "$OUT"

sudo -u postgres psql -d asnm -At <<'SQL' > "$OUT/programs.json"
select coalesce(json_agg(p order by p->>'name'), '[]'::json)
from (
  select json_build_object(
    'id', o.organization_id,
    'name', o.organization_name,
    'type', o.organization_type,
    'website', o.website_url,
    'city', o.city,
    'state', o.state_province,
    'zip', o.zip,
    'quality', o.data_quality_rating,
    'verification', o.verification_status,
    'freshness', f.freshness_score,
    'lastChecked', f.last_ok_at,
    'sources', (select json_agg(s.source_name)
                from organization_data_sources ods
                join data_sources s using (source_id)
                where ods.organization_id = o.organization_id)
  ) as p
  from organizations o
  join org_freshness f using (organization_id)
  where o.is_public and o.status = 'active'
) sub;
SQL

sudo -u postgres psql -d asnm -At -c \
  "select json_build_object('programs', count(*), 'states', count(distinct state_province) filter (where state_province <> ''), 'sources', (select count(*) from data_sources), 'generatedAt', now())
   from organizations where is_public and status='active';" > "$OUT/meta.json"

echo "snapshot: $(wc -c < "$OUT/programs.json") bytes, meta: $(cat "$OUT/meta.json")"
