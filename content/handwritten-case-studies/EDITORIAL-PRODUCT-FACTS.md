# Editorial facts from taypro.in (use when writing case studies)

Read these pages before writing: `/cleaning-technology`, `/performance-methodology`, `/solar-panel-cleaning-system/*` product pages, `/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app` (NECTYR / Taypro Console).

## Do not write

- “Robots clean every night” or “daily automatic washing” for the full plant
- Implying every module is brushed on a 24-hour cadence
- Ignoring rain/wind stand-downs

## Do write

### GLYDE (automatic ground mount)

- Permanently assigned to an array + docking station; self-deploys at **scheduled** time
- **Dual-pass** waterless cycle per run (~99%+ dust removal per completed cycle — see performance methodology)
- **NECTYR**: AI/ML scheduling uses **weather + plant signals**; skip unnecessary runs in rain; wind holds
- Cleaning windows: typically **post-sunset / pre-sunrise**, block-wise timers — not peak generation hours
- **Cadence**: plant-specific; OPEX studies often cite **~3–10 dry cycles/month**, denser in dust season (e.g. 6–10), lighter in quiet months (e.g. 3–4) — see cleaning-service / Taypro Console copy

### GLYDE-X (tracker)

- Tracker-aware; stow/production schedules matter; NECTYR + weather context
- Same “scheduled cycle, not daily blanket coverage” discipline

### NYUMA / HELYX (semi-automatic)

- Operator-led placement per row; **weekly block plans** + inspection evidence
- Waterless brushing; weather/wind holds still apply
- Akhadana/Bhadla-style sites may lack NECTYR as primary layer — inspection sheets prove completion

### Mixed fleets

- GLYDE automatic = scheduled NECTYR cycles on repeatable rows
- Semi-automatic = portable coverage on irregular blocks — also **planned**, not random daily labour

### Internal links (examples)

- `/cleaning-technology` — AI scheduling, weather pause/resume
- `/performance-methodology` — 99%+ per cycle definition
- `/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app` — NECTYR
- `/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system` — GLYDE
- `/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system` — HELYX
- `/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers` — GLYDE-X
