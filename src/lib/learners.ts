import { COHORTS, PATHWAYS, STATUSES, MOCK_LEARNERS } from "../data/mockData.ts";
import type { Learner, LearnerResponse, SubmissionStatus } from "../types/dashboard.ts";

export { COHORTS, PATHWAYS };
export { MOCK_LEARNERS as SAMPLE_LEARNERS };
export type { Learner, LearnerResponse };

/** Accepts camelCase fields or the delivery spreadsheet's column headings. */
export function parseLearners(payload: unknown): Learner[] {
  const rows = Array.isArray(payload) ? payload : payload && typeof payload === "object" ? ((payload as Record<string, unknown>).learners ?? (payload as Record<string, unknown>).data) : undefined;
  if (!Array.isArray(rows)) throw new Error("Expected a learner array, { learners: [...] }, or { data: [...] }.");
  const seen = new Set<string>();
  return rows.map((row: unknown) => {
    if (!row || typeof row !== "object") throw new Error("Invalid learner row.");
    const record = row as Record<string, unknown>;
    const field = (...keys: string[]) => {
      const value = keys.map((key) => record[key]).find((value) => value !== undefined && value !== null);
      return value == null ? "" : String(value).trim();
    };
    const id = field("id", "Learner No / ID", "Learner ID");
    const name = field("name", "Learner Name");
    const email = field("email", "Email");
    const level = Number(field("level", "Level").replace(/^(Level\s*|L)/i, ""));
    const pathway = field("pathway", "Study Pathway");
    const status = field("status", "Submission Status", "Assignment Submission Status") || "Pending";
    const cohort = field("cohort", "Cohort / Intake");
    if (!id || !name || !email || ![4, 5, 6].includes(level) || !PATHWAYS.includes(pathway as Learner["pathway"]) || !STATUSES.includes(status as SubmissionStatus) || !COHORTS.includes(cohort as Learner["cohort"]) || seen.has(id)) {
      throw new Error("A learner has missing, unsupported, or duplicate fields.");
    }
    seen.add(id);
    return {
      id, name, email, level: level as Learner["level"], pathway: pathway as Learner["pathway"], status: status as SubmissionStatus, cohort: cohort as Learner["cohort"],
      lectureNights: level === 4 ? "Tue & Thu" : "Mon & Wed",
      requirements: field("requirements", "Bridging / Special Requirements"),
      notes: field("notes", "Comments / Notes"),
    };
  });
}

export async function fetchLearners(signal?: AbortSignal): Promise<LearnerResponse> {
  const response = await fetch("/api/learners", { cache: "no-store", signal });
  if (!response.ok) throw new Error("Unable to refresh learner data. Please try again.");
  return response.json();
}
