import { ArrowUpRight, CalendarDays, GraduationCap, Users } from "lucide-react";
import { formatSessionTime, formatUKDate } from "@/lib/dashboard";
import type { Learner, LectureSession, Level } from "@/types/dashboard";
import { LevelBadge } from "./Badges";

export function MetricCards({ learners, nextSession }: { learners: Learner[]; nextSession?: LectureSession }) {
  return <section aria-label="Delivery overview" className="mb-7 grid grid-cols-2 gap-3 xl:grid-cols-5 xl:gap-4">
    <article className="panel p-5"><div className="flex items-center justify-between text-xs text-slate-500">Active learners<Users size={17} className="text-slate-400" /></div><div className="mt-3 text-[32px] font-semibold leading-none tracking-tight text-[#364f6b]">{learners.length}</div><p className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400"><span className="size-1.5 rounded-full bg-emerald-400" />Across all study pathways</p></article>
    {([4, 5, 6] as Level[]).map((level) => <article key={level} className="panel p-5"><div className="flex items-center justify-between"><LevelBadge level={level} /><GraduationCap size={17} className="text-slate-300" /></div><div className="mt-3 flex items-end gap-2"><strong className="text-[32px] font-semibold leading-none tracking-tight text-[#364f6b]">{learners.filter((learner) => learner.level === level).length}</strong><span className="mb-0.5 text-[11px] text-slate-400">learners</span></div><p className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400"><CalendarDays size={12} />{level === 4 ? "Tue & Thu" : "Mon & Wed"} lectures</p></article>)}
    <article className="col-span-2 rounded-xl border border-[#364f6b] bg-[#364f6b] p-5 text-white shadow-sm xl:col-span-1"><div className="flex items-center justify-between text-xs text-slate-200">Next upcoming lecture<ArrowUpRight size={17} className="text-slate-300" /></div><div className="mt-3 text-[24px] font-semibold leading-none tracking-tight">{nextSession ? formatUKDate(nextSession.startsAt, { weekday: "short", day: "numeric", month: "short" }) : "All caught up"}</div><p className="mt-3 text-[10px] text-slate-300">{nextSession ? `${nextSession.courseCode} · ${formatSessionTime(nextSession)}` : "No upcoming lectures scheduled"}</p></article>
  </section>;
}
