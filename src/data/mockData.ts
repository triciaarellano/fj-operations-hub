import type { AssessmentDeadline, Cohort, FilterState, Learner, LectureSession, Level, StudyPathway, SubmissionStatus } from "@/types/dashboard";

export const PATHWAYS: readonly StudyPathway[] = ["Quantity Surveying", "Civil Engineering", "Building Services Engineering", "Construction Management"];
export const COHORTS: readonly Cohort[] = ["Jan 2026", "Sept 2026", "Jan 2027"];
export const LEVELS: readonly Level[] = [4, 5, 6];
export const STATUSES: readonly SubmissionStatus[] = ["Pending", "Submitted", "Resubmission Needed"];
export const EMPTY_FILTERS: FilterState = { search: "", levels: [], pathways: [], cohorts: [] };
// Fixed reference makes the November 2026 preview deterministic during SSR.
export const MOCK_REFERENCE_TIME = "2026-11-08T12:00:00.000Z";
const names = ["Connor McIntyre", "Thomas Brooker", "Steven Crissall", "Kitty Marshall-Clarke", "Oliver Bennett", "Amelia Richardson", "James Whitfield", "Sophie Thompson", "Jack Harrison", "Emily Clarke", "Daniel Hughes", "Grace Wilson", "Harry Mitchell", "Isla Anderson", "George Taylor", "Freya Robinson", "Charlie Edwards", "Mia Walker", "William Scott", "Evie Morgan", "Oscar Davies", "Lily Roberts", "Archie Lewis", "Ella Parker"];
const levels: Level[] = [4, 5, 6, 4, 5, 4, 6, 4, 4, 5, 4, 6, 4, 5, 4, 6, 4, 5, 4, 6, 4, 5, 4, 6];
export const MOCK_LEARNERS: Learner[] = names.map((name, i) => ({
  id: `FJ-${2026001 + i}`,
  name,
  email: `${name.toLowerCase().replaceAll(" ", ".")}@example.com`,
  level: levels[i],
  lectureNights: levels[i] === 4 ? "Tue & Thu" : "Mon & Wed",
  pathway: PATHWAYS[i % PATHWAYS.length],
  cohort: COHORTS[i % COHORTS.length],
  status: i % 7 === 3 ? "Resubmission Needed" : i % 3 === 1 ? "Pending" : "Submitted",
  requirements: i === 0 || i === 8 ? "CAD bridging" : i === 3 || i === 10 ? "GCSE English" : "",
  notes: ["Progressing well", "Unit 2 review scheduled", "All units up to date", "Tutor feedback shared", "On track", "Additional tutor support", "", "Excellent engagement"][i % 8],
}));

export const MOCK_SESSIONS: LectureSession[] = [];
for (let day = new Date("2026-11-09T00:00:00Z"); day <= new Date("2026-12-17T00:00:00Z"); day.setUTCDate(day.getUTCDate() + 1)) {
  const weekday = day.getUTCDay();
  if (weekday < 1 || weekday > 4) continue;
  const isLevel4 = weekday === 2 || weekday === 4;
  const date = day.toISOString().slice(0, 10);
  MOCK_SESSIONS.push({
    id: `lecture-${date}`,
    courseCode: isLevel4 ? "CON4-102" : "CON5-204",
    moduleTitle: isLevel4 ? "Construction Technology" : "Contracts & Project Management",
    startsAt: `${date}T18:30:00Z`,
    endsAt: `${date}T20:30:00Z`,
    levels: isLevel4 ? [4] : [5, 6],
    cohorts: ["Jan 2026", "Sept 2026"],
    lecturer: isLevel4 ? "Sarah Mitchell" : "David Richardson",
    teamsUrl: null,
  });
}

export const MOCK_DEADLINES: AssessmentDeadline[] = [
  { id: "deadline-1", title: "Construction Technology · Unit 2", date: "2026-11-13", level: 4, cohort: "Sept 2026" },
  { id: "deadline-2", title: "Contracts & Project Management · Unit 3", date: "2026-11-20", level: 5, cohort: "Jan 2026" },
  { id: "deadline-3", title: "Professional Practice · Research proposal", date: "2026-11-27", level: 6, cohort: "Jan 2026" },
  { id: "deadline-4", title: "Construction Technology · Unit 3", date: "2026-12-11", level: 4, cohort: "Sept 2026" },
  { id: "deadline-5", title: "Project Management · Case study", date: "2026-12-16", level: 5, cohort: "Jan 2026" },
];
