/** ~1.8k words of site-woven editorial sections for tier-2 case studies. */

export function buildTier2DeepEditorial(slug, s) {
  const name = s.title.split(",")[0].trim();
  const mon = s.nectyr ? "NECTYR completion and hold logs" : "signed inspection sheets and weekly block plans";
  const fleet = s.semiNote
    ? "NYUMA semi-automatic programme (validate fleet count with commissioning records)"
    : `${s.auto} GLYDE automatic${s.semi ? ` plus ${s.semi} NYUMA semi-automatic` : ""} (${s.auto + s.semi} robots total)`;

  return `
<h2>What ${name} teaches procurement teams</h2>
<p>${s.unique} Use the <a href="/solar-panel-cleaning-robot-price-calculator#calculator">ROI calculator</a> with conservative GWh attribution, then request plant-specific cycle assumptions from Taypro applications—see <a href="/utility-operations">utility operations</a> framing.</p>
<p>Lenders should ask for block-level proof: ${mon}. Insurers should see night traffic plans and training records alongside water and carbon statistics.</p>

<h2>Regional soiling mechanics at ${s.mw}&nbsp;MW</h2>
<p>${s.region.charAt(0).toUpperCase() + s.region.slice(1)}. Fine dust bonds to glass between cycles; downwind rows and haul-road-facing strings often soften in inverter data before a drive-by inspection triggers action. At ${s.mw}&nbsp;MW, owners need programmed cleaning with block-level proof—not episodic tanker washes.</p>
<p>Before Taypro, manual programmes struggled with frequency, water logistics, and auditability—especially where labour turnover and remote access complicated night supervision. ${name} closed that gap with ${s.mode.toLowerCase()} waterless coverage under <a href="/projects/capex">CAPEX</a>.</p>

<h2>Monthly operating calendar</h2>
<p><strong>January–February:</strong> review brush wear and cycle plans; validate wind and rain hold rules in ${s.nectyr ? "NECTYR" : "inspection logs"}. <strong>March–June:</strong> peak dust—scheduled cycle density increases on priority blocks (weather permitting), often toward the <strong>6–10 cycles per month</strong> class for automatic fleets; not nightly coverage of every module. <strong>Monsoon transition:</strong> stand down or lighten cycles after effective rain. <strong>Post-monsoon:</strong> re-walk paths after vegetation or civil works; update block timers before the next approved cleaning window.</p>
<p>Supervisors maintain a priority queue: downwind haul roads, quarry-adjacent strings, then interior blocks with stable soiling slopes. The queue should be visible in ${s.nectyr ? "NECTYR dashboards" : "published weekly plans"}—not tribal knowledge carried by one lead.</p>

<h2>SCADA correlation workshops</h2>
<p>Pair inverter loading snapshots with ${s.nectyr ? "NECTYR completion timestamps" : "inspection timestamps"}. If a block was logged clean and PR remains soft, escalate brush wear, partial coverage, or equipment fault—not automatic blame on weather. Monthly workshops keep robotics budgets defensible during annual reviews.</p>
<p>At ${s.mw}&nbsp;MW, string-level trends often flag soiling before security cameras show dirty glass. ${name} O&amp;M teams should document five-why outcomes when cleaning logs and PR diverge.</p>

<h2>Water economics and tanker baselines</h2>
<p>Reported <strong>${s.water} litres per year</strong> avoided should be modelled against historical tanker spend and wet-wash crew costs—not a hypothetical daily wash programme. Finance should pair water slides with attributed <strong>${s.gwh}&nbsp;GWh</strong> at 50% and 75% stress tests.</p>
<p>Dry brushing in approved windows avoids thermal shock from midday sprays. The point is not zero site water use—it is that module cleaning no longer depends on flooding rows on a repeating calendar.</p>

<h2>ESG, lender, and insurer evidence</h2>
<p>Reported <strong>${s.co2}&nbsp;tCO₂e</strong> supports climate slides when tied to the same <strong>${s.gwh}&nbsp;GWh</strong> assumptions auditors review. Provide ${mon}, training attendance, and night traffic plans. None of this replaces PPA legal attribution; it strengthens O&amp;M credibility.</p>

<h2>Fleet accountability: ${fleet}</h2>
<p>${s.fleetPitch}</p>
<p>Robots per MW here is ${rpmw(s)}—a layout and coverage-intensity choice, not a universal benchmark. Compare peers linked in the benchmarking section before copying robot density from brochures.</p>

<h2>Spares, training, and ${s.auto && s.semi ? "mixed-fleet rotation" : "hold discipline"}</h2>
<p>Size brush and drive spares for dust-season peaks. ${s.auto && s.semi ? "Rotate technicians across GLYDE supervision and NYUMA portable weeks so mixed fleets do not split into siloed crews." : "Train supervisors on weather holds and scheduled windows, not ad hoc daytime washing."}</p>
<p>Commissioning should have sequenced high-soiling blocks first, validated geometry, and placed docking or staging to limit deadhead time—especially when ${s.mw}&nbsp;MW compresses cleaning windows during curtailment.</p>

<h2>Technology, safety, and warranty alignment</h2>
<p>Respect OEM cleaning guidance on brush materials and speeds. Safety covers night traffic near inverter yards and lockout coordination—cleaning windows stay outside energized maintenance on the same block. Read <a href="/cleaning-technology">cleaning technology</a> and <a href="/performance-and-test-methodology">performance methodology</a> before acceptance tests.</p>

<h2>Procurement checklist for ${s.mw}&nbsp;MW ${s.state} bids</h2>
<ul>
<li>Map row repeatability and decide automatic vs semi-automatic mix before buying marketing slides.</li>
<li>Price water, labour, and emergency wash frequency in the manual baseline year.</li>
<li>Require block-level completion proof—${s.nectyr ? "NECTYR exports" : "inspection sign-off"}.</li>
<li>Phase commissioning on highest-soiling blocks first.</li>
<li>Run the <a href="/solar-panel-cleaning-robot-price-calculator#calculator">ROI calculator</a> with local tariff and realistic curtailment.</li>
<li>Read peer case studies on the <a href="/projects">projects hub</a> and contact Taypro via <a href="/contact">contact</a> for a layout review.</li>
</ul>

<h3>Who should benchmark ${name}?</h3>
<p>Owners with ${s.mw}&nbsp;MW ${s.state} assets and ${s.mode.toLowerCase()} constraints—not plants copying robot counts without row maps.</p>

<h3>How many cycles per month?</h3>
<p>Site-specific; Taypro programmes often align with roughly <strong>3–10 dry cycles per month</strong>, weather permitting—see <a href="/cleaning-technology">cleaning technology</a>. ${s.nectyr ? "NECTYR block timers implement that philosophy—not a plant-wide clean-now button." : "Weekly NYUMA block plans implement that philosophy—not daily washing of every hectare."}</p>

<h3>CAPEX vs Opex service?</h3>
<p>This deployment is CAPEX; evaluate <a href="/solar-panel-cleaning-system/solar-panel-cleaning-service">managed Opex service</a> separately if you want Taypro-operated cycles with a different commercial model.</p>

<h2>Root-cause discipline when PR and cleaning logs diverge</h2>
<p>When a block shows clean in ${mon} but inverter trends remain soft, supervisors run structured root-cause: brush wear, partial path coverage, tracker or inverter fault, curtailment, or weather—not a default “soiling anyway” close. Document outcomes in O&amp;M minutes so annual robotics budget reviews see engineering rigor, not anecdotes.</p>
<p>At ${s.mw}&nbsp;MW, one mis-diagnosed block group can hide hundreds of MWh over a season. Pair <a href="/performance-and-test-methodology">performance methodology</a> dust-removal claims per completed cycle with SCADA—not nameplate efficiency marketing.</p>

<h2>Long-horizon O&amp;M planning</h2>
<p>Ten-year models should include brush and drive refresh, training churn, and map-update labour after civil works—not only year-one hardware. ${name} owners who treat robotics as capital without consumable and supervision lines underestimate lifecycle cost.</p>
<p>Refresh planning belongs in the same handbook as inverter PM: named owners, reorder thresholds, and escalation paths when idle minutes rise without weather cause.</p>
`;
}

function rpmw(s) {
  if (s.semiNote) return "documented per commissioning records";
  const t = s.auto + s.semi;
  return t ? `~${(t / s.mw).toFixed(2)}` : "—";
}
