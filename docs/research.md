# Research annex — competitive + technical evidence for Spec 06

Deep-research run, 2026-06-10 (105 agents, adversarial 3-vote verification per claim).
All web fetches are snapshots of that date; re-verify competitive facts at build time.

## Verified findings (survived adversarial verification)

| Confidence | Finding |
|---|---|
| High (3-0) | KBF's Active Project rebranded to **"Adaptive Rec Hub"** (adaptiverechub.org, 301 from old URL). Free, **no login to browse** programs (~600 claimed) with sport/zip-radius/equipment/age filters; program pages publicly crawlable. Sign-in gates only community features (messaging, classifieds, forums). It is the closest competitor — count it as KBF, not a new entrant. *(Alec's experience: interacting with the data prompts login — treat read-vs-interact friction as their wall.)* |
| Medium (2-1) | Adaptive Rec Hub adds orgs via a **Google Form**, with **no documented verification, dedup, or staleness process, no API, no data licensing**. Their own disclaimer: listings "are provided by individual users and are not endorsed or verified by the Kelly Brush Foundation." The freshness/quality niche is conceded. |
| High (3-0) | **Move United**: 255 member orgs in 45 states (count fluctuates 245→255 across their materials). Locator lists **dues-paying members only** — network strength, not coverage. A claim that their locator is JS-rendered/hard to crawl was **refuted 0-3**; don't assume it. |
| High (3-0) | **CAF directory**: static alphabetical HTML list (~500+ orgs, more than the 300 first estimated), no filters/map/API, browser-text-search only. No login wall. A claim it was last reviewed July 2023 was **refuted 0-3**. |
| High | **Zero-shot LLM entity resolution works** (EDBT 2025, peer-reviewed): GPT-4 with no task-specific training beats fine-tuned PLM matchers (Ditto) on 3 of 4 benchmarks (89.61 vs 84.90 F1 on WDC Products), and fine-tuned matchers collapse 22–61% F1 on unseen entities while GPT-4 holds. Exactly the property a growing org directory needs — no labeled training set required for the resolve lane. Caveat: benchmarks are e-commerce/bibliographic, not org records; tested model was gpt4-0613 (older than current). |
| Medium (3-0, single source) | **MERAI** (Commonwealth Bank, arXiv 2025): classical-ML dedup (XGBoost over Magellan string-similarity features) in production over ~17M records — the cheap non-LLM fallback, but it needs labeled data, which we don't have. |

## Bottom line for the spec

No open, comprehensive, API-accessible national directory exists as of mid-2026. ASNM's
2,095 orgs would exceed every incumbent's coverage on day one, and the verification/freshness/
openness axis is exactly where the closest incumbent disclaims responsibility. The resolve
lane's core technique is peer-review-validated.

## Unverified — re-research before relying on (spend limit killed verification mid-run)

- **Legal lane (entire)**: Feist v. Rural (facts not copyrightable — plausible, uncited),
  ToS risk of sourcing from incumbent directories, attribution norms, ADA/WCAG legal
  obligations for the site itself. **Blocker check before the public bulk-data endpoint ships.**
- **Distribution lane (entire)**: how athletes/families/PTs actually search, Schema.org local-SEO
  evidence, rehab-hospital/VA referral channels, why nonprofit directories get abandoned.
- **Link-rot tooling**: lychee / lychee-action / InternetArchiveBot prior art, Pew web-decay
  baselines — plausible building blocks for the validate lane, currently uncited.
- **Freshness/decay scoring schemes**: no validated prior art found — our §6 formula is a
  reasonable invention, not an adopted standard; tune with real data.
