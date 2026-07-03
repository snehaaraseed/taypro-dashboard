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
  const { automationTextModelCandidates, groundingModelCandidates } = await import(
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

  ok("automation uses Flash Lite primary + Gemma retry", () => {
    const models = automationTextModelCandidates();
    assert.ok(models.length >= 1);
    assert.match(models[0]!, /flash-lite/i, `expected flash-lite primary, got ${models[0]}`);
    if (models.length > 1) {
      assert.match(models[1]!, /gemma/i, `expected gemma retry, got ${models[1]}`);
    }
  });

  ok("grounding uses Gemma 26B primary + 31B retry (never Flash)", () => {
    const models = groundingModelCandidates();
    assert.ok(models.length >= 1);
    assert.match(models[0]!, /gemma-4-26b/i, `expected gemma-26b grounding, got ${models[0]}`);
    for (const m of models) {
      assert.doesNotMatch(m, /flash-lite/i, `Flash cannot ground: ${m}`);
    }
    if (models.length > 1) {
      assert.match(models[1]!, /gemma-4-31b/i, `expected gemma-31b retry, got ${models[1]}`);
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

  ok("blog scope is not blocked by a reserved Gemma budget", () => {
    assert.doesNotThrow(() => assertQuotaBudgetAllowed("blog"));
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

  ok("press scope not gated on daily blog", () => {
    const doneDir = path.join(root, ".runtime", "blog-cron");
    fs.mkdirSync(doneDir, { recursive: true });
    const tz = process.env.BLOG_CRON_TZ?.trim() || "Asia/Kolkata";
    const day = new Date()
      .toLocaleDateString("en-CA", { timeZone: tz })
      .replace(/-/g, "");
    const doneFile = path.join(doneDir, `done-${day}`);
    const hadDone = fs.existsSync(doneFile);
    if (hadDone) fs.unlinkSync(doneFile);

    assert.doesNotThrow(() => assertQuotaBudgetAllowed("press"));

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

  ok("cron-generate-blog.sh gates on IST writer start and never marks done on failure", () => {
    const sh = fs.readFileSync(
      path.join(root, "scripts/cron-generate-blog.sh"),
      "utf8"
    );
    assert.match(sh, /past-blog-writer-start/);
    assert.doesNotMatch(sh, /finish_max_fail_day/);
    assert.match(sh, /quotaExhausted/);
    assert.match(sh, /will retry on next cron tick/);
  });

  ok("blog-writer-cron-gate exposes past-blog-writer-start", () => {
    const gate = fs.readFileSync(
      path.join(root, "scripts/blog-writer-cron-gate.mjs"),
      "utf8"
    );
    assert.match(gate, /past-blog-writer-start/);
    assert.match(gate, /is-automation-day/);
    assert.match(gate, /check-hold/);
  });

  ok("calendar: weekends are blackout days", async () => {
    const { isStaticBlackoutYmd, mergeHolidayDates } = await import(
      "../src/lib/cms/blog-automation-calendar-shared"
    );
    const holidays = mergeHolidayDates([]);
    assert.ok(isStaticBlackoutYmd("2026-07-04", holidays, "Asia/Kolkata"));
    assert.ok(!isStaticBlackoutYmd("2026-07-06", holidays, "Asia/Kolkata"));
  });

  ok("calendar: pickNextGapDays prefers min gap but stays within max", async () => {
    const { pickNextGapDays } = await import(
      "../src/lib/cms/blog-automation-calendar-shared"
    );
    process.env.BLOG_AUTOMATION_MIN_DAYS = "1";
    process.env.BLOG_AUTOMATION_MAX_DAYS = "3";
    process.env.BLOG_AUTOMATION_PREFERRED_GAP_WEIGHT = "0.7";
    const counts = { 1: 0, 2: 0, 3: 0 };
    for (let i = 0; i < 200; i++) {
      const gap = pickNextGapDays();
      assert.ok(gap >= 1 && gap <= 3, `gap ${gap} out of range`);
      counts[gap as 1 | 2 | 3]++;
    }
    assert.ok(counts[1] > counts[2], "gap 1 should be most common");
    assert.ok(counts[1] > counts[3], "gap 1 should be most common");
  });

  ok("publish picker skips weekend target day", async () => {
    const { pickAutomationScheduledPublishAt } = await import(
      "../src/lib/cms/blog-schedule"
    );
    const { mergeHolidayDates } = await import(
      "../src/lib/cms/blog-automation-calendar-shared"
    );
    const saturdayMorning = new Date("2026-07-04T04:00:00.000Z");
    const iso = pickAutomationScheduledPublishAt(
      saturdayMorning,
      mergeHolidayDates([])
    );
    const ymd = new Date(iso).toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
    assert.notEqual(ymd, "2026-07-04");
    assert.notEqual(ymd, "2026-07-05");
  });

  ok("narrative validator skips Quick answer requirement", async () => {
    const { validateGeneratedBlog } = await import(
      "../src/lib/seo/blog-content-validator"
    );
    const longBody =
      `<p>A 50 MW Rajasthan plant faced PR drift through May dust while crews were on storm mobilization at a sister site. The asset manager needed a defensible cleaning decision before the lender quarterly review.</p>` +
      `<p>Over three dry weeks, reference blocks lost four percent PR while the rest of the plant held within one percent of clean baseline.</p>` +
      Array.from({ length: 8 })
        .map(
          (_, i) =>
            `<h2>Section ${i + 1}: operational detail for plant managers</h2><p>${"Utility-scale solar O&M teams in India track soiling and water cost on every cycle. ".repeat(
              35
            )}</p>`
        )
        .join("") +
      `<h2>How often should you clean panels on a 50 MW plant?</h2><p>Every 7 to 14 days in pre-monsoon dust belts when PR drops more than two percent on reference modules.</p>` +
      `<a href="/blog/solar-soiling-loss">related</a><a href="/blog/waterless-cleaning">related2</a>`;
    const faqs = [
      {
        question: "How often clean solar panels 50 mw plant India?",
        answer: "Every 7 to 14 days in dusty months when PR drops.",
      },
      { question: "Q2?", answer: "A2 with enough detail for validation." },
      { question: "Q3?", answer: "A3 with enough detail for validation." },
      { question: "Q4?", answer: "A4 with enough detail for validation." },
    ];
    const result = validateGeneratedBlog({
      title: "How a 50 MW Rajasthan plant recovered PR after May dust storms",
      description:
        "Field narrative on cleaning decisions, PR recovery, and O&M trade-offs for utility-scale solar in India during dry season dust events.",
      content: longBody,
      faqs,
      primaryKeyword: "clean solar panels 50 mw plant",
      contentFormat: "narrative",
    });
    if (!result.ok) {
      assert.ok(
        !result.issues.some((i) => i.includes("Quick answer")),
        result.issues.join("; ")
      );
    }
  });

  ok("translation stagger: hi day0, ar day1", async () => {
    const { getBlogLocalesDueByStagger } = await import(
      "../src/lib/translation/config"
    );
    const publish = "2026-07-06T06:00:00.000Z";
    const day0 = getBlogLocalesDueByStagger(
      publish,
      new Date("2026-07-06T12:00:00.000Z")
    );
    const day1 = getBlogLocalesDueByStagger(
      publish,
      new Date("2026-07-07T12:00:00.000Z")
    );
    assert.deepEqual(day0, ["hi"]);
    assert.deepEqual(day1, ["hi", "ar"]);
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
