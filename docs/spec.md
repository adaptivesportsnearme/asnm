# Spec 06 — AdaptiveSportsNearMe.com v1: open directory + agent-maintained freshness

**Status:** approved · **Owner:** Alec · **Depends on:** — (independent of specs 01–05)
**Approved:** 2026-06-10 (Alec: "let's execute"; execution decisions 9–13 added same day)
**Part of:** [specs index](../README.md) · **Drafted:** 2026-06-10 (planning session with Alec)
**Code home:** `github.com/adaptivesportsnearme` (this spec is mirrored there when the repo is scaffolded; the AgentOS copy is the planning original)

## 1. Objective (WHAT and WHY — no HOW)

Ship the public v1 of **AdaptiveSportsNearMe.com**: a free, open, no-login national directory
of adaptive sports programs, seeded with the existing 2,095-organization dataset, kept accurate
by an LLM agent pipeline (validate → resolve → score) where **no agent change goes public
without human approval**, and where every listing **shows its freshness honestly**.

Why: 1 in 4 U.S. adults live with a disability and most never find an adaptive sports program —
not because programs don't exist (2,095 catalogued already) but because the information is
scattered, stale, or walled. Every incumbent either covers only its own members (Move United,
255 orgs), is a static unsearchable list (CAF), or requires login the moment you interact with
the data (Kelly Brush "Adaptive Rec Hub", ~600 programs, self-submitted and explicitly
unverified). Nobody offers verified, open, comprehensive, machine-readable coverage. That gap
is the product. (Evidence: [research.md](./research.md).)

This is Adapt To Life's flagship public work: **nonprofit, 100% to the community, agents run
the admin backstage.**

## 2. Decisions already made (Alec, 2026-06-10 — these are settled, not open)

1. **Builder:** Alec + his agents build v1 now. RCOS student involvement is a separate,
   optional track — the pitch stays live but nothing waits on it.
2. **Ship order:** both tracks — athlete-facing landing page with the two intake forms goes up
   fast; the directory MVP follows behind it. The RCOS pitch moves to a subpage, links preserved.
3. **Data home:** Postgres, via **Supabase** (managed Postgres + spreadsheet-style editor +
   auto-generated APIs + auth — Postgres without running a server).
4. **Launch bar:** show **all** organizations with an honest per-listing freshness/verification
   badge, rather than hiding unverified entries. The agent pipeline visibly raises quality over time.
5. **Entity & openness:** nonprofit (under Adapt To Life), MIT-licensed code, **dataset openly
   downloadable** with attribution. Open infrastructure is the differentiator, not just the site.
6. **Review queue:** Alec is the human gate at launch, approving via his existing agent flow;
   designed so Karen/volunteers can be added later.
7. **Why we build instead of partnering:** incumbents wall the data behind logins at the point
   of interaction. ASNM must be truly open — readable by humans with zero friction and by
   search engines *and LLMs* (being the source AI assistants cite is a stated goal).
8. **Governing docs:** the Jan 2026 "PRD v1" (search-first directory + education) governs product
   UX; the RCOS pitch governs the agent-pipeline framing. The Dec 2025 gamified PRD
   (Duolingo-style platform, shop, for-profit) is **superseded** and not part of v1.
9. **RCOS students** (Robin Corwin, Clara James) are active in the org's `Adaptive-Sports-Near-Me`
   repo. The production build lives in a **separate new repo** (`adaptivesportsnearme/asnm`) that
   the students can reference; agents never touch the students' repo. Their `DataFields.md`
   thinking is reconciled here, not overwritten (note: v1 has **no public user logins** — their
   Login table applies only to the admin review queue, via Supabase auth).
10. **Pipeline LLM spend:** a new OpenRouter API key (`asnm-pipeline`) under Alec's existing
    account with a **$25/month limit** — cost isolation without a new provider. Cadence sized to
    the cap: validate bi-weekly, resolve monthly after the initial pass, score daily (free, no LLM).
11. **Notifications: both channels** — Telegram (via Julia) for program submissions and new
    review-queue items; an email digest for routine freshness re-checks.
