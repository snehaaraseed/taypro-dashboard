/** Editorial deep sections for tier-3 case studies (~1.5k words). */

export function buildTier3DeepEditorial(slug, s) {
  const name = s.title.split(",")[0].trim();
  const mon = s.nectyr ? "NECTYR completion and hold logs" : "signed inspection sheets and weekly block plans";
  const fleet = s.lowSemiNote
    ? "NYUMA semi-automatic programme (validate scope with commissioning records)"
    : s.auto && !s.semi
      ? `${s.auto} GLYDE automatic (${rpmw(s)} robots/MW)`
      : s.auto && s.semi
        ? `${s.auto} GLYDE + ${s.semi} NYUMA (${rpmw(s)} robots/MW total)`
        : `${s.semi} NYUMA semi-automatic portables (${rpmw(s)} robots/MW)`;

  return `
<h2>What ${name} teaches owners at ${s.mw}&nbsp;MW</h2>
<p>${s.unique} Use the <a href="/solar-panel-cleaning-robot-price-calculator#calculator">ROI calculator</a> with conservative GWh attribution and <a href="/utility-operations">utility operations</a> framing.</p>
<p>Lenders should request block-level proof: ${mon}. Pair <strong>${s.water} litres</strong>, <strong>${s.energyUplift || `${s.gwh} GWh`}</strong>, and <strong>${s.co2}&nbsp;tCO₂e</strong> on one assumption set.</p>

<h2>Regional soiling at ${s.mw}&nbsp;MW</h2>
<p>${s.region.charAt(0).toUpperCase() + s.region.slice(1)}. Downwind rows soften in inverter data before drive-by inspections; programmed cleaning with block proof beats episodic tanker washes.</p>
<p>Before Taypro, manual programmes struggled with frequency, water logistics, and auditability on ${s.mw}&nbsp;MW tables.</p>

<h2>Monthly operating calendar</h2>
<p><strong>Jan–Feb:</strong> review brush wear and cycle plans. <strong>Mar–Jun:</strong> peak dust—scheduled density toward <strong>6–10 cycles per month</strong> class on automatic peers where applicable; not nightly full-plant wash. <strong>Monsoon transition:</strong> stand down after effective rain. <strong>Post-monsoon:</strong> re-walk paths after civil or vegetation works.</p>

<h2>SCADA correlation</h2>
<p>Pair inverter trends with ${s.nectyr ? "NECTYR timestamps" : "inspection timestamps"}. If PR stays soft after logged cleans, investigate brush wear, partial coverage, or equipment fault.</p>

<h2>Water and finance narrative</h2>
<p>Model <strong>${s.water} litres</strong> avoided against tanker and wet-wash baselines. Stress-test <strong>${s.energyUplift || `${s.gwh} GWh`}</strong> at 50% and 75% attribution before sign-off.</p>

<h2>Fleet: ${fleet}</h2>
<p>${s.fleetPitch}</p>

<h2>ESG and insurer pack</h2>
<p>Include night traffic plans, training records, and sample ${s.nectyr ? "NECTYR" : "inspection"} weeks with water and carbon slides on consistent assumptions.</p>

<h2>Procurement checklist</h2>
<ul>
<li>Row repeatability map before copying robots/MW from this case study.</li>
<li>Manual baseline year for water and labour.</li>
<li>Block-level completion proof requirement in contracts.</li>
<li>Phase commissioning on highest-soiling blocks first.</li>
<li>Read <a href="/cleaning-technology">cleaning technology</a> and <a href="/performance-and-test-methodology">performance methodology</a>.</li>
</ul>

<h3>Who should benchmark ${name}?</h3>
<p>Owners with ${s.mw}&nbsp;MW ${s.state} assets and ${s.mode.toLowerCase()} constraints—not plants copying fleet counts without maps.</p>

<h3>How many cycles per month?</h3>
<p>Site-specific; commonly roughly <strong>3–10 dry cycles per month</strong>, weather permitting—not daily washing of every module.</p>
`;
}

function rpmw(s) {
  if (s.lowSemiNote) return "—";
  const t = s.auto + s.semi;
  return t ? `~${(t / s.mw).toFixed(2)}` : "—";
}
