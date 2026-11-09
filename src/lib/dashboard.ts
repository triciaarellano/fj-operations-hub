import type { FilterState, Learner, LectureSession } from "@/types/dashboard";

export function filterLearners(learners: Learner[], filters: FilterState): Learner[] {
  const query = filters.search.trim().toLowerCase();
  return learners.filter((learner) =>
    (!query || [learner.name, learner.email, learner.id].some((value) => value.toLowerCase().includes(query))) &&
    (!filters.levels.length || filters.levels.includes(learner.level)) &&
    (!filters.pathways.length || filters.pathways.includes(learner.pathway)) &&
    (!filters.cohorts.length || filters.cohorts.includes(learner.cohort)));
}

export function getUpcomingSessions(sessions: LectureSession[], now: string): LectureSession[] {
  return sessions.filter((session) => Date.parse(session.endsAt) > Date.parse(now)).sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}

export function formatUKDate(value: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", ...options }).format(new Date(value));
}

export function formatSessionTime(session: LectureSession): string {
  const format = (value: string) => formatUKDate(value, { day: undefined, month: undefined, hour: "2-digit", minute: "2-digit", hour12: false });
  const zone = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", timeZoneName: "short" }).formatToParts(new Date(session.startsAt)).find((part) => part.type === "timeZoneName")?.value ?? "UK";
  return `${format(session.startsAt)} – ${format(session.endsAt)} ${zone}`;
}

export function downloadLearnersCsv(learners: Learner[]): void {
  const header = ["Learner No / ID", "Learner Name", "Email", "Level", "Lecture Nights", "Study Pathway", "Submission Status", "Bridging / Special Requirements", "Comments / Operational Notes", "Cohort / Intake"];
  const escape = (value: string | number) => `"${String(value).replace(/^[=+@\-\t\r]/, "'$&").replaceAll('"', '""')}"`;
  const csv = [header, ...learners.map((l) => [l.id, l.name, l.email, l.level, l.lectureNights, l.pathway, l.status, l.requirements, l.notes, l.cohort])].map((row) => row.map(escape).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "fj-learner-directory.csv";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
