"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, ClipboardList, CircleHelp, Database, FileSpreadsheet, GraduationCap, LayoutDashboard, ShieldCheck, Users, X } from "lucide-react";
import type { DashboardTab } from "@/types/dashboard";

const navigation = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "directory", label: "Learner Directory", icon: Users },
  { id: "schedules", label: "Course Delivery & Schedules", icon: CalendarDays },
  { id: "actions", label: "Bridging & Action Items", icon: ClipboardList },
] as const;

interface SidebarProps {
  activePage: DashboardTab;
  mobileOpen: boolean;
  connected: boolean;
  onNavigate: (page: DashboardTab) => void;
  onClose: () => void;
  onOpenDialog: (dialog: "integration" | "help") => void;
}

function SidebarContent({ activePage, connected, onNavigate, onClose, onOpenDialog }: Omit<SidebarProps, "mobileOpen">) {
  return <>
    <div className="flex h-[120px] shrink-0 items-center justify-between px-2">
      <Link href="/" className="flex items-center gap-2.5" aria-label="Francis James Operations Hub">
        <Image src="/images/fj-logo.png" alt="Francis James" width={1167} height={709} className="h-auto w-[100px]" />
      </Link>
      <button onClick={onClose} aria-label="Close navigation" className="icon-button lg:hidden"><X size={17} /></button>
    </div>
    <p className="mb-3 px-3 text-[9px] font-semibold tracking-[.15em] text-slate-400">WORKSPACE</p>
    <nav aria-label="Main navigation" className="space-y-1">
      {navigation.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => onNavigate(id)} aria-current={activePage === id ? "page" : undefined} className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-left text-[11px] leading-relaxed transition-colors ${activePage === id ? "bg-[#edf2f7] font-semibold text-[#364f6b]" : "text-slate-500 hover:bg-slate-50 hover:text-[#364f6b]"}`}><Icon size={17} className="shrink-0" strokeWidth={1.7} /><span>{label}</span></button>)}
    </nav>
    <p className="mb-3 mt-8 px-3 text-[9px] font-semibold tracking-[.15em] text-slate-400">MANAGEMENT</p>
    <button onClick={() => onOpenDialog("integration")} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-left text-[11px] text-slate-500 hover:bg-slate-50"><Database size={17} strokeWidth={1.7} />Data integration<span className={`ml-auto size-1.5 rounded-full ${connected ? "bg-emerald-400" : "bg-amber-400"}`} /></button>
    <div className="mt-auto pt-10">
      <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4"><FileSpreadsheet size={21} className="mb-3 text-emerald-600/60" /><h2 className="text-[11px] font-semibold text-slate-600">Your data, connected.</h2><p className="mb-4 mt-2 text-[10px] leading-relaxed text-slate-400">A single view of your delivery spreadsheet.</p><button onClick={() => onOpenDialog("integration")} className="flex w-full items-center justify-between text-[10px] font-medium text-[#364f6b]">{connected ? "View connection" : "Connect Google Sheet"}<ArrowRight size={13} /></button></div>
      <button onClick={() => onOpenDialog("help")} className="my-4 flex w-full items-center gap-2 px-2 py-2 text-[11px] text-slate-500 hover:text-[#364f6b]"><CircleHelp size={16} />Help & support<ArrowRight size={13} className="ml-auto" /></button>
      <div className="flex items-center gap-2.5 border-t border-slate-200 px-1 py-4"><span className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-[#364f6b]">FJ</span><span className="text-[11px] font-medium text-slate-600">Delivery team<small className="mt-1 block text-[9px] font-normal text-slate-400">Staff administrator</small></span><ShieldCheck size={15} className="ml-auto text-slate-400" /></div>
    </div>
  </>;
}

export function Sidebar(props: SidebarProps) {
  const mobileRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (props.mobileOpen) mobileRef.current?.showModal();
    else mobileRef.current?.close();
  }, [props.mobileOpen]);

  return <>
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col overflow-y-auto border-r border-slate-200 bg-white px-4 lg:flex"><SidebarContent {...props} /></aside>
    <dialog ref={mobileRef} aria-label="Workspace navigation" onClose={props.onClose} onClick={(event) => { if (event.target === event.currentTarget) props.onClose(); }} className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-64 max-w-[85vw] border-0 bg-white p-0 text-slate-600 shadow-xl backdrop:bg-slate-900/30 backdrop:backdrop-blur-sm"><div className="flex min-h-full flex-col px-4"><SidebarContent {...props} /></div></dialog>
  </>;
}
