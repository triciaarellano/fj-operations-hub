"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileSpreadsheet, ShieldCheck } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { WorkspaceDialog } from "@/components/dashboard/WorkspaceDialog";
import { Header } from "@/components/dashboard/Header";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { TimetableCard } from "@/components/dashboard/TimetableCard";
import { CalendarCard } from "@/components/dashboard/CalendarCard";
import { LearnerDirectory } from "@/components/dashboard/LearnerDirectory";
import { ScheduleView } from "@/components/dashboard/ScheduleView";
import { ActionItems } from "@/components/dashboard/ActionItems";
import { EMPTY_FILTERS, MOCK_DEADLINES, MOCK_LEARNERS, MOCK_REFERENCE_TIME, MOCK_SESSIONS } from "@/data/mockData";
import { getUpcomingSessions } from "@/lib/dashboard";
import { fetchLearners } from "@/lib/learners";
import type { DashboardTab, FilterState, Learner, LearnerResponse } from "@/types/dashboard";

export default function Home() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [data, setData] = useState<LearnerResponse>({ learners: MOCK_LEARNERS, source: "sample", message: "Sample learners are displayed until your Google Sheet is connected.", updatedAt: "" });
  const [filters, setFilters] = useState<FilterState>({ ...EMPTY_FILTERS });
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workspaceDialog, setWorkspaceDialog] = useState<"integration" | "help" | null>(null);
  const [now, setNow] = useState(MOCK_REFERENCE_TIME);
  const [selectedDate, setSelectedDate] = useState("2026-11-09");
  const [calendarMonth, setCalendarMonth] = useState("2026-11");
  const requestRef = useRef<AbortController | null>(null);
  const sessions = useMemo(() => getUpcomingSessions(MOCK_SESSIONS, now), [now]);

  const refresh = useCallback(async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setRefreshing(true);
    setError("");
    try {
      const result = await fetchLearners(controller.signal);
      if (!controller.signal.aborted) setData(result);
    } catch (cause) {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Unable to refresh learner records.");
    } finally {
      if (!controller.signal.aborted) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const updateTime = () => setNow(new Date().toISOString());
    updateTime();
    const timer = setInterval(updateTime, 60_000);
    return () => { requestRef.current?.abort(); clearInterval(timer); };
  }, [refresh]);

  const selectDate = (date: string) => { setSelectedDate(date); setCalendarMonth(date.slice(0, 7)); };
  const viewLearner = (learner: Learner) => { setFilters({ ...EMPTY_FILTERS, search: learner.id }); setActiveTab("directory"); };

  return <>
    <a href="#main-content" className="sr-only z-50 rounded-lg bg-[#364f6b] px-5 py-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to dashboard</a>
    <Sidebar activePage={activeTab} mobileOpen={sidebarOpen} connected={data.source === "google-sheets"} onNavigate={(page) => { setActiveTab(page); setSidebarOpen(false); }} onClose={() => setSidebarOpen(false)} onOpenDialog={(kind) => { setSidebarOpen(false); setWorkspaceDialog(kind); }} />
    <div className="min-w-0 lg:ml-56">
    <Header activePage={activeTab} onOpenNavigation={() => setSidebarOpen(true)} refreshing={refreshing} source={data.source} updatedAt={data.updatedAt} onRefresh={() => void refresh()} />
    <main id="main-content" className="mx-auto w-full max-w-[1680px] px-5 pb-7 sm:px-8">
      {activeTab === "overview" && <MetricCards learners={data.learners} nextSession={sessions[0]} />}
      {(activeTab === "overview" || activeTab === "schedules") && <div className="mb-6 grid items-stretch gap-5 xl:grid-cols-[1.35fr_1fr]">
        <TimetableCard sessions={sessions} now={now} onSelectDate={selectDate} />
        <CalendarCard sessions={MOCK_SESSIONS} deadlines={MOCK_DEADLINES} selectedDate={selectedDate} month={calendarMonth} onMonthChange={setCalendarMonth} onSelectDate={selectDate} />
      </div>}
      {error && <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-xs text-rose-600"><p>{error} Displayed learner records have been retained.</p><button onClick={() => void refresh()} className="font-medium underline">Try again</button></div>}
      {(data.source === "sample" || activeTab === "overview" || activeTab === "schedules") && <p className="mb-4 flex items-start gap-2 text-[10px] leading-relaxed text-slate-400"><FileSpreadsheet size={13} className="mt-0.5 shrink-0" /><span>{data.source === "sample" ? `${data.message} ` : ""}{(activeTab === "overview" || activeTab === "schedules") && "The timetable and assessment dates are illustrative."}</span></p>}
      <div id={`page-${activeTab}`}>
        {activeTab === "directory" && <LearnerDirectory learners={data.learners} filters={filters} onFiltersChange={setFilters} refreshing={refreshing} />}
        {activeTab === "schedules" && <ScheduleView sessions={sessions} />}
        {activeTab === "actions" && <ActionItems learners={data.learners} onViewLearner={viewLearner} />}
      </div>
      <footer className="mt-7 flex flex-wrap items-center justify-between gap-3 text-[10px] text-slate-400"><p>Francis James <span className="mx-1.5 text-slate-300">·</span> Building futures through education.</p><p className="flex items-center gap-1.5"><ShieldCheck size={13} />Staff workspace</p></footer>
    </main>
    </div>
    <WorkspaceDialog kind={workspaceDialog} message={data.message} onClose={() => setWorkspaceDialog(null)} onRefresh={() => void refresh()} />
  </>;
}
