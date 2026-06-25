/** Site-specific editorial expansions (unique prose per slug). */

export const extrasPass2 = {
  "akhadana-rajasthan-360-mw": `
<h2>Dust-season war room: how eighty portables stay on schedule</h2>
<p>March through June at Akhadana is not a single “cleaning campaign”—it is a weekly war room where supervisors reconcile weather forecasts, crew availability, spare brush inventory, and inverter trend flags. Because telematics were not the primary layer at launch, the war room runs on paper and spreadsheets that must be as disciplined as NECTYR dashboards: every block has a named owner, every missed night has a reschedule date, and every partial pass is recorded honestly.</p>
<p>Downwind berms and haul-road strings are cleaned first not because they are easiest but because SCADA shows they pay back fastest. Interior blocks enter the queue when marginal MWh per pass remains above the threshold owners set with finance. That threshold should be documented—if it is oral, robot programmes lose budget the first time curtailment compresses hours.</p>
<p>Technicians carry spare brush sets in support vehicles sized for eighty machines, not for a pilot of five. A single worn brush on a downwind string can cost more MWh than a week of interior passes skipped—supervisors treat brush wear as fleet risk, not consumable noise.</p>

<h2>Upgrading from inspection-led ops to fleet dashboards</h2>
<p>Owners reading this case study in 2026 may upgrade Akhadana with <a href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app">NECTYR</a> without replacing NYUMA hardware. The upgrade path is easier when inspection sheets already list block IDs consistently—dashboards amplify discipline that exists; they do not create discipline from chaos.</p>
<p>When comparing upgrade ROI, model supervisor hours saved and faster root-cause meetings, not only “digital transformation” language. Pair upgrades with <a href="/performance-and-test-methodology">performance methodology</a> acceptance tests on a pilot block before plant-wide rollout.</p>

<h2>Lender diligence questions unique to 360&nbsp;MW semi-automatic</h2>
<p>Lenders ask how eighty machines cover 360&nbsp;MW without pretending every module is touched nightly. Akhadana’s answer is prioritised coverage with signed evidence—not robot count alone. Provide cycle schedules, inspection samples, and SCADA charts showing PR recovery on downwind blocks after cycles complete.</p>
<p>Also document wind hold policies and night traffic plans near inverter yards. Robotics should reduce human exposure on modules during peak radiation; training records belong in the evidence pack alongside water and GWh statistics.</p>
`,
  "bhadlarajasthan-300-mw": `
<h2>Phased capital: forty portables as tranche one</h2>
<p>Bhadla’s forty semi-automatic machines are best understood as tranche one of a multi-year O&amp;M strategy—not the final word on autonomy. Tranche one proves waterless coverage and PR stability while civil teams mature paths for potential automatic expansion. Finance should capex tranche one on its own merits: <strong>42&nbsp;million litres</strong>, <strong>11.25&nbsp;GWh</strong>, and <strong>5,580&nbsp;tCO₂e</strong> with inspection discipline.</p>
<p>Tranche two—if pursued—should be justified by row repeatability maps and NECTYR pilot data, not by competitor press releases from automatic-only peers.</p>

<h2>High-insolation stress on brushes and drives</h2>
<p>Bhadla’s irradiance accelerates brush wear and thermal stress on drives. PM calendars must be local, not generic. Store brush batches for March–June; track repeat fault codes per machine; retire assets when idle minutes rise without weather cause.</p>

<h2>SCADA workshops owners should run monthly</h2>
<p>Pair inverter loading snapshots with inspection timestamps. If a block was signed clean and PR remains soft, run a five-why with brush, coverage, and equipment hypotheses before blaming weather. Workshops keep robotics budgets defensible during annual reviews.</p>
`,
  "neneva-gujrat-250-mw": `
<h2>Stow-aware cleaning windows on single-axis tables</h2>
<p>Tracker plants introduce stow conflicts that ground-mount peers ignore. GLYDE-X schedules must align with tracker OEM guidance and night windows where stow positions permit safe brush contact. NECTYR should log stow holds separately from wind holds so month-end reviews stay honest.</p>
<p>Owners comparing <a href="/projects/bachau-dvc-gujrat-300-mw">ground-mount automatic density</a> must normalize for tracker availability and stow seasonality in the same SCADA narrative as soiling recovery.</p>

<h2>Why ten machines still demand enterprise discipline</h2>
<p>Low robot count raises the cost of every idle hour. Supervisors run weekly KPI reviews on completion and faults; spares are pre-positioned before March–June; training includes tracker-specific fault trees. Treat each GLYDE-X unit as high-value capital—not a pilot toy.</p>

<h2>Finance stress tests for 9.38&nbsp;GWh</h2>
<p>Model <strong>9.38&nbsp;GWh</strong> at 50% and 75% attribution; include consumables and stow-related downtime. Link outcomes to <a href="/solar-panel-cleaning-robot-price-calculator#calculator">calculator</a> inputs only after local PR baselines are agreed.</p>
`,
  "seci-2-200-mw": `
<h2>Automatic crew and semi-automatic crew as one team</h2>
<p>SECI-2 fails operationally when automatic and semi-automatic teams become silos. Rotation weeks where portable technicians shadow autonomic supervision—and vice versa—keep the 103/76 split coherent. Handover maps must show which blocks are automatic-only versus portable-required so night crews do not argue on radio.</p>

<h2>Irregular blocks: switchyard-adjacent and transition zones</h2>
<p>Mixed fleets exist because irregular blocks exist. SECI-2 should document those blocks explicitly in procurement packs—finance then understands why semi-automatic capital is insurance, not duplication.</p>

<h2>NECTYR alerts that matter at 179-machine scale</h2>
<p>Filter alerts to completion misses, repeat faults, and abnormal idle trends—not every telemetry blip. Weekly meetings review the same four KPIs as <a href="/projects/bachau-dvc-gujrat-300-mw">Bachau</a>: blocks/night, idle minutes, wind holds, faults per pass volume.</p>
`,
  "chhayan-rajasthan-150-mw": `
<h2>Scaling lessons toward 200–300&nbsp;MW</h2>
<p>Chhayan owners planning expansion should decide early whether the next tranche is more GLYDE automatic density or semi-automatic insurance for irregular blocks—study <a href="/projects/seci-2-200-mw">SECI-2 mixed</a> before assuming automatic-only scaling.</p>

<h2>2024 commissioning: NECTYR habits from week one</h2>
<p>Plants that start with NECTYR avoid retraining supervisors later. Chhayan’s habit is weekly KPI review tied to inverter meetings—blocks completed, idle minutes, wind holds, repeat faults. Smaller fleets surface problems faster; use that advantage.</p>

<h2>Water and labour narrative for mid-scale Rajasthan</h2>
<p><strong>21&nbsp;million litres</strong> avoided is material at 150&nbsp;MW in water-stressed belts. Pair water slides with labour stability and <strong>5.63&nbsp;GWh</strong> attribution scenarios in finance packs—not water alone.</p>
`,
};

