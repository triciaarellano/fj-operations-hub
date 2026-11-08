export const PATHWAYS = ["Quantity Surveying", "Civil Engineering", "Building Services Engineering", "Construction Management"] as const;
export const COHORTS = ["Jan 2026", "Sept 2026", "Jan 2027"] as const;
export type Learner = {
  id: string;
  name: string;
  email: string;
  level: 4 | 5 | 6;
  lectureNights: string;
  pathway: (typeof PATHWAYS)[number];
  requirements: string;
  notes: string;
  cohort: (typeof COHORTS)[number];
};

const names = ["Connor McIntyre", "Thomas Brooker", "Steven Crissall", "Kitty Marshall-Clarke", "Oliver Bennett", "Amelia Richardson", "James Whitfield", "Sophie Thompson", "Jack Harrison", "Emily Clarke", "Daniel Hughes", "Grace Wilson", "Harry Mitchell", "Isla Anderson", "George Taylor", "Freya Robinson", "Charlie Edwards", "Mia Walker", "William Scott", "Evie Morgan", "Oscar Davies", "Lily Roberts", "Archie Lewis", "Ella Parker"];
const levels: Learner["level"][] = [4, 5, 6, 4, 5, 4, 6, 4, 4, 5, 4, 6, 4, 5, 4, 6, 4, 5, 4, 6, 4, 5, 4, 6];
export const SAMPLE_LEARNERS: Learner[] = names.map((name, i) => ({
  id: `FJ-${String(2026001 + i)}`,
  name,
  email: `${name.toLowerCase().replaceAll(" ", ".")}@example.com`,
  level: levels[i],
  lectureNights: levels[i] === 4 ? "Tue & Thu" : "Mon & Wed",
  pathway: PATHWAYS[i % PATHWAYS.length],
  requirements: i === 0 || i === 8 ? "CAD bridging" : i === 3 || i === 10 ? "GCSE English needed" : "",
  notes: ["Progressing well", "Unit 2 review scheduled", "All units up to date", "Tutor feedback shared", "On track", "Additional tutor support", "", "Excellent engagement"][i % 8],
  cohort: COHORTS[i % COHORTS.length],
}));

export type LearnerResponse = {
  learners: Learner[];
  source: "google-sheets" | "sample";
  message: string;
  updatedAt: string;
};

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
    const cohort = field("cohort", "Cohort / Intake");
    if (!id || !name || !email || ![4, 5, 6].includes(level) || !PATHWAYS.includes(pathway as Learner["pathway"]) || !COHORTS.includes(cohort as Learner["cohort"]) || seen.has(id)) {
      throw new Error("A learner has missing, unsupported, or duplicate fields.");
    }
    seen.add(id);
    return {
      id, name, email, level: level as Learner["level"], pathway: pathway as Learner["pathway"], cohort: cohort as Learner["cohort"],
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
