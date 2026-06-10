#!/usr/bin/env bash
# Import the founding dataset (data/seed/) into the asnm database. Idempotent: truncates first.
# Run: sudo ./db/import/seed.sh
set -euo pipefail
cd "$(dirname "$0")/../.."

sudo -u postgres psql -d asnm -v ON_ERROR_STOP=1 <<SQL
truncate organization_data_sources, organizations, data_sources restart identity cascade;

\copy data_sources (source_id,source_name,source_organization,source_url,source_type,coverage_scope,data_quality_rating,record_count,status) from 'data/seed/data_sources.csv' csv header

\copy organizations (organization_id,organization_name,organization_type,website_url,city,state_province,country,data_quality_rating,primary_data_source,nwba_division,move_united_member_type,paralympic_sport_club,special_olympics_affiliate,verification_method,status) from 'data/seed/organizations_transformed.csv' csv header

\copy organization_data_sources (org_source_id,organization_id,source_id,data_quality_rating,date_added,verification_status) from 'data/seed/organization_data_sources.csv' csv header

select 'data_sources' as table, count(*) from data_sources
union all select 'organizations', count(*) from organizations
union all select 'organization_data_sources', count(*) from organization_data_sources;
SQL
