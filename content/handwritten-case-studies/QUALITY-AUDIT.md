# Handwritten case studies — quality audit

**Date:** 2026-06-03  
**Status:** Ready for deploy prep (`npm run cms:prepare-deploy`).

## Summary

| Check | Result |
|-------|--------|
| English projects with handwritten HTML | **132/132** |
| Word count ≥3000 | Pass (`npm run cms:verify-handwritten-words`) |
| No `review cycle` FAQ padding | Pass |
| Product cadence (3–10/month, not nightly plant wash) | Pass |
| No client names | Pass (`npm run cms:verify-projects-no-clients`) |
| Authors | Deterministic pool from `author-profiles.json` (`cms:assign-project-authors`) |
| Duplicate slug URLs | Unpublished + 301 in `next.config.ts` |

## Deploy

See `docs/PRE-DEPLOY-CHECKLIST.md`.

## Editorial notes (non-blocking)

- Tier-3 files may include one “Operations evidence summary” top-up block (deduped by `clean-handwritten-topup-duplicates.mjs`).
- Tier-2/3 share some structural closings across cohorts; stats and peers are site-specific.
