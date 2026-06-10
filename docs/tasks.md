# Spec 06 — build tasks

Derived from [spec.md](./spec.md) (Status: approved). All `Owns:` paths are in the
`adaptivesportsnearme/asnm` repo unless prefixed. Rules per SPEC-STANDARD §5: `[P]` tasks may run
concurrently only with disjoint `Owns:` sets; contracts (T01) lock first and alone.

**Execution note (2026-06-10):** claude.ai spend limit is currently hit, so fan-out is unreliable —
run groups serially in-session until it clears; the decomposition still bounds each unit of work.

## Safe parallel groups

1. **T01** (alone — contracts)
2. **T02, T03, T07, T08** `[P]`
3. **T04, T05, T06, T09, T10** `[P]` (after their listed deps)
4. **T11** then **T12** (verification, alone)

External prerequisites (Alec): Supabase project + token in 1Password · OpenRouter `asnm-pipeline`
key ($25 cap) in 1Password · Vercel token in 1Password · Drive "Database v1" folder made
link-shareable (or files otherwise delivered) · confirm Lovable zip is current.

### T01 — Lock contracts: DB schema + API shapes
- **Owns:** db/migrations/, db/README.md, packages/shared/types.ts
- **Depends on:** Supabase project exists
- **Acceptance:** spec §6 tables migrate cleanly on a fresh database; freshness score implemented
  as a view over `last_checked_at` (half-life 45d, floor 5); a `pipeline` DB role exists whose
  grants exclude all writes to `organizations` (spec's one invariant); API response shapes for
  `/api/programs` documented in db/README.md.
- **Context:** spec §6 contracts; students' DataFields.md reconciled per spec §2.9.

### T02 — Import the 2,095 orgs with provenance  [P]
- **Owns:** db/import/, data/
- **Depends on:** T01; CSVs delivered from Drive
- **Acceptance:** spec §7.2 — row counts match CSVs; 10-row spot check shows source attribution;
  zip-centroid geocoding table loaded for radius search.

### T03 — Web scaffold + landing + intake forms  [P]
- **Owns:** apps/web/ (except app/rcos/, app/(directory)/, app/api/, app/admin/)
- **Depends on:** T01
- **Acceptance:** spec §7.1 — landing renders mobile-first; both forms write `submissions` rows;
  deployed to Vercel team project (vercel.app URL). DNS cutover excluded (Alec-gated).

### T04 — Mount pitch export at /rcos  [P]
- **Owns:** apps/web/app/rcos/
- **Depends on:** T03; Lovable zip confirmed
- **Acceptance:** pitch renders at /rcos; old deep links redirect.

### T05 — Directory pages  [P]
- **Owns:** apps/web/app/(directory)/
- **Depends on:** T01, T02, T03
- **Acceptance:** spec §7.3 + §7.4 — SSR geo search; program pages with freshness badge +
  provenance; sport index pages; methodology page publishes the decay formula; Schema.org markup
  passes Rich Results test.

### T06 — Open data + crawler surface  [P]
- **Owns:** apps/web/app/api/, apps/web/public/ (robots.txt, llms.txt), sitemap config
- **Depends on:** T01, T03
- **Acceptance:** spec §7.5 — `/api/programs` filterable JSON; bulk CSV/JSON download; CC BY 4.0
  stated; sitemap + robots + llms.txt served.

### T07 — Validate lane  [P]
- **Owns:** pipeline/validate.py, pipeline/common/
- **Depends on:** T01
- **Acceptance:** spec §7.6 — full liveness run writes `pipeline_runs`, failures open
  review-queue items; audit query shows zero `organizations` writes by the pipeline role.

### T08 — Resolve lane  [P]
- **Owns:** pipeline/resolve.py
- **Depends on:** T01 (runs against T02 data)
- **Acceptance:** spec §7.7 — blocking pass + LLM pair-match (OpenRouter `asnm-pipeline` key)
  produces ranked merge candidates with evidence in the queue; cost of full pass ≤ $10.

### T09 — Score recompute + schedules  [P]
- **Owns:** pipeline/score.py, .github/workflows/pipeline-*.yml
- **Depends on:** T01, T07
- **Acceptance:** GH Actions cron: validate bi-weekly, score daily, resolve monthly; secrets via
  repo secrets; a scheduled run has completed green.

### T10 — Review queue admin + notifications  [P]
- **Owns:** apps/web/app/admin/, pipeline/notify.py
- **Depends on:** T01, T03
- **Acceptance:** spec §7.8 — Alec approves/rejects from phone; approval applies the field diff
  and audits the decision; Telegram message on submissions/queue items; email digest for routine.

### T11 — Quality CI
- **Owns:** .github/workflows/quality.yml
- **Depends on:** T03, T05
- **Acceptance:** spec §7.9 + §7.10 — axe: 0 critical on home/search/program; Lighthouse mobile
  ≥ 90 on home + search; runs on every deploy.

### T12 — Verification (no [P], last)
- **Owns:** — (read-only against production)
- **Depends on:** all
- **Acceptance:** every spec §7 criterion checked against the live site; §8 dead-link smoke test
  end-to-end (break → queue → approve → public badge updates). On pass: spec → `built`.
