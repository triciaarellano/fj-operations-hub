import test from "node:test";
import assert from "node:assert/strict";
import { parseLearners, SAMPLE_LEARNERS, fetchLearners } from "../src/lib/learners.ts";

test("sample records have unique IDs and pass the same validation as live data", () => {
  assert.equal(SAMPLE_LEARNERS.length, 24);
  assert.deepEqual(parseLearners(SAMPLE_LEARNERS), SAMPLE_LEARNERS);
});

test("normalizes spreadsheet headings and derives lecture nights from the level", () => {
  const [learner] = parseLearners({ data: [{
    "Learner No / ID": " FJ-100 ", "Learner Name": "Connor McIntyre", Email: "connor@example.com", Level: "Level 4",
    "Study Pathway": "Quantity Surveying", "Cohort / Intake": "Jan 2026",
    "Bridging / Special Requirements": "CAD bridging", "Comments / Notes": "Tutor review scheduled",
  }] });
  assert.equal(learner.id, "FJ-100");
  assert.equal(learner.level, 4);
  assert.equal(learner.lectureNights, "Tue & Thu");
  assert.equal(learner.requirements, "CAD bridging");
  assert.equal(parseLearners({ learners: [{ ...SAMPLE_LEARNERS[0], level: 6 }] })[0].lectureNights, "Mon & Wed");
});

test("accepts an empty sheet and rejects malformed or duplicate records", () => {
  assert.deepEqual(parseLearners([]), []);
  for (const data of [{ error: "Access denied" }, [null], [{ ...SAMPLE_LEARNERS[0], level: 7 }], [{ ...SAMPLE_LEARNERS[0], pathway: "Unknown" }], [SAMPLE_LEARNERS[0], SAMPLE_LEARNERS[0]]]) {
    assert.throws(() => parseLearners(data));
  }
});

test("client fetch uses the uncached API and propagates HTTP failures", async (t) => {
  const controller = new AbortController();
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "/api/learners");
    assert.equal(options.cache, "no-store");
    assert.equal(options.signal, controller.signal);
    return Response.json({ learners: SAMPLE_LEARNERS, source: "sample" });
  });
  assert.equal((await fetchLearners(controller.signal)).learners.length, 24);
  globalThis.fetch.mock.mockImplementation(async () => new Response("Unavailable", { status: 503 }));
  await assert.rejects(fetchLearners(), /Unable to refresh/);
});
