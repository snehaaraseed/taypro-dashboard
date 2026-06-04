# Hand-written case studies (SEO editorial)

Each `{slug}.html` is **unique human-authored copy** for CMS — not the bulk template.

## Requirements per file

- **Read `EDITORIAL-PRODUCT-FACTS.md` first** — GLYDE/GLYDE-X use NECTYR **weather-aware scheduled cycles** (typically ~3–10/month, not “every night”); semi-automatic uses **weekly block plans**
- **3,000+ words** (verify: `npm run cms:verify-handwritten-words`)
- **Statistics** from Excel (MW, robots, water, MWh, CO₂, robots/MW) in prose and tables
- **Internal links** to products, calculator, methodology, project hub/category pages, and 2–4 peer case studies
- **No client / IPP names**
- Body: **h2 / h3 only** (page title = H1). Render adds up to 8 more internal links automatically.

## Tier 1 (≥150 MW)

| Slug | MW | Words target |
|------|-----|----------------|
| `akhadana-rajasthan-360-mw` | 360 | 3000+ |
| `bachau-dvc-gujrat-300-mw` | 300 | 3000+ |
| `bhadlarajasthan-300-mw` | 300 | 3000+ |
| `neneva-gujrat-250-mw` | 250 | 3000+ |
| `agar-solar-project` | 200 | 3000+ |
| `seci-2-200-mw` | 200 | 3000+ |
| `chhayan-rajasthan-150-mw` | 150 | 3000+ |

## Tier 2 (70–100 MW in workbook band)

| Slug | MW | Mode |
|------|-----|------|
| `soyegaon-solar-project` | 100 | Mixed 54+36, NECTYR |
| `banda-solar-project` | 70 | Mixed 106+54, NECTYR |
| `kmf-karnataka-75-mw` | 75 | Automatic 85, NECTYR |
| `panshina-gujrat-75-mw` | 75 | Mixed 91+3, NECTYR |
| `seci-phase-1gujrat-75-mw` | 75 | Automatic 71, NECTYR |
| `seci-phase-2gujrat-75-mw` | 75 | Semi-automatic NYUMA, inspection-led |

Generate tier 2: `npm run cms:generate-tier2-handwritten` (no FAQ padding).

## Tier 3 (50–60 MW priority batch)

| Slug | MW | Mode |
|------|-----|------|
| `yadgir-solar-project-50-mw` | 50 | Mixed 96+19, NECTYR |
| `deoria-60-mw` | 60 | Semi-automatic (low robots/MW; validate scope) |
| `prayagraj-uttar-pradesh-50-mw` | 50 | Automatic 52, NECTYR |
| `maya-gujrat-50-mw` | 50 | Mixed 44+50, NECTYR |
| `khanak-50-mw` | 50 | Semi-automatic 10 portables |
| `seci-1-50-mw` | 50 | Mixed 44+50, NECTYR |

Generate + apply: `npm run cms:remediate-tier3-handwritten`

## Tier 3 batch 2 (10–25 MW and micro-utility)

| Slug | Reported MW | Mode |
|------|-------------|------|
| `rajkot-gujrat-25-mw` | 25 | Mixed 51+3, NECTYR |
| `chennai-10-mw` | 10 | Semi-automatic 2 portables |
| `yavatmal-kupti-14-mw` | 14 | Semi-automatic 5 portables |
| `nathdwara-74-mw` | 7.4 | Semi-automatic 3 portables |
| `haryana-149-mw` | 14.9 | Semi-automatic (validate scope) |
| `khopoli-25-mw` | 2.5 | Automatic 16 GLYDE, NECTYR |
| `chakan-vi-25-mw` | 2.5 | Automatic 12 GLYDE, NECTYR |
| `sungazing-25-mw` | 2.5 | Semi-automatic 5 portables |

Note: some CMS slugs include `25-mw` while the reported nameplate is 2.5&nbsp;MW—copy uses workbook/CMS nameplate.

## Tier 3 batch 3 (10 MW cluster)

| Slug | MW | Mode |
|------|-----|------|
| `nayveli-10-mw` | 10 | Automatic 3 GLYDE, NECTYR |
| `nashik-shinde-10-mw` | 10 | Semi-automatic 4 portables |
| `sangali-kontya-bobladtikondi-10-mw` | 10 | Semi-automatic 4 portables |
| `ahmadnagar-masale-10-mw` | 10 | Semi-automatic 4 portables |
| `ahmadnagar-kharda-10-mw` | 10 | Semi-automatic 4 portables |
| `ahmadnagar-jalalpur-10-mw` | 10 | Semi-automatic 4 portables |
| `ahmadnagar-balwandi-10-mw` | 10 | Semi-automatic 4 portables |
| `ahmadnagar-nanduri-dumala-10-mw` | 10 | Semi-automatic 4 portables |

## Tier 3 batch 4 (micro-utility + 7–9 MW Maharashtra)

| Slug | Reported MW | Mode |
|------|-------------|------|
| `sonar-bangla-14-mw` | 1.4 | Semi-automatic 1 portable |
| `dakuni-14-mw` | 1.4 | Semi-automatic 1 portable |
| `mangrol-12-mw` | 1.2 | Semi-automatic 2 portables |
| `apex-nagpur-13-mw` | 1.3 | Automatic 5 GLYDE, NECTYR |
| `nashik-satyagaon-9-mw` | 9 | Semi-automatic 4 portables |
| `nashik-dongagaon-8-mw` | 8 | Semi-automatic 3 portables |
| `nashik-kolam-bk-8-mw` | 8 | Semi-automatic 3 portables |
| `dharashiv-naldurg-8-mw` | 8 | Semi-automatic 3 portables |
| `ahmadnagar-sasewadi-8-mw` | 8 | Semi-automatic 3 portables |
| `sangali-kognoli-9-mw` | 9 | Semi-automatic 4 portables |
| `sangali-palaskhel-9-mw` | 9 | Semi-automatic 4 portables |
| `solapur-gulwanchi-7-mw` | 7 | Semi-automatic 3 portables |

