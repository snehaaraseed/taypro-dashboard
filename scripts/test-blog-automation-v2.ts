/**
 * Offline edge-case tests for SEO blog automation v2 (no Gemini calls).
 * Run: npm run seo:test-blog-automation-v2
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  const envLocal = path.join(root, ".env.local");
  if (!fs.existsSync(envLocal)) return;
  for (const line of fs.readFileSync(envLocal, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

async function main() {
  loadEnvLocal();

  const { listGeminiApiKeys, getGeminiKeyPoolSize } = await import(
    "../src/lib/gemini/api-keys"
  );
  const { automationTextModelCandidates } = await import(
    "../src/lib/gemini/model-routing"
  );
  const { getBlogPipelineMaxOuterAttempts, classifyGenerationFailure } =
    await import("../src/lib/seo/content-quality");
  const {
    isPermanentRejectionReason,
    loadEditorialState,
    saveEditorialState,
    getPermanentRejectedSlotKeys,
  } = await import("../src/lib/seo/editorial-state");
  const { loadEvergreenFallbackCatalog, evergreenToPlanInput } = await import(
    "../src/lib/seo/evergreen-fallback"
  );
  const {
    generateEditorialCalendar,
    loadEditorialCalendar,
    loadTodayCalendarRow,
  } = await import("../src/lib/seo/editorial-calendar");
  const { countBriefStats, loadDiscoveredBriefs } = await import(
    "../src/lib/seo/discovered-brief-queue"
  );
  const { evaluateRankReadiness } = await import(
    "../src/lib/seo/rank-readiness"
  );
  const { validateCandidate } = await import("../src/lib/seo/brief-validator");
  const { buildCitationSources } = await import(
    "../src/lib/seo/inline-citations"
  );
  const { judgeBlocksPublish, getRankJudgeMinScore } = await import(
    "../src/lib/seo/rank-readiness-judge"
  );
  const { listSemanticDomains, hashTopicContext } = await import(
    "../src/lib/seo/semantic-topic-coordinates"
  );
  const { renderCoordinateTopic, isTierAMoneyPageKeyword } = await import(
    "../src/lib/seo/topic-coordinate-renderer"
  );
  const {
    isCoverageLedgerEnabled,
    isPermanentSlotFailure,
  } = await import("../src/lib/seo/coverage-ledger");
  const {
    assertQuotaBudgetAllowed,
    getReservedGemmaCallsBlog,
    getGemmaRpdCap,
  } = await import("../src/lib/gemini/quota-budget");

  let passed = 0;
  function ok(name: string, fn: () => void) {
    fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  }
  async function okAsync(name: string, fn: () => Promise<void>) {
    await fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  }

  console.log("\n=== Blog automation v2 edge-case tests ===\n");

  ok("GEMINI key pool has at least 1 key", () => {
    assert.ok(getGeminiKeyPoolSize() >= 1);
    assert.ok(listGeminiApiKeys().every((k) => k.length > 10));
  });

  ok("duplicate GEMINI keys are deduped", () => {
    const keys = listGeminiApiKeys();
    assert.equal(new Set(keys).size, keys.length);
  });

  ok("automation uses Gemma models (not flash-lite default)", () => {
    const models = automationTextModelCandidates();
    assert.ok(models.length >= 1);
    for (const m of models) {
      assert.match(m, /gemma/i, `unexpected model: ${m}`);
      assert.doesNotMatch(m, /flash-lite/i);
    }
  });

  ok("BLOG_PIPELINE_MAX_OUTER_ATTEMPTS defaults to 2", () => {
    const prev = process.env.BLOG_PIPELINE_MAX_OUTER_ATTEMPTS;
    delete process.env.BLOG_PIPELINE_MAX_OUTER_ATTEMPTS;
    assert.equal(getBlogPipelineMaxOuterAttempts(), 2);
    if (prev) process.env.BLOG_PIPELINE_MAX_OUTER_ATTEMPTS = prev;
  });

  ok("HYBRID_FALLBACK defaults to 0 via env unset", () => {
    const raw = process.env.BLOG_HYBRID_FALLBACK_ATTEMPTS?.trim();
    const parsed = raw ? Number.parseInt(raw, 10) : 0;
    assert.ok(Number.isFinite(parsed) && parsed >= 0);
    assert.equal(parsed, 0, "production should keep hybrid fallback at 0");
  });

  ok("editorial state rolls over on new IST day", () => {
    const runtimeDir = path.join(root, ".runtime", "blog-cron");
    fs.mkdirSync(runtimeDir, { recursive: true });
    const stateFile = path.join(runtimeDir, "editorial-state.json");
    const backup = fs.existsSync(stateFile)
      ? fs.readFileSync(stateFile, "utf8")
      : null;

    saveEditorialState({
      date: "1999-01-01",
      attemptsToday: 99,
      rejections: [
        {
          slotKey: "test::old",
          reason: "Outline too similar",
          permanent: true,
          at: new Date().toISOString(),
        },
      ],
    });
    const rolled = loadEditorialState();
    assert.notEqual(rolled.date, "1999-01-01");
    assert.equal(rolled.attemptsToday, 0);
    assert.equal(rolled.rejections.length, 0);

    if (backup) fs.writeFileSync(stateFile, backup);
    else fs.unlinkSync(stateFile);
  });

  ok("permanent rejection reasons detected", () => {
    assert.ok(isPermanentRejectionReason("Outline too similar to foo"));
    assert.ok(isPermanentRejectionReason("Topic already published"));
    assert.ok(!isPermanentRejectionReason("Transient network blip"));
  });

  ok("getPermanentRejectedSlotKeys returns Set", () => {
    const keys = getPermanentRejectedSlotKeys();
    assert.ok(keys instanceof Set);
  });

  ok("evergreen catalog has pre-validated entries", () => {
    const entries = loadEvergreenFallbackCatalog();
    assert.ok(
      entries.length >= 5,
      `expected ≥5 evergreen entries, got ${entries.length}`
    );
    for (const e of entries) {
      assert.ok(e.title.length > 20);
      assert.ok(e.description.length >= 80);
      assert.ok(Array.isArray(e.h2Outline) && e.h2Outline.length >= 4);
      const plan = evergreenToPlanInput(e);
      assert.match(plan.slotKey, /^evergreen-fallback::/);
    }
  });

  ok("semantic catalog renders all domain sub-angles", () => {
    const domains = listSemanticDomains();
    assert.ok(domains.length >= 25, `expected ≥25 domains, got ${domains.length}`);
    let rendered = 0;
    for (const domain of domains) {
      assert.ok(domain.subAngles.length >= 3, `${domain.id} needs subAngles`);
      for (const sub of domain.subAngles) {
        const coordinate = {
          domainId: domain.id,
          intentFamily: sub.intentFamily,
          subAngleId: sub.id,
          context: {
            geo: "pan_india",
            scale: "50_100mw",
            plantType: "fixed_tilt",
          },
        };
        const topic = renderCoordinateTopic(coordinate);
        if (topic) {
          rendered += 1;
          assert.ok(!isTierAMoneyPageKeyword(topic.keyword), topic.keyword);
        }
      }
    }
    assert.ok(rendered >= 100, `only ${rendered} coordinates rendered`);
  });

  ok("coordinate keys are stable hashes", () => {
    const ctx = { geo: "gujarat", scale: "25_50mw" };
    const a = hashTopicContext(ctx);
    const b = hashTopicContext(ctx);
    assert.equal(a, b);
    assert.equal(a.length, 12);
  });

  ok("editorial calendar file exists and parses", () => {
    const cal = loadEditorialCalendar();
    assert.ok(
      cal,
      "data/editorial-calendar.json missing — run seo:generate-editorial-calendar"
    );
    assert.ok(Array.isArray(cal!.days));
  });

  ok("discovered brief queue is well-formed (titles unique, on-spec)", () => {
    const briefs = loadDiscoveredBriefs();
    const titles = new Set(briefs.map((b) => b.title.toLowerCase().trim()));
    assert.equal(titles.size, briefs.length, "every brief title must be unique");
    for (const b of briefs.slice(0, 100)) {
      assert.ok(b.title.length >= 30 && b.title.length <= 72, b.title);
      assert.ok(b.primaryKeyword.length >= 8, b.primaryKeyword);
      assert.ok(b.score >= 55, `brief below score floor: ${b.id}`);
    }
    const stats = countBriefStats();
    assert.equal(stats.total, briefs.length);
    assert.ok(stats.open + stats.filled + stats.rejected >= 0);
  });

  ok("generateEditorialCalendar uses discovered briefs source", () => {
    const cal = generateEditorialCalendar(90);
    assert.equal(cal.stats?.source, "discovered-briefs");
    for (const day of cal.days.slice(0, 5)) {
      assert.ok(day.primaryBriefId);
      assert.ok(day.primary.title.length >= 30);
      assert.match(day.primary.slotKey, /^brief::/);
    }
  });

  ok("rank-readiness rejects thin/padded drafts", () => {
    const thin = evaluateRankReadiness({
      title: "Solar panel cleaning robot ROI",
      description: "x",
      content: "<p>Solar plants get dusty. Cleaning helps.</p>",
      primaryKeyword: "solar panel cleaning roi",
    });
    assert.equal(thin.pass, false);
    assert.ok(thin.reasons.length > 0);
  });

  ok("rank-readiness passes a structured, deep draft", () => {
    const sections = Array.from({ length: 6 })
      .map(
        (_, i) =>
          `<h2>How often should you clean panels on a ${10 + i * 10} MW plant?</h2>` +
          `<p>${"Soiling on utility-scale solar plants in India reduces the performance ratio. ".repeat(
            40
          )}</p>` +
          `<a href="/blog/solar-soiling-loss">related</a>`
      )
      .join("");
    const content =
      `<p>Short answer: clean every 7 to 15 days during dusty months to hold PR above 98%.</p>` +
      `<h2>Quick answer</h2><ul><li>7-15 days</li><li>PR impact 3-6%</li><li>water vs robot</li><li>O&M cost</li></ul>` +
      `<table><thead><tr><th>Method</th><th>Water</th></tr></thead><tbody><tr><td>Robot</td><td>0</td></tr></tbody></table>` +
      sections +
      `<a href="/solar-panel-cleaning-robot">internal</a>`;
    const result = evaluateRankReadiness({
      title: "How often to clean solar panels on a 50 MW plant in India",
      description: "Cleaning frequency for utility-scale solar O&M",
      content,
      primaryKeyword: "clean solar panels 50 mw plant",
      peopleAlsoAsk: ["How often should you clean panels?"],
      serpGaps: ["water and PR impact for MW plants"],
    });
    assert.ok(result.pass, `expected pass, got ${result.score}: ${result.reasons.join("; ")}`);
  });

  ok("citation sources dedupe URLs and drop own domain", () => {
    const serp = {
      sources: [
        { title: "MNRE Report", uri: "https://mnre.gov.in/solar-x" },
        { title: "MNRE dup", uri: "https://mnre.gov.in/solar-x" },
        { title: "Taypro blog", uri: "https://taypro.in/blog/y" },
        { title: "no uri" },
      ],
    } as unknown as Parameters<typeof buildCitationSources>[0];
    const fact = {
      sources: [{ title: "CEA", uri: "https://cea.nic.in/z" }],
    } as unknown as Parameters<typeof buildCitationSources>[1];
    const sources = buildCitationSources(serp, fact);
    assert.equal(sources.length, 2, "expect mnre (deduped) + cea, own dropped");
    assert.ok(sources.every((s) => !s.domain.includes("taypro")));
    assert.ok(sources.every((s) => s.uri && s.title));
  });

  ok("rank-judge blocks low scores, passes high (when it ran)", () => {
    const min = getRankJudgeMinScore();
    assert.equal(min, 70);
    assert.equal(
      judgeBlocksPublish({
        ran: true,
        verdict: "fail",
        score: 40,
        reasons: [],
        differentiationGaps: [],
        factualConcerns: [],
      }),
      true
    );
    assert.equal(
      judgeBlocksPublish({
        ran: true,
        verdict: "pass",
        score: 82,
        reasons: [],
        differentiationGaps: [],
        factualConcerns: [],
      }),
      false
    );
  });

  ok("rank-judge fail-safe: ran=false never blocks publish", () => {
    assert.equal(
      judgeBlocksPublish({
        ran: false,
        verdict: "pass",
        score: 0,
        reasons: [],
        differentiationGaps: [],
        factualConcerns: [],
      }),
      false
    );
  });

  await okAsync("brief validator rejects Tier-A money-page keyword", async () => {
    const res = await validateCandidate(
      {
        domainId: "soiling",
        query: "solar panel cleaning robot",
        suggestedTitle: "Solar Panel Cleaning Robot for 50 MW Plants in India",
        primaryKeyword: "solar panel cleaning robot",
        intentFamily: "comparison_alternative",
        serpGap: "gap",
        peopleAlsoAsk: [],
        sources: [],
        webSearchQueries: [],
      },
      {
        corpus: [],
        existingBriefTitles: new Set(),
        existingBriefKeywords: new Set(),
      }
    );
    assert.equal(res.ok, false);
  });

  ok("loadTodayCalendarRow returns row or null gracefully", () => {
    const row = loadTodayCalendarRow();
    if (row) {
      assert.ok(row.primary.keyword.length > 5);
      assert.ok(row.backup.keyword.length > 5);
    }
  });

  ok("permanent slot failure markers cover hard blocks", () => {
    for (const marker of [
      "No unique title for coverage slot",
      "Pre-flight uniqueness failed",
      "already covered by existing post",
    ]) {
      assert.ok(isPermanentSlotFailure(`Error: ${marker} (foo-bar)`));
    }
    assert.ok(!isPermanentSlotFailure("Outline too similar (retryable via new slot)"));
  });

  ok("coverage ledger enabled by default", () => {
    assert.equal(isCoverageLedgerEnabled(), true);
  });

  ok("blog reserved Gemma budget is positive", () => {
    assert.ok(getReservedGemmaCallsBlog() >= 10);
  });

  ok("burn scope blocked until blog done", () => {
    const doneDir = path.join(root, ".runtime", "blog-cron");
    fs.mkdirSync(doneDir, { recursive: true });
    const tz = process.env.BLOG_CRON_TZ?.trim() || "Asia/Kolkata";
    const day = new Date()
      .toLocaleDateString("en-CA", { timeZone: tz })
      .replace(/-/g, "");
    const doneFile = path.join(doneDir, `done-${day}`);
    const hadDone = fs.existsSync(doneFile);
    if (hadDone) fs.unlinkSync(doneFile);

    assert.throws(
      () => assertQuotaBudgetAllowed("burn"),
      /Burn scope blocked until today's English blog is done/
    );

    fs.writeFileSync(doneFile, "");
    assert.doesNotThrow(() => assertQuotaBudgetAllowed("burn"));
    fs.unlinkSync(doneFile);
    if (hadDone) fs.writeFileSync(doneFile, "");
  });

  ok("Gemma RPD cap scales with key pool", () => {
    const cap = getGemmaRpdCap();
    assert.ok(cap >= 1500 * getGeminiKeyPoolSize());
  });

  ok("quota errors classified separately from retryable", () => {
    assert.equal(
      classifyGenerationFailure(new Error("429 Resource exhausted quota")),
      "quota"
    );
    assert.equal(
      classifyGenerationFailure(new Error("Outline too similar")),
      "new_contract"
    );
  });

  ok("cron-generate-blog.sh defines max-fail and evergreen env", () => {
    const sh = fs.readFileSync(
      path.join(root, "scripts/cron-generate-blog.sh"),
      "utf8"
    );
    assert.match(sh, /BLOG_CRON_MAX_FAIL_POSTS/);
    assert.match(sh, /finish_max_fail_day/);
    assert.match(sh, /quotaExhausted/);
  });

  ok("blog-writer-cron-gate exposes past-soft-start", () => {
    const gate = fs.readFileSync(
      path.join(root, "scripts/blog-writer-cron-gate.mjs"),
      "utf8"
    );
    assert.match(gate, /past-soft-start/);
    assert.match(gate, /check-hold/);
  });

  ok("required automation data files exist", () => {
    for (const rel of [
      "data/semantic-topic-catalog.json",
      "data/evergreen-fallback-catalog.json",
      "data/seo-keywords.csv",
    ]) {
      assert.ok(fs.existsSync(path.join(root, rel)), `missing ${rel}`);
    }
  });

  ok("semantic catalog JSON is valid and versioned", () => {
    const raw = JSON.parse(
      fs.readFileSync(path.join(root, "data/semantic-topic-catalog.json"), "utf8")
    );
    assert.ok(Array.isArray(raw.domains));
    assert.ok(raw.domains.length >= 1);
  });

  console.log(`\n=== ${passed} tests passed ===\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
