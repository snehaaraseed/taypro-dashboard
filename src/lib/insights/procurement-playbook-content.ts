/**
 * Evergreen procurement playbook, no GSC dependency.
 * Compiled from Taypro buyer pages; safe to publish before rankings exist.
 */

export const PROCUREMENT_PLAYBOOK_SLUG =
  "solar-cleaning-procurement-playbook-2026";

export const PROCUREMENT_PLAYBOOK_TITLE =
  "Solar Cleaning Procurement Playbook: Utility-Scale India";

export const PROCUREMENT_PLAYBOOK_DESCRIPTION =
  "An IPP and O&M checklist for evaluating robotic solar cleaning in India: waterless vs wet, CAPEX vs Opex, SLAs, fleet software, and proof to demand before you sign.";

export function buildProcurementPlaybookContent(): string {
  return `
<p>This playbook helps asset owners, EPC teams, and O&M leads shortlist and diligence solar panel cleaning vendors for utility-scale plants in India. It is not a price quote, use it alongside your site layout, soiling profile, and commercial model.</p>

<h2>Who this is for</h2>
<ul>
<li><strong>IPPs and asset owners</strong> writing or reviewing cleaning RFPs</li>
<li><strong>O&M contractors</strong> comparing robot CAPEX, managed Opex, or manual crews</li>
<li><strong>EPC / procurement</strong> validating vendor claims against test methodology and field proof</li>
</ul>

<h2>Step 1: Define your plant context</h2>
<p>Before comparing vendors, document:</p>
<ul>
<li>Capacity (MW), fixed-tilt vs single-axis tracker vs mixed blocks</li>
<li>Soiling regime (dust belt, pre-monsoon window, local water availability)</li>
<li>Target cleaning frequency (cycles per month) and acceptable performance ratio band</li>
<li>Commercial preference: <strong>CAPEX robots</strong>, <strong>managed Opex</strong> (pay per clean), or hybrid</li>
</ul>
<p>Use the <a href="/solar-panel-cleaning-robot-price-calculator#calculator">ROI calculator</a> for directional TCO: not a binding quote.</p>

<h2>Step 2: Vendor evaluation checklist</h2>
<p>Ask every shortlisted vendor to answer in writing:</p>
<ol>
<li><strong>Cleaning method</strong>, Waterless dry vs wet; single-pass vs dual-pass; tracker-compatible paths?</li>
<li><strong>Module safety</strong>, OEM / module-maker clearance; anti-reflective coating compatibility</li>
<li><strong>Uptime &amp; SLA</strong>, Same-day breakdown response, spares network, pan-India field coverage</li>
<li><strong>Fleet software</strong>, Pass logs, wind/stow interlocks, coverage maps (not optional accessories)</li>
<li><strong>Performance claims</strong>, How is &quot;99%+ dust removal&quot; or generation recovery defined and tested? (<a href="/performance-and-test-methodology">methodology</a>)</li>
<li><strong>Commercial model</strong>, Robot purchase, turnkey install, AMC, or fully managed Opex: who owns the fleet?</li>
<li><strong>References</strong>, Comparable MW, region, and array type (fixed vs tracker)</li>
</ol>

<h2>Step 3: CAPEX robot vs managed Opex</h2>
<table>
<thead>
<tr><th>Factor</th><th>CAPEX (buy robots)</th><th>Opex (managed cleaning)</th></tr>
</thead>
<tbody>
<tr><td>Balance sheet</td><td>Capitalize hardware</td><td>Operating expense per clean</td></tr>
<tr><td>Operations burden</td><td>Your O&M runs fleet + schedules</td><td>Vendor runs fleet; you audit coverage</td></tr>
<tr><td>Best when</td><td>Large uniform blocks, in-house O&M depth</td><td>Fast mobilization, no robot CAPEX, SLA-led contract</td></tr>
</tbody>
</table>
<p>Compare scenarios in the <a href="/solar-cleaning-capex-vs-opex">CAPEX vs Opex guide</a> and <a href="/solar-panel-cleaning-system/solar-panel-cleaning-service">Opex service page</a>.</p>

<h2>Step 4: Red flags</h2>
<ul>
<li>Guaranteed plant-wide MWh uplift with no reference blocks or test definitions</li>
<li>No fleet telemetry, robots treated as unlogged manual labour</li>
<li>Waterless claims with no explanation of dual-pass or brush contact on dusty glass</li>
<li>Spares / service only at commissioning, no regional SLA after year one</li>
<li>Price-only comparison without TCO (labour, water, downtime, cleaning frequency)</li>
</ul>

<h2>Step 5: Proof to demand in the contract</h2>
<ul>
<li>Written cleaning SOP aligned with module OEM guidance</li>
<li>Coverage reports per cycle (rows completed, aborts, wind holds)</li>
<li>Spares availability and maximum response time by region</li>
<li>Annual maintenance scope and what voids uptime commitments</li>
</ul>

<h2>Related Taypro resources</h2>
<ul>
<li><a href="/solar-panel-cleaning-system">Solar cleaning robots hub</a></li>
<li><a href="/utility-scale-solar-operations">Utility-scale solar operations guide</a></li>
<li><a href="/solar-panel-cleaning-robot-price-india">Price &amp; cost guide (India)</a></li>
<li><a href="/compare/solar-panel-cleaning-robot-vs-manual-cleaning">Robot vs manual cleaning comparison</a></li>
<li><a href="/compare/waterless-vs-water-based-solar-cleaning">Waterless vs water-based comparison</a></li>
<li><a href="/contact">Request a site-specific discussion</a></li>
</ul>

<h2>Methodology note</h2>
<p>This playbook is evergreen procurement guidance from Taypro. It does not cite Google Search Console rankings or market-share estimates. For performance definitions used on taypro.in, see <a href="/performance-and-test-methodology">Performance &amp; Test Methodology</a>.</p>
`.trim();
}

export function buildProcurementPlaybookMetricsJson(): string {
  return JSON.stringify({
    type: "procurement_playbook",
    version: "2026-01",
    source: "compiled_from_site_guides",
    gscRequired: false,
  });
}