## Tier 3 batch 5 (6–9 MW + micro)

| Slug | Reported MW | Mode |
|------|-------------|------|
| `sangali-benapurarenavi-9-mw` | 9 | Semi-automatic 4 portables |
| `ahmadnagar-takali-dhokeshwar-9-mw` | 9 | Semi-automatic 4 portables |
| `nashik-hiswal-bk-7-mw` | 7 | Semi-automatic 3 portables |
| `beed-babhal-gaon-7-mw` | 7 | Semi-automatic 3 portables |
| `hingoli-shiwani-bk-6-mw` | 6 | Semi-automatic 3 portables |
| `ahmadnagar-mandavgan-8-mw` | 8 | Semi-automatic 3 portables |
| `ahmadnagar-nagalwadi-8-mw` | 8 | Semi-automatic 3 portables |
| `yavatmal-ghonsi-7-mw` | 7 | Semi-automatic 2 portables |
| `thakkar-chemical-1-mw` | 1 | Semi-automatic 1 portable |
| `thakkar-cotton-1-mw` | 1 | Semi-automatic 1 portable |
| `chakan-vii-2-mw` | 2 | Automatic 9 GLYDE, NECTYR |
| `hariwansh-nagpur-07-mw` | 0.7 | Automatic 3 GLYDE, NECTYR |

## Tier 3 batch 6 (5 MW cluster + 6 MW + micro automatic)

| Slug | Reported MW | Mode |
|------|-------------|------|
| `muddapur-5-mw` | 5 | Semi-automatic 1 portable |
| `yavatmal-sawana-5-mw` | 5 | Semi-automatic 2 portables |
| `yavatmal-adegaon-5-mw` | 5 | Semi-automatic 2 portables |
| `yavatmal-mhasola-5-mw` | 5 | Semi-automatic 2 portables |
| `sangli-madgyal-5-mw` | 5 | Semi-automatic 2 portables |
| `sangali-bhagyanagarbhakuchwadi-5-mw` | 5 | Semi-automatic 2 portables |
| `snagali-belondgi-bellundagi-5-mw` | 5 | Semi-automatic 2 portables |
| `ahmadnagar-ranjanwadi-5-mw` | 5 | Semi-automatic 2 portables |
| `yavatmal-dhanorakh-6-mw` | 6 | Semi-automatic 3 portables |
| `ahmadnagar-supa-6-mw` | 6 | Semi-automatic 3 portables |
| `nashik-boygaon-6-mw` | 6 | Semi-automatic 3 portables |
| `bhusawal-06-mw` | 0.6 | Automatic 4 GLYDE, NECTYR |
| `bhuldhana-1-mw` | 1 | Automatic 2 GLYDE, NECTYR |

## Tier 3 batch 7 (remaining 5–7 MW + micro)

| Slug | Reported MW | Mode |
|------|-------------|------|
| `sangali-karewadi-5-mw` | 5 | Semi-automatic 2 portables |
| `sangali-morale-ped-5-mw` | 5 | Semi-automatic 2 portables |
| `sangali-shirasgaon-5-mw` | 5 | Semi-automatic 2 portables |
| `sangali-madgule-5-mw` | 5 | Semi-automatic 2 portables |
| `sangali-lingivare-5-mw` | 5 | Semi-automatic 2 portables |
| `ahmadnagar-najik-chincholi-5-mw` | 5 | Semi-automatic 2 portables |
| `ahmadnagar-nimgaon-5-mw` | 5 | Semi-automatic 2 portables |
| `ahmadnagar-gunore-5-mw` | 5 | Semi-automatic 2 portables |
| `ahmadnagar-kelwad-bk-5-mw` | 5 | Semi-automatic 2 portables |
| `sangali-asangi-jat-6-mw` | 6 | Semi-automatic 3 portables |
| `ahmadnagar-karhe-6-mw` | 6 | Semi-automatic 3 portables |
| `ahmadnagar-sakegaon-6-mw` | 6 | Semi-automatic 3 portables |
| `yavatmal-undarni-7-mw` | 7 | Semi-automatic 3 portables |
| `ahmadnagar-velapur-7-mw` | 7 | Semi-automatic 3 portables |
| `parliament-delhi-07-mw` | 0.7 | Semi-automatic 2 portables |
| `vasai-05-mw` | 0.5 | Semi-automatic 1 portable |
| `satara-05-mw` | 0.5 | Automatic 12 GLYDE, NECTYR |

## Tier 3 batch 8 (final 43 — full English CMS coverage)

Merged from `scripts/lib/handwritten-tier3-remaining.mjs`: Yavatmal 1–4&nbsp;MW cluster, remaining Ahmadnagar/Sangli five-megawatt, six- and seven-megawatt gaps, micro sites, Bhandari 3&nbsp;MW, duplicate mega slugs (`akhadana-360-mw`, `bhadla-300-mw` → point to tier-1 canonical slugs), malformed slugs (`-12-mw`, `-03-mw`) with validate-in-diligence notes.

## Commands

```bash
npm run cms:verify-handwritten-words
npm run cms:apply-handwritten-case-studies
npm run cms:verify-projects-no-clients
```
