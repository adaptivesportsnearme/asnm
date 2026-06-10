-- 0001_init.sql — core schema for AdaptiveSportsNearMe v1 (spec docs/spec.md §6)
-- Plain Postgres only: portable to Supabase/any managed PG by changing the connection string.

begin;

create table if not exists data_sources (
  source_id            text primary key,
  source_name          text not null,
  source_organization  text,
  source_url           text,
  source_type          text,
  coverage_scope       text,
  data_quality_rating  text,
  record_count         integer,
  status               text
);

create table if not exists organizations (
  organization_id            uuid primary key,
  organization_name          text not null,
  organization_type          text,
  website_url                text,
  email                      text,
  phone                      text,
  city                       text,
  state_province             text,
  zip                        text,
  country                    text default 'United States',
  lat                        double precision,
  lng                        double precision,
  description                text,
  sports                     text[],
  cost_note                  text,
  equipment_provided         boolean,
  ages                       text,
  data_quality_rating        text,
  primary_data_source        text,
  nwba_division              text,
  move_united_member_type    text,
  paralympic_sport_club      boolean default false,
  special_olympics_affiliate boolean default false,
  verification_status        text not null default 'unverified'
                             check (verification_status in ('verified','pending','unverified')),
  verification_method        text,
  status                     text not null default 'active',
  is_public                  boolean not null default true,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);
create index if not exists organizations_state_idx on organizations (state_province);
create index if not exists organizations_zip_idx   on organizations (zip);

create table if not exists organization_data_sources (
  org_source_id        text primary key,
  organization_id      uuid not null references organizations(organization_id),
  source_id            text not null references data_sources(source_id),
  data_quality_rating  text,
  date_added           date,
  verification_status  text
);
create index if not exists ods_org_idx on organization_data_sources (organization_id);

-- Pipeline lanes record evidence here; organizations.last-checked state DERIVES from this table,
-- so agents never need write access to organizations (the spec's one invariant).
create table if not exists link_checks (
  id              bigint generated always as identity primary key,
  organization_id uuid not null references organizations(organization_id),
  lane            text not null,
  checked_at      timestamptz not null default now(),
  ok              boolean not null,
  http_status     integer,
  detail          text
);
create index if not exists link_checks_org_idx on link_checks (organization_id, checked_at desc);

create table if not exists pipeline_runs (
  id          bigint generated always as identity primary key,
  lane        text not null,
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  ok          boolean,
  stats       jsonb,
  error       text
);

create table if not exists review_queue (
  id              bigint generated always as identity primary key,
  organization_id uuid references organizations(organization_id),  -- null = proposal for a new org
  proposed_change jsonb not null,   -- field-level diff {field: {from, to}}
  evidence        jsonb,            -- urls + agent reasoning
  confidence      real,
  agent_lane      text not null,
  status          text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at      timestamptz not null default now(),
  decided_by      text,
  decided_at      timestamptz,
  applied_at      timestamptz
);
create index if not exists review_queue_status_idx on review_queue (status, created_at);

-- The two public intake forms.
create table if not exists submissions (
  id         bigint generated always as identity primary key,
  kind       text not null check (kind in ('interest','program')),
  payload    jsonb not null,
  created_at timestamptz not null default now(),
  processed  boolean not null default false
);

-- Freshness: published decay formula (spec §6) — half-life 45 days from last successful check,
-- floor 5. Never-checked orgs get NULL (badge: "Needs re-check"). Computed, never stored.
create or replace view org_freshness as
select o.organization_id,
       lc.last_ok_at,
       case when lc.last_ok_at is null then null
            else greatest(5, (round(100 * power(0.5,
                 extract(epoch from (now() - lc.last_ok_at)) / 86400.0 / 45)))::int)
       end as freshness_score
from organizations o
left join (
  select organization_id, max(checked_at) as last_ok_at
  from link_checks where ok
  group by organization_id
) lc using (organization_id);

commit;
