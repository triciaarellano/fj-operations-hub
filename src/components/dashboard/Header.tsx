import { ChevronRight, FileSpreadsheet, Menu, RefreshCw, ShieldCheck } from "lucide-react";
import type { DashboardTab } from "@/types/dashboard";

const titles: Record<DashboardTab, { title: string; subtitle: string }> = {
  overview: { title: "FJ Operations Hub", subtitle: "A clear view of your learners, lectures and delivery priorities." },
  directory: { title: "Learner Directory", subtitle: "Find learner records, study pathways and operational requirements." },
  schedules: { title: "Course Delivery & Schedules", subtitle: "Your upcoming lectures, cohort calendar and teaching schedule." },
  actions: { title: "Bridging & Action Items", subtitle: "Keep special requirements and learner follow-ups in view." },
};

interface HeaderProps {
  activePage: DashboardTab;
  refreshing: boolean;
  source: "sample" | "google-sheets";
  updatedAt: string;
  onRefresh: () => void;
  onOpenNavigation: () => void;
}

export function Header({ activePage, refreshing, source, updatedAt, onRefresh, onOpenNavigation }: HeaderProps) {
  const page = titles[activePage];
  return <>
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-[65px] max-w-[1680px] items-center justify-between gap-3 px-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-3 text-[11px]"><button className="icon-button shrink-0 lg:hidden" onClick={onOpenNavigation} aria-label="Open navigation"><Menu size={19} /></button><span className="hidden text-slate-400 sm:block">Workspace</span><ChevronRight size={13} className="hidden shrink-0 text-slate-300 sm:block" /><span className="truncate text-slate-600">{activePage === "overview" ? "Overview" : page.title}</span></div>
        <div className="flex shrink-0 items-center gap-4"><span className="hidden items-center gap-1.5 text-[10px] text-slate-400 sm:flex"><ShieldCheck size={14} />Internal staff portal</span><span className="hidden h-6 border-l border-slate-200 sm:block" /><span className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-[#364f6b]" aria-label="Delivery team">FJ</span></div>
      </div>
    </header>
    <div className="mx-auto mb-7 mt-8 flex w-full max-w-[1680px] flex-wrap items-center justify-between gap-5 px-5 sm:px-8">
      <div><div className="mb-2 text-[10px] font-semibold tracking-[.18em] text-slate-400">YOUR STAFF WORKSPACE</div><h1 className="text-2xl font-semibold tracking-tight text-[#293e56] xl:text-3xl">{page.title}</h1><p className="mt-2 text-xs text-slate-500">{page.subtitle}</p></div>
      <div className="flex flex-col items-start gap-2.5 sm:items-end"><button className="button-primary" onClick={onRefresh} disabled={refreshing}><RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />{refreshing ? "Refreshing…" : "Refresh data"}</button><span role="status" className="flex items-center gap-1.5 text-[10px] text-slate-400"><FileSpreadsheet size={12} /><span className={`size-1.5 rounded-full ${source === "sample" ? "bg-amber-400" : "bg-emerald-400"}`} />{source === "sample" ? "Sample learner data" : "Google Sheets connected"}{updatedAt && <span>· {new Date(updatedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>}</span></div>
    </div>
  </>;
}