12. **Pitch site:** exported from Lovable into the repo at `/rcos` (export zip in Drive,
    2026-05-21; Alec confirms it's current).
13. **Database account:** Supabase project created by Alec via GitHub sign-in; credentials live
    in 1Password (`ASNM Supabase`), per the AGENTS.md secrets doctrine.

## 3. Design principles

- **Truly open.** No login, no paywall, no interaction wall — to read, search, or download.
  This is the one axis no incumbent will follow us on.
- **Honest staleness.** Freshness is computed, displayed, and its decay formula published.
  Trust comes from admitting what we don't know, not from pretending everything is current.
- **Human gate, always.** Agents propose; humans approve; only approved diffs mutate public
  data. Enforced in the schema, not by convention.
- **Findable by machines.** Server-rendered pages, Schema.org structured data, sitemap, bulk
  data endpoint. The parent at 11 PM may arrive via Google *or via an AI assistant* — both must
  find us.
- **Accessible, non-negotiably.** WCAG 2.1 AA minimum. The audience is disabled people; an
  inaccessible site here is mission failure, not a polish item.
- **Minimal machinery.** Managed services (Supabase, Vercel, GitHub Actions for schedules).
  No invented infra, no self-hosted services to babysit. (Same doctrine as AGENTS.md rule 6.)
- **Provenance preserved.** Every org keeps its source attribution (22 sources already mapped);
  every agent-proposed change carries evidence.

## 4. What exists today (inputs)

| Asset | Where | State |
|---|---|---|
| 2,095 orgs + provenance | Drive "Database v1": `organizations_transformed.csv`, `data_sources.csv`, junction CSV, SQL schema, ERD | Clean, sourced; **contact email/phone mostly missing**; 50/50 high/medium quality |
| RCOS pitch site | adaptivesportsnearme.com (built on Lovable) | Live at apex; must move to subpage |
| PRD v1 (Jan 2026) | Drive: "AdaptiveSportsNearMe.com PRD v1.docx" | Governs UX: search-first, inline program expansion, education content phases |
| GitHub org | github.com/adaptivesportsnearme | Exists, empty — v1 monorepo goes here |
| Airtable bases "ASNM" / "Adapt To Life" | Airtable | Empty stubs — **not** used for v1 canonical data |
| Reference datasets | Drive: WI School Directory (4,091 rows), YMCA list | Future enrichment, out of v1 |

## 5. Files to change (collision map)

In **this repo** (planning): `specs/06-adaptivesportsnearme/` (this folder), one row in
`specs/README.md`.

In the **product monorepo** (new — `adaptivesportsnearme/asnm`, MIT):

| Path | What | Track |
|---|---|---|
| `apps/web/` | Next.js site: landing + forms, search, program/sport pages, freshness badges, methodology page, admin review queue | A (landing) then B (directory) |
| `apps/web/app/rcos/` | Relocated pitch (exported from Lovable), redirects from old URLs | A |
| `db/` | Schema migrations + seed import scripts for the 2,095 orgs | B |
| `pipeline/` | Python agent lanes: `validate.py`, `resolve.py`, `score.py` (+ `discover.py` later) | C |
| `pipeline/queue/` | Review-queue writer — the only path by which agents touch data | C |
| `data/` | Seed CSVs (from Drive) + the public bulk-export artifact | B |
| `.github/workflows/` | Scheduled lane runs, link checks, axe/Lighthouse CI | C |

Tracks A/B/C decompose into `tasks.md` (with `[P]` markers and disjoint `Owns:` sets) once this
spec is `approved`.

## 6. Contracts / interfaces (locked before parallel build)

**Core tables** (full DDL derives from the existing Drive schema, trimmed to v1):
- `organizations` — id (uuid, keep existing), name, org_type, city, state, zip, lat/lng,
  website, email, phone, sports[], cost_note, equipment_provided, ages, description,
  `verification_status` (verified / pending / unverified), `last_checked_at`,
  `freshness_score` (computed), `is_public` (default true per launch-bar decision)
- `data_sources` + `organization_sources` — the 22-source provenance, imported as-is
- `review_queue` — id, organization_id (nullable for new-org proposals), `proposed_change`
  (field-level diff, JSON), `evidence` (URLs + agent reasoning), `confidence`, `agent_lane`,
  status (pending / approved / rejected), decided_by, decided_at
- `pipeline_runs` — lane, started/finished, counts, errors (the audit trail)
- `submissions` — the two public forms (launch interest; program submission → feeds review_queue)

**The one invariant:** public tables are mutated only by (a) an approved `review_queue` row or
(b) Alec directly. Agent DB credentials physically cannot write `organizations` — they write
`review_queue` and `pipeline_runs` only. (Same trust-boundary doctrine as AGENTS.md rule 7.)

**Freshness score (v1 default, owner-tunable):** exponential decay from last successful check —
`score = 100 × 0.5^(days_since_check / 45)` (half-life 45 days), floored at 5. Badges:
≥70 "Recently verified", 30–69 "Verified a while ago", <30 "Needs re-check" + auto-queued for
the validate lane. The formula is published on a public methodology page — surfacing staleness
honestly is the differentiator no incumbent matches.

**Open-data contract:** `GET /api/programs` (JSON, filterable by state/sport/zip-radius) and a
bulk `programs.csv`/`programs.json` download. License: **CC BY 4.0** (attribution to
AdaptiveSportsNearMe.com / Adapt To Life). Robots and llms.txt explicitly welcome crawlers.

## 7. Acceptance criteria (v1 is done when every line checks)

1. Landing page live at the apex domain; both forms (launch interest, program submission)
   write rows to Postgres and notify Alec; RCOS pitch reachable at its subpage with old links redirected.
2. All 2,095 organizations imported with provenance: row counts match the CSVs, and a random
   10-org spot check shows source attribution intact.
3. Searching a city/state/zip returns geo-filtered, server-rendered results; every program and
   sport page carries Schema.org structured data that passes Google's Rich Results test.
4. Every public listing displays its freshness badge; the methodology page documents the decay formula.
5. Bulk download + JSON API live, CC BY 4.0 stated.
6. Validate lane runs on a schedule end-to-end: checks website liveness for all orgs, records
   results in `pipeline_runs`, opens review-queue items for failures — and an audit query proves
   **zero** direct agent writes to `organizations`.
7. Resolve lane has run once over the full dataset and produced a ranked duplicate-merge
   candidate list with evidence; at least the top candidates are decided through the queue.
8. Alec can approve/reject queue items from his phone; an approval visibly updates the public listing.
9. Accessibility: axe-core scan reports 0 critical violations on home, search results, and a
   program page; the full search→contact flow works keyboard-only.
10. Lighthouse mobile performance ≥ 90 on home and search (the 11 PM parent is on a phone).

## 8. Validation plan

- `psql`-level: count checks vs. source CSVs; provenance join sample; the agent-write audit query.
- Kill a known org website (point a test row at a dead URL) → validate lane flags it → queue item
  appears → approve → badge changes publicly. This is the end-to-end smoke test of the whole loop.
- Submit both public forms as a stranger; confirm rows + notification.
- `axe` CLI + Lighthouse CI in `.github/workflows/`, run on every deploy, thresholds as in §7.
- Rich Results test + `curl` the API/bulk endpoints from a clean machine (no cookies/auth).

## 9. Decisions for Owner (defaults chosen — confirm or override at review)

1. **Dataset license** → *Default: CC BY 4.0* (attribution keeps ASNM visible when data is
   reused; CC0 is the more-open alternative). Note: the legal research lane (Feist, ToS risk of
   sourcing from other directories) did **not** complete verification — re-run before public
   bulk-data launch (see research.md caveats).
2. **Freshness decay numbers** → *Default: half-life 45 days, floor 5, re-check threshold <30.*
   Tune after the first month of validate-lane data.
3. **Review-queue surface** → **Resolved 2026-06-10:** minimal admin page in `apps/web`,
   Telegram notification for submissions/queue items, email digest for routine freshness items
   (decision 11). Airtable mirror only if Karen needs it.
4. **Education content (sport cards, guides — PRD v1 Phases 2–3)** → *Default: after directory
   MVP*, as v1.1. Directory + freshness is the wedge; content deepens it.
5. **Email list** → *Default:* form rows in Postgres now; Kit.com sync when Karen's marketing
   plan needs sends. Don't pay for tooling before there's a list.
6. **Discover lane (crawl for new programs)** → *Default: out of v1*, first post-launch
   addition — it's the riskiest lane and the directory must exist before discovery feeds it.
7. **Monorepo name** → **Resolved 2026-06-10:** `adaptivesportsnearme/asnm` (new repo; the
   students' repo and the empty `directory` repo are left untouched).
8. **SEO/distribution research** → re-run the unfinished lane (how athletes/PTs actually search;
   rehab/VA referral channels) when the claude.ai spend limit resets; fold into the v1.1 content plan.

## 10. Out of scope (deliberately)

- Gamification, streaks, curriculum, "Athlete's Path", the Shop, athlete accounts/profiles/reviews
  — the Dec 2025 PRD is **superseded** (decision 8); revisit only as future specs.
- Grants portal, events calendar, equipment marketplace (PRD v1 §3 "what this is NOT").
- CRM beyond the two intake forms — lives in [[Efforts/Adapt To Life CRM and Launch List]].
- WI School Directory + YMCA datasets — future enrichment sources for the discover lane.
- Any Hermes profile/config changes on this box — ASNM runs on its own managed infra.
- RCOS team logistics — separate conversation; nothing in v1 blocks on students.
