#!/usr/bin/env bash
# Snapshot Postgres → JSON for the static site. Runs on the Hetzner box (where the DB lives);
# pipeline lanes call this after data changes so the public site stays current.
# Output: apps/web/public/data/programs.json (+ meta.json with counts and generated-at).
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="apps/web/public/data"
mkdir -p "$OUT"

sudo -u postgres psql -d asnm -At <<'SQL' > "$OUT/programs.json"
with sportmap as (
  select organization_id,
    case
      -- sport-specific sources are most reliable
      when primary_data_source = 'NWBA Teams Directory' then 'Wheelchair Basketball'
      when primary_data_source = 'USA Hockey Sled Hockey' then 'Sled Hockey'
      when primary_data_source = 'Achilles International' then 'Running'
      when primary_data_source = 'USRowing' then 'Adaptive Rowing'
      when primary_data_source = 'USA Cycling' then 'Adaptive Cycling'
      when primary_data_source = 'USA Swimming' then 'Adaptive Swimming'
      when primary_data_source = 'USTA/ITF' then 'Wheelchair Tennis'
      when primary_data_source = 'USA Archery' then 'Archery'
      when primary_data_source = 'USA Volleyball' then 'Sitting Volleyball'
      when primary_data_source = 'USATF' then 'Track & Field'
      when primary_data_source = 'USA Martial Arts' then 'Martial Arts'
      when primary_data_source = 'BISFed USA' then 'Boccia'
      when primary_data_source = 'USA Shooting' then 'Shooting Sports'
      when primary_data_source = 'USPSA' then 'Shooting Sports'
      when primary_data_source = 'USA Fencing' then 'Wheelchair Fencing'
      when primary_data_source = 'USABA' then 'Blind Sports'
      -- then name keywords
      when organization_name ~* 'sled' then 'Sled Hockey'
      when organization_name ~* 'basketball' then 'Wheelchair Basketball'
      when organization_name ~* 'tennis' then 'Wheelchair Tennis'
      when organization_name ~* 'rugby' then 'Wheelchair Rugby'
      when organization_name ~* 'cycl|bike|biking' then 'Adaptive Cycling'
      when organization_name ~* '\mski|skiing|snowboard' then 'Adaptive Skiing'
      when organization_name ~* 'swim|aquatic' then 'Adaptive Swimming'
      when organization_name ~* 'golf' then 'Adaptive Golf'
      when organization_name ~* 'row(ing)?\M' then 'Adaptive Rowing'
      when organization_name ~* 'climb' then 'Adaptive Climbing'
      when organization_name ~* 'hockey' then 'Sled Hockey'
      when organization_name ~* 'equestrian|horse|riding' then 'Equestrian'
      when organization_name ~* 'sail' then 'Adaptive Sailing'
      when organization_name ~* 'surf' then 'Adaptive Surfing'
      when organization_name ~* 'dance|dancing' then 'Adaptive Dance'
      when organization_name ~* 'archery' then 'Archery'
      when organization_name ~* 'lacrosse' then 'Wheelchair Lacrosse'
      when organization_name ~* 'softball|baseball' then 'Adaptive Baseball'
      when organization_name ~* 'curling' then 'Wheelchair Curling'
      when organization_name ~* 'fish' then 'Adaptive Fishing'
      when organization_name ~* 'track|athletics' then 'Track & Field'
      else 'Multi-Sport'
    end as sport
  from organizations
)
select coalesce(json_agg(p order by p->>'name'), '[]'::json)
from (
  select json_build_object(
    'sport', sm.sport,
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
  join sportmap sm using (organization_id)
  where o.is_public and o.status = 'active'
) sub;
SQL

sudo -u postgres psql -d asnm -At -c \
  "select json_build_object('programs', count(*), 'states', count(distinct state_province) filter (where state_province <> ''), 'sources', (select count(*) from data_sources), 'generatedAt', now())
   from organizations where is_public and status='active';" > "$OUT/meta.json"

echo "snapshot: $(wc -c < "$OUT/programs.json") bytes, meta: $(cat "$OUT/meta.json")"
