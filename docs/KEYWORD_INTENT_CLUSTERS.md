# Keyword intent clusters

One target keyword can support **multiple blogs** only when each post serves a **different search intent**. Otherwise Google treats them as duplicate content or keyword cannibalization.

## Five B2B intent families

| ID | Intent | Reader question |
| --- | --- | --- |
| `technical_howto` | Technical how-to & process | How do I implement this safely on my plant? |
| `financial_roi` | Financial & ROI | What is payback / OPEX vs CAPEX impact? |
| `risk_compliance` | Risk & compliance | Will this void warranties or damage modules? |
| `comparison_alternative` | Comparison & alternatives | Why choose this over what we do today? |
| `troubleshooting_problem` | Troubleshooting | Why is my setup failing and how does this fix it? |

## How the system tracks intents

- **Registry file:** `data/seo-keyword-intent-registry.json`
- **On each automated publish:** `{ keyword, intentFamily, angleId, title, slug, writtenAt }` is appended.
- **Intent selection (hybrid):** AI declares `intentFamily` in the outline plan and hybrid title pick; code validates it against covered intents and falls back to angle/title inference when AI would cannibalize.
- **On cron start:** existing `published_topics` rows are backfilled if missing from the registry.
- **On keyword pick:** coverage ledger prefers angles whose intent family is not yet covered for that keyword.
- **On outline/write:** Gemini receives `COVERED INTENTS` + `RECOMMENDED INTENT` in the prompt (`keyword-intent-registry.ts`).

## Pillar / spoke model

Use a pillar page (product or hub) for the broad keyword. Each spoke blog targets one intent family and links back to the pillar with descriptive anchor text.

## Code

- Taxonomy & inference: `src/lib/seo/keyword-intent-taxonomy.ts`
- Registry I/O: `src/lib/seo/keyword-intent-registry.ts`
