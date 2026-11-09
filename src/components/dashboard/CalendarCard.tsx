"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatSessionTime, formatUKDate } from "@/lib/dashboard";
import type { AssessmentDeadline, LectureSession, Level } from "@/types/dashboard";

const levelColors: Record<Level, { dot: string; selectedDot: string; day: string }> = {
  4: { dot: "bg-blue-500", selectedDot: "bg-blue-300", day: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
  5: { dot: "bg-violet-500", selectedDot: "bg-violet-300", day: "bg-violet-50 text-violet-700 hover:bg-violet-100" },
  6: { dot: "bg-emerald-500", selectedDot: "bg-emerald-300", day: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
};

interface CalendarCardProps {
  sessions: LectureSession[];
  deadlines: AssessmentDeadline[];
  selectedDate: string;
  month: string;
  onMonthChange: (month: string) => void;
  onSelectDate: (date: string) => void;
}

export function CalendarCard({ sessions, deadlines, selectedDate, month, onMonthChange, onSelectDate }: CalendarCardProps) {
  const first = new Date(`${month}-01T12:00:00Z`);
  const offset = (first.getUTCDay() + 6) % 7;
  const start = new Date(first);
  start.setUTCDate(1 - offset);
  const days = Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + i);
    return date;
  });
  const move = (delta: number) => {
    const date = new Date(first);
    date.setUTCMonth(date.getUTCMonth() + delta);
    onMonthChange(date.toISOString().slice(0, 7));
  };
  const selectedEvents = [
    ...sessions.filter((session) => session.startsAt.slice(0, 10) === selectedDate).map((session) => ({
      id: session.id,
      title: session.moduleTitle,
      detail: `${session.levels.map((level) => `L${level}`).join(" / ")} · ${formatSessionTime(session)}`,
      levels: session.levels,
      deadline: false,
    })),
    ...deadlines.filter((deadline) => deadline.date === selectedDate).map((deadline) => ({
      id: deadline.id,
      title: deadline.title,
      detail: `Level ${deadline.level} · ${deadline.cohort} · Assessment deadline`,
      levels: [deadline.level],
      deadline: true,
    })),
  ];

  return (
    <section className="panel flex h-full flex-col p-5 sm:p-6" aria-labelledby="calendar-title">
      <div className="section-eyebrow">YOUR DELIVERY CALENDAR</div>
      <div className="flex items-center justify-between gap-2">
        <h2 id="calendar-title" className="section-title">Cohort Calendar View</h2>
        <span className="text-[10px] text-slate-400">All intakes</span>
      </div>
      <div className="mb-5 mt-6 flex items-center justify-between">
        <h3 aria-live="polite" className="text-sm font-medium text-slate-600">
          {formatUKDate(first.toISOString(), { day: undefined, month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-2">
          <button className="icon-button" aria-label="Previous month" onClick={() => move(-1)}><ChevronLeft size={17} /></button>
          <button className="icon-button" aria-label="Next month" onClick={() => move(1)}><ChevronRight size={17} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day} className="mb-2 text-[10px] text-slate-400">{day}</span>)}
        {days.map((date) => {
          const key = date.toISOString().slice(0, 10);
          const current = key.startsWith(month);
          const selected = key === selectedDate;
          const lectureLevels = [...new Set(sessions.filter((session) => session.startsAt.startsWith(key)).flatMap((session) => session.levels))].sort();
          const deadlineLevels = [...new Set(deadlines.filter((item) => item.date === key).map((item) => item.level))].sort();
          const allLevels = [...new Set([...lectureLevels, ...deadlineLevels])];
          const tint = allLevels.length === 1
            ? levelColors[allLevels[0]].day
            : allLevels.length > 1
              ? "bg-gradient-to-br from-violet-50 to-emerald-50 text-slate-600 hover:from-violet-100 hover:to-emerald-100"
              : "text-slate-500 hover:bg-slate-50";
          const label = `${formatUKDate(key, { weekday: "long", year: "numeric" })}${lectureLevels.length ? `, lecture for ${lectureLevels.map((level) => `Level ${level}`).join(" and ")}` : ""}${deadlineLevels.length ? `, assessment deadline for ${deadlineLevels.map((level) => `Level ${level}`).join(" and ")}` : ""}`;

          return (
            <button key={key} aria-pressed={selected} aria-label={label} onClick={() => { onSelectDate(key); if (!current) onMonthChange(key.slice(0, 7)); }} className={`relative mx-auto flex size-9 flex-col items-center justify-center rounded-full text-[11px] transition-colors sm:size-10 ${selected ? "bg-[#364f6b] font-semibold text-white shadow-sm" : !current ? "text-slate-300 hover:bg-slate-50" : tint}`}>
              <span className="-mt-1">{date.getUTCDate()}</span>
              <span className="absolute bottom-1.5 flex items-center gap-1" aria-hidden="true">
                {lectureLevels.map((level) => <span key={`lecture-${level}`} className={`size-1 rounded-full ${selected ? levelColors[level].selectedDot : levelColors[level].dot}`} />)}
                {deadlineLevels.map((level) => <span key={`deadline-${level}`} className={`size-1 rotate-45 ${selected ? levelColors[level].selectedDot : levelColors[level].dot}`} />)}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 space-y-2.5 text-[10px] text-slate-400" aria-label="Calendar legend">
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {([4, 5, 6] as Level[]).map((level) => <span key={level} className="flex items-center gap-1.5"><span className={`size-1.5 rounded-full ${levelColors[level].dot}`} />Level {level}</span>)}
        </div>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[9px]">
          <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-slate-400" />Lecture session</span>
          <span className="flex items-center gap-1.5"><span className="size-1.5 rotate-45 bg-slate-400" />Assessment deadline</span>
        </div>
      </div>
      <div className="mt-5 border-t border-slate-100 pt-4" aria-live="polite">
        <h3 className="mb-2 text-[10px] font-medium text-slate-400">{formatUKDate(selectedDate, { weekday: "long" })}</h3>
        {selectedEvents.length ? selectedEvents.map((event) => (
          <div key={event.id} className="mt-2 flex items-start gap-2">
            <span className="mt-1.5 flex shrink-0 gap-1" aria-hidden="true">
              {event.levels.map((level) => <span key={level} className={`size-1.5 ${event.deadline ? "rotate-45" : "rounded-full"} ${levelColors[level].dot}`} />)}
            </span>
            <div><p className="text-[11px] font-medium text-slate-600">{event.title}</p><p className="mt-1 text-[10px] text-slate-400">{event.detail}</p></div>
          </div>
        )) : <p className="text-[11px] text-slate-400">No sessions or deadlines on this date.</p>}
      </div>
    </section>
  );
}