export const extrasPass3 = {
  "agar-solar-project": `
<h2>Documenting the 265:7 split for external reviewers</h2>
<p>External reviewers should receive a block map colour-coded by automatic versus semi-automatic responsibility, plus sample NECTYR exports and semi-automatic inspection sheets for the same week. Agar’s credibility comes from cross-checking both systems—not from treating seven portables as an afterthought.</p>
`,
  "bachau-dvc-gujrat-300-mw": `
<h2>172-machine fleet cartography and docking strategy</h2>
<p>Every automatic programme stands or falls on docking cartography. Bachau’s 172 GLYDE units require hubs placed to minimise deadhead while respecting inverter-yard safety buffers. When civil teams add berms or shift roads, cartography updates before the next production night—otherwise NECTYR shows completion on geometry that no longer exists.</p>
<p>Supervisors maintain a living map layer tied to block IDs finance recognises, so generation attribution workshops do not debate which “area” was cleaned. Cartography reviews occur monthly in dust season, quarterly otherwise.</p>
<p>Training modules include map reading for new technicians—without map literacy, automatic fleets revert to informal night habits that break audit trails.</p>
`,
  "akhadana-rajasthan-360-mw": `
<h2>Row-kilometre planning workshops</h2>
<p>Procurement committees should host a row-kilometre workshop before approving robot counts. Akhadana’s eighty portables were approved after prioritising downwind and road-facing row kilometres with the steepest historical PR slopes—not after dividing 360&nbsp;MW by a marketing factor. Workshop outputs become appendix material in lender packs.</p>
<p>Workshop attendees include O&amp;M, civil, and finance so docking and staging decisions are not siloed in engineering alone.</p>
<h2>Brush economics at mega-scale without telematics</h2>
<p>Without fleet dashboards as the primary layer, brush economics must be visible in inspection sheets: brush ID, install date, block group, and pass count. Akhadana tracks brush life in dust-season hours, not calendar months alone.</p>
<h2>Heat, hydration, and technician safety</h2>
<p>Rajasthan summer days push human work to nights; hydration and vehicle shade protocols are part of robotics O&amp;M—not optional HR slides.</p>
<h2>Roadmap toward higher autonomy (optional phase two)</h2>
<p>Semi-automatic-first does not mean semi-automatic forever. If row repeatability improves, owners may add GLYDE automatic tranches—study <a href="/projects/bachau-dvc-gujrat-300-mw">Bachau</a> and <a href="/projects/chhayan-rajasthan-150-mw">Chhayan</a> while preserving portable insurance during transition.</p>
`,
  "bhadlarajasthan-300-mw": `
<h2>Edge-row soiling physics on open Bhadla tables</h2>
<p>Edge rows along access corridors accrue dust first because vehicle traffic and wind channels concentrate particulate. Bhadla supervisors schedule portables on those edges before interior blocks with flatter soiling slopes.</p>
<h2>Groundwater narrative in finance packs</h2>
<p>Wet-wash avoidance supports lender ESG questions on water stewardship in arid parks—pair <strong>42&nbsp;million litres</strong> with OPEX avoided on tankers.</p>
<h2>Vegetation contractors and robot exclusion zones</h2>
<p>Vegetation cuts change debris patterns. Contract language must keep cuttings off staging aprons; civil contractors receive robot exclusion maps during mobilisation.</p>
<h2>When to revisit automatic CAPEX</h2>
<p>If repeatability maps cross an internal threshold, owners may add GLYDE tranches. Until then, forty NYUMA portables are the disciplined choice.</p>
`,
  "neneva-gujrat-250-mw": `
<h2>Tracker OEM coordination meetings</h2>
<p>GLYDE-X programmes require tracker OEM alignment on stow, cleaning windows, and warranty language—co-signed acceptance criteria, not robot vendor alone.</p>
<h2>Seasonal stow and cleaning interplay</h2>
<p>Stow seasons compress windows; document stow-limited nights separately from wind holds in NECTYR.</p>
<h2>Ten-machine spare strategy</h2>
<p>Pre-position brushes and drive spares before March–June; one idle GLYDE-X during peak season has outsized MWh impact on long tracker rows.</p>
`,
  "seci-2-200-mw": `
<h2>Documenting irregular blocks for procurement</h2>
<p>Maintain a living irregular-block registry explaining the 76 semi-automatic assets—switchyard-adjacent tables, transitions, civil anomalies.</p>
<h2>Automatic path maturity milestones</h2>
<p>As blocks graduate to autonomic paths, update the registry and reassign portables to the next irregular zone.</p>
<h2>Water and labour nuance</h2>
<p>Moderate water constraints still punish wet-wash scale; training records and NECTYR logs demonstrate quality stability post-deployment.</p>
`,
  "chhayan-rajasthan-150-mw": `
<h2>Mid-scale NECTYR dashboards executives actually use</h2>
<p>Executives need four numbers weekly: completion rate, idle minutes, wind hours, repeat faults—use 25-robot visibility in board O&amp;M reviews.</p>
<h2>Pre-monsoon readiness checklist</h2>
<p>Before March, verify brush inventory, docking maps, technician shadow completions, and spare lead times.</p>
<h2>Insurance and night traffic documentation</h2>
<p>Maintain night traffic plans and hold policies for insurer reviews alongside <strong>5.63&nbsp;GWh</strong> scenarios.</p>
`,
};

