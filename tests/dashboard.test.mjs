import test from "node:test";
import assert from "node:assert/strict";
import { filterLearners, formatSessionTime, getUpcomingSessions } from "../src/lib/dashboard.ts";
import { EMPTY_FILTERS, MOCK_LEARNERS, MOCK_SESSIONS } from "../src/data/mockData.ts";

test("directory combines filters across categories and accepts multiple values within one category", () => {
  const filters = { ...EMPTY_FILTERS, levels: [4, 6], cohorts: ["Jan 2026", "Jan 2027"], pathways: ["Quantity Surveying", "Building Services Engineering"] };
  const result = filterLearners(MOCK_LEARNERS, filters);
  assert.ok(result.length > 0);
  assert.ok(result.every((learner) => filters.levels.includes(learner.level) && filters.cohorts.includes(learner.cohort) && filters.pathways.includes(learner.pathway)));
  assert.deepEqual(filterLearners(MOCK_LEARNERS, EMPTY_FILTERS), MOCK_LEARNERS);
});

test("directory searches name, email and learner ID without case or whitespace sensitivity", () => {
  const learner = MOCK_LEARNERS[0];
  for (const search of ["  CONNOR  ", learner.email.toUpperCase(), learner.id]) {
    assert.deepEqual(filterLearners(MOCK_LEARNERS, { ...EMPTY_FILTERS, search }), [learner]);
  }
  assert.deepEqual(filterLearners(MOCK_LEARNERS, { ...EMPTY_FILTERS, search: "no such learner" }), []);
});

test("upcoming sessions include an in-progress lecture and exclude ended lectures", () => {
  const [first, second] = MOCK_SESSIONS;
  assert.equal(getUpcomingSessions([second, first], "2026-11-09T19:00:00Z")[0].id, first.id);
  assert.equal(getUpcomingSessions([first, second], first.endsAt)[0].id, second.id);
  assert.deepEqual(getUpcomingSessions(MOCK_SESSIONS, "2027-01-01T00:00:00Z"), []);
});

test("November session times are explicitly formatted in UK GMT", () => {
  assert.equal(formatSessionTime(MOCK_SESSIONS[0]), "18:30 – 20:30 GMT");
});

test("mock lecture nights match level schedules and all sessions have a valid end time", () => {
  for (const session of MOCK_SESSIONS) {
    const day = new Date(session.startsAt).getUTCDay();
    assert.ok(session.levels.includes(4) ? [2, 4].includes(day) : [1, 3].includes(day));
    assert.ok(Date.parse(session.endsAt) > Date.parse(session.startsAt));
  }
});
