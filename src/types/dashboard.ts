export type Level = 4 | 5 | 6;
export type Cohort = "Jan 2026" | "Sept 2026" | "Jan 2027";
export type StudyPathway = "Quantity Surveying" | "Civil Engineering" | "Building Services Engineering" | "Construction Management";
export type SubmissionStatus = "Pending" | "Submitted" | "Resubmission Needed";

export interface Learner {
  id: string;
  name: string;
  email: string;
  level: Level;
  lectureNights: string;
  pathway: StudyPathway;
  cohort: Cohort;
  status: SubmissionStatus;
  requirements: string;
  notes: string;
}

export interface LectureSession {
  id: string;
  courseCode: string;
  moduleTitle: string;
  startsAt: string;
  endsAt: string;
  levels: Level[];
  cohorts: Cohort[];
  lecturer: string;
  teamsUrl: string | null;
}

export interface AssessmentDeadline {
  id: string;
  title: string;
  date: string;
  level: Level;
  cohort: Cohort;
}

export interface FilterState {
  search: string;
  levels: Level[];
  pathways: StudyPathway[];
  cohorts: Cohort[];
}

export type DashboardTab = "overview" | "directory" | "schedules" | "actions";
export interface LearnerResponse {
  learners: Learner[];
  source: "google-sheets" | "sample";
  message: string;
  updatedAt: string;
}
