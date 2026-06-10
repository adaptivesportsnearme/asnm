# AdaptiveSportsNearMe.com

**A free, open, no-login directory of adaptive sports programs across the United States — kept
accurate by an agent pipeline, gated by human review, honest about freshness.**

1 in 4 U.S. adults live with a disability. Most never find an adaptive sports program — not
because programs don't exist, but because the information is scattered, stale, or behind login
walls. This project is the missing public infrastructure: 2,095+ organizations catalogued from 22
sources, served openly to humans, search engines, and AI assistants alike.

## How it works

- **The site** (`apps/web`) — search-first, mobile-first, WCAG 2.1 AA. No accounts, no paywall.
- **The data** (`db/`, `data/`) — Postgres (Supabase). Every organization keeps its source
  provenance and a published freshness score that decays between re-checks. Bulk download and a
  JSON API, licensed **CC BY 4.0**.
- **The pipeline** (`pipeline/`) — agent lanes that validate links, resolve duplicates, and score
  freshness. **Agents only propose; nothing changes publicly without human approval** — enforced
  at the database-permission level, not by convention.

## Project docs

The governing spec, research evidence, and task decomposition live in [`docs/`](./docs/) —
read `docs/spec.md` first. RCOS students: this repo is the production reference implementation;
your repo and ours share the spec as common ground.

## Who

A project of **Adapt To Life** (nonprofit) — 100% to the community, 0% to admin.
Mentors: Karen Atkinson (Captain, US Army, Ret.) and Alec Tranel.
Code: MIT. Data: CC BY 4.0.