export const extras = {
  "akhadana-rajasthan-360-mw": `
<h2>Why Akhadana chose eighty semi-automatic machines on 360&nbsp;MW</h2>
<p>At 360&nbsp;megawatts, the intuitive procurement slide is often “more robots equals more cleanliness.” Akhadana inverted that logic: the owner deployed <strong>eighty NYUMA semi-automatic portables</strong>—about <strong>0.22 robots per MW</strong>—because the near-term goal was verified waterless coverage on the highest-return blocks, not uniform autonomic paths across every hectare on day one. Rajasthan’s Thar-edge dust does not wait for civil layouts to become robot-perfect; PR drifts on downwind berms and haul-road strings while teams debate whether autonomy is mature enough.</p>
<p>Semi-automatic waterless brushing lets crews close those pockets quickly without tanker logistics. Each portable unit is staged where drive time stays low; supervisors publish weekly block queues; inspection sheets record completion when NECTYR-style telematics were not yet the primary layer at commissioning in <strong>2021</strong>. The discipline is old-school operations executed with modern hardware: start/stop ownership, brush care, wind holds, and signed routes.</p>
<p>Compare that philosophy to <a href="/projects/bachau-dvc-gujrat-300-mw">Bachau DVC’s 172 GLYDE automatic machines on 300&nbsp;MW</a> (~0.57 robots/MW with NECTYR dashboards) or <a href="/projects/agar-solar-project">Agar’s 272-robot mixed fleet on 200&nbsp;MW</a>. Akhadana proves mega-scale can mean <em>focused</em> capital intensity, not maximum robot count.</p>

<h2>Coverage mathematics on a six-hundred-hectare-class table</h2>
<p>Owners should model Akhadana with row kilometres and marginal MWh per pass, not MW alone. If eighty portables each cover a defined block group per night shift, supervisors calculate how many nights are required to cycle the full 360&nbsp;MW footprint during March–June. The answer is not “every block every night”—it is prioritised recovery on blocks where inverter trends soften first.</p>
<p>Downwind edges, quarry-adjacent strings, and access-road borders stay at the top of the queue. Interior blocks with stable soiling slopes may cycle less frequently when hours compress during curtailment or heat events. That is operations research at utility scale, not a robots-per-MW marketing slogan.</p>

<h2>Inspection-led accountability without fleet telematics as the primary layer</h2>
<p>Manual cycle scheduling and periodic inspection reports are not weaknesses if they are executed with rigor. Akhadana’s weekly plan is visible to day and night teams; missed blocks trigger reschedules before month-end SCADA surprises. When finance asks “did cleaning happen?”, supervisors produce inspection evidence and cycle logs—not verbal assurance.</p>
<p>Owners planning NECTYR later should treat Akhadana as a baseline: block-level proof is the requirement; dashboards are an upgrade path. Explore <a href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app">NECTYR</a> alongside <a href="/performance-and-test-methodology">performance methodology</a> when upgrading monitoring.</p>

<h2>Water, energy, and carbon at mega-scale</h2>
<p>Reported <strong>50.4&nbsp;million litres of water avoided per year</strong> matters because wet washing at 360&nbsp;MW would imply a tanker programme the site cannot sustain. <strong>13.50&nbsp;GWh</strong> and <strong>6,696&nbsp;metric tons CO₂ equivalent</strong> should be stress-tested at 50% and 75% attribution in investment models—if robotics still clears hurdle rate, the case is robust.</p>
<p>ESG reviewers should keep water, GWh, and tCO₂e on consistent assumptions. Insurers care that night operations reduce human exposure on modules during peak radiation.</p>

<h2>Commissioning in 2021 and path governance today</h2>
<p>Early commissioning prioritised blocks with the steepest soiling slopes and trained technicians on NYUMA brush compliance before scaling cycles. Path governance still matters: vegetation cuts, berm repairs, and cable trenches change row headers—maps update before production nights to prevent wasted passes.</p>

<h2>Peer lessons for procurement committees</h2>
<p>If your layout is not autonomic-ready, copying Bachau’s automatic count will disappoint. If your layout is maturing but dust is unforgiving, Akhadana’s semi-automatic density may outperform a thin automatic spread. Review <a href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system">semi-automatic systems</a>, <a href="/solar-panel-cleaning-system/nyuma-automatic-cleaning-robot">NYUMA</a>, and the <a href="/projects">projects hub</a> with your spacing drawings—not brochure averages.</p>
`,

  "bhadlarajasthan-300-mw": `
<h2>Bhadla irradiance with semi-automatic pragmatism</h2>
<p>The Bhadla corridor is among India’s highest-insolation utility belts—and among the harshest for soiling. At <strong>300&nbsp;MW</strong>, manual programmes could not keep frequency aligned with dust return; wet washes collided with groundwater and tanker limits. Taypro’s answer was <strong>forty NYUMA semi-automatic robots</strong> (~<strong>0.13 robots/MW</strong>) under CAPEX: portable waterless coverage phased where full GLYDE autonomic paths were not yet the owner’s chosen capital path in <strong>2021</strong>.</p>
<p>Forty machines is deliberately smaller than <a href="/projects/akhadana-rajasthan-360-mw">Akhadana’s eighty-unit mega deployment</a> on 360&nbsp;MW, but larger than a pilot. Bhadla trades “autonomic optics” for logged semi-automatic cycles that supervisors can audit with inspection discipline.</p>

<h2>When semi-automatic beats automatic on the same nameplate class</h2>
<p><a href="/projects/bachau-dvc-gujrat-300-mw">Bachau DVC</a> shows the automatic-first alternative at 300&nbsp;MW with 172 GLYDE units and NECTYR telematics. Bhadla shows semi-automatic-first when rows are productive but not yet fully autonomic-ready. The correct choice is layout maturity and capital phasing—not which brochure looks more futuristic.</p>
<p>Owners should bring row repeatability maps to technical committees. If repeatability is high, automatic density may rise in phase two; if not, Bhadla-style portables protect PR while paths mature.</p>

<h2>Operating rhythm with inspection sheets</h2>
<p>Weekly block plans, wind holds, and brush PM intervals are non-negotiable. Technicians document partial completions honestly so SCADA correlation stays trustworthy. When inverter trends soften on a block logged clean, escalation targets brush wear or incomplete coverage—not generic “soiling anyway” excuses.</p>

<h2>Reported outcomes in finance language</h2>
<p><strong>42&nbsp;million litres</strong> water avoided, <strong>11.25&nbsp;GWh</strong>, and <strong>5,580&nbsp;tCO₂e</strong> are site-reported—model them conservatively. Pair with <a href="/solar-panel-cleaning-robot-price-calculator#calculator">ROI calculator</a> inputs and <a href="/cleaning-technology">cleaning technology</a> acceptance criteria.</p>

<h2>Path governance in high-insolation parks</h2>
<p>Heat and radiation push human work to nights; robots follow the same discipline. Vegetation contractors and civil teams receive exclusion zones near staging areas. After monsoon, re-walk paths before assuming stored routes still match field geometry.</p>

<h2>Mid-scale automatic contrast</h2>
<p><a href="/projects/chhayan-rajasthan-150-mw">Chhayan (150&nbsp;MW, 25 GLYDE automatic, NECTYR from 2024)</a> shows a smaller automatic reference in Rajasthan. Bhadla owners evaluating phase-two automation should study Chhayan’s commissioning playbook while preserving semi-automatic insurance for irregular blocks.</p>
`,

  "neneva-gujrat-250-mw": `
<h2>Tracker rows demand GLYDE-X—not ground-mount logic copied sideways</h2>
<p>Neneva is a <strong>250&nbsp;MW</strong> Gujarat plant where <strong>ten GLYDE-X</strong> tracker-aware robots (~<strong>0.04 robots/MW</strong>) clean single-axis tables with stow-aware logic. Ground-mount peers like <a href="/projects/bachau-dvc-gujrat-300-mw">Bachau DVC</a> scale very different paths; comparing robot counts without tracker context misleads procurement committees.</p>
<p>GLYDE-X aligns with <a href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers">single-axis automatic cleaning</a> and <a href="/solar-panel-cleaning-system/nyuma-x-single-axis-tracker-cleaning-robot">NYUMA-X tracker product</a> narratives—low machine count can still win when row length and tracker repeatability are high and NECTYR proves completion.</p>

<h2>NECTYR on a low-density tracker fleet</h2>
<p>With only ten machines, idle minutes and missed blocks are visible immediately in <a href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app">NECTYR</a>. Supervisors treat each robot as high-value capital: wind holds, brush wear, and stow conflicts are escalated fast. Weekly KPI reviews include blocks completed per night and repeat fault codes per tracker block group.</p>

<h2>Water and generation at 250&nbsp;MW tracker scale</h2>
<p>Reported <strong>35&nbsp;million litres</strong> avoided, <strong>9.38&nbsp;GWh</strong>, and <strong>4,650&nbsp;tCO₂e</strong> should be validated against tracker-specific PR baselines—stow seasons and tracker availability belong in the same narrative as soiling recovery.</p>

<h2>Benchmarking against mixed and ground-mount peers</h2>
<p><a href="/projects/seci-2-200-mw">SECI-2’s mixed 179-robot fleet</a> and <a href="/projects/agar-solar-project">Agar’s 272-robot mixed ground-mount programme</a> illustrate higher robots/MW on fixed tables. Neneva illustrates the opposite problem statement: make a small tracker fleet accountable with telematics and disciplined night windows.</p>

<h2>Commissioning tracker cleaning safely</h2>
<p>Acceptance includes stow interlocks, tracker manufacturer cleaning guidance, and night traffic plans near inverter yards. Training covers tracker-specific fault trees—not only ground-mount habits ported from other sites.</p>

<h2>Finance and ESG reviewers</h2>
<p>Stress-test GWh at half attribution; include consumables and training in CAPEX models. Link <a href="/utility-scale-solar-operations">utility operations</a> calendars so tracker O&amp;M and cleaning do not collide during export-limited nights.</p>
`,

  "seci-2-200-mw": `
<h2>The 103/76 split as engineered coverage—not compromise</h2>
<p>SECI-2’s <strong>103 GLYDE automatic</strong> plus <strong>76 semi-automatic</strong> machines (179 total, ~<strong>0.90 robots/MW</strong>) reflect real geometry: autonomic paths where rows repeat; portable waterless coverage where they do not. Moderate agricultural and road dust still produces PR drift when cleaning is episodic—scale made manual programmes unscalable.</p>
<p>NECTYR gives day supervisors the same accountability automatic-only mega sites expect: completion maps, wind holds, alerts. Night crews execute; day teams reconcile with SCADA; missed blocks reschedule before month-end surprises.</p>

<h2>Compare SECI-2 with Agar at the same 200&nbsp;MW nameplate</h2>
<p><a href="/projects/agar-solar-project">Agar</a> runs a heavier automatic majority (265 automatic, seven semi-automatic). SECI-2 runs a nearer balance (103/76). Both report ~<strong>28&nbsp;million litres</strong> water saved and ~<strong>7.5&nbsp;GWh</strong>—statistics are not interchangeable templates; they are site-reported outcomes that must be validated locally. The lesson is mixed-mode economics on irregular tables, not copying robot counts.</p>

<h2>Water, labour, and audit failures SECI-2 closed</h2>
<p>Before robotics, wet washes consumed water and labour without block logs. Finance could not tie generation variance to missed paths. Robotics closed frequency, water, and audit gaps without flooding modules—see <a href="/solar-panel-cleaning-system">systems overview</a> and <a href="/performance-and-test-methodology">methodology</a>.</p>

<h2>Operating calendar and curtailment</h2>
<p>March–June prioritises downwind blocks; curtailment nights document grid-limited skips separately from wind holds. Training rotates technicians across automatic supervision and semi-automatic portable coverage so the fleet does not split into siloed teams.</p>

<h2>Procurement questions SECI-2 answers</h2>
<p>“Can we avoid buying automatic for irregular blocks?” Often no—semi-automatic insurance protects PR. “Can we skip telematics?” Only if another proof layer exists; SECI-2 chose NECTYR. Model economics in the <a href="/solar-panel-cleaning-robot-price-calculator#calculator">calculator</a>; compare automatic-only <a href="/projects/bachau-dvc-gujrat-300-mw">Bachau</a> when rows mature.</p>
`,

  "chhayan-rajasthan-150-mw": `
<h2>Mid-scale automatic reference with 2024 NECTYR from day one</h2>
<p>Chhayan is a <strong>150&nbsp;MW</strong> Rajasthan ground-mount plant commissioned in <strong>2024</strong> with <strong>25 GLYDE automatic</strong> robots (~<strong>0.17 robots/MW</strong>)—fully automatic, waterless, CAPEX, and NECTYR-backed. It is the mid-scale counterpart to <a href="/projects/bachau-dvc-gujrat-300-mw">Bachau’s 300&nbsp;MW automatic programme</a> and the semi-automatic <a href="/projects/bhadlarajasthan-300-mw">Bhadla</a> path on similar dust corridors.</p>

<h2>Why twenty-five automatic units can suffice at 150&nbsp;MW</h2>
<p>Row repeatability and block prioritisation—not brochure density—define outcomes. Twenty-five autonomic paths on repeatable tables can cycle high-return blocks through dust season if NECTYR shows completion and idle trends stay controlled. Owners at 150&nbsp;MW should not assume they need Agar’s 272-robot mixed intensity unless SCADA proves it.</p>

<h2>Reported statistics and conservative finance</h2>
<p><strong>21&nbsp;million litres</strong> water avoided, <strong>5.63&nbsp;GWh</strong>, and <strong>2,790&nbsp;tCO₂e</strong> are site-reported—stress-test GWh before investment committee sign-off. Pair with <a href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system">automatic cleaning</a> specs and <a href="/projects/capex">CAPEX case studies</a>.</p>

<h2>NECTYR KPIs for smaller fleets</h2>
<p>Smaller fleets make faults visible faster: blocks per night, idle minutes, wind holds, repeat faults. Weekly reviews tie cleaning KPIs to inverter availability—missed blocks are rescheduled, not debated anecdotally.</p>

<h2>Peer benchmarking for growing owners</h2>
<p>Owners expanding from 150&nbsp;MW toward 250–300&nbsp;MW should study when to add semi-automatic portables (<a href="/projects/seci-2-200-mw">SECI-2 mixed</a>) versus pushing automatic density (<a href="/projects/bachau-dvc-gujrat-300-mw">Bachau</a>). Chhayan is the clean automatic baseline at mid-scale.</p>

<h2>Safety, vegetation, and ten-year planning</h2>
<p>Night-first culture, path governance after vegetation cuts, and refresh planning for brushes and drives belong in the O&amp;M handbook—not only vendor handover slides. See <a href="/company">company</a> and <a href="/utility-scale-solar-operations">utility operations</a> context for programme governance.</p>
`,
};
