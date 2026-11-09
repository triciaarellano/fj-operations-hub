"use client";

import { useEffect, useRef } from "react";
import { FileSpreadsheet, X } from "lucide-react";
import type { Learner } from "@/types/dashboard";
import { LevelBadge, StatusBadge } from "./Badges";

export function LearnerDetails({ learner, onClose }: { learner: Learner | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (learner) ref.current?.showModal(); else ref.current?.close(); }, [learner]);
  return <dialog ref={ref} onClose={onClose} aria-labelledby="learner-detail-title" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} className="m-auto max-h-[calc(100dvh-40px)] w-[calc(100%-32px)] max-w-lg rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/35 backdrop:backdrop-blur-sm">{learner && <div className="relative p-7"><button className="icon-button absolute right-3 top-3" onClick={onClose} aria-label="Close learner details"><X size={18} /></button><div className="section-eyebrow">LEARNER RECORD</div><h2 id="learner-detail-title" className="text-2xl font-semibold tracking-tight text-[#364f6b]">{learner.name}</h2><p className="mb-4 mt-2 text-xs text-slate-400">{learner.id} · {learner.cohort} intake</p><div className="mb-5 flex gap-2"><LevelBadge level={learner.level} /><StatusBadge status={learner.status} /></div><dl className="divide-y divide-slate-100">{[
    ["Email address", <a key="email" href={`mailto:${learner.email}`} className="hover:underline">{learner.email}</a>],
    ["Study pathway", learner.pathway], ["Lecture nights", learner.lectureNights],
    ["Bridging / requirements", learner.requirements || "None recorded"], ["Operational notes", learner.notes || "No notes recorded"],
  ].map(([label, value]) => <div key={String(label)} className="grid grid-cols-[130px_1fr] gap-4 py-3.5 text-xs"><dt className="text-slate-400">{label}</dt><dd className="min-w-0 break-words text-slate-600">{value}</dd></div>)}</dl><p className="mt-5 flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-[10px] text-slate-400"><FileSpreadsheet size={15} />Learner records are managed in your delivery spreadsheet.</p></div>}</dialog>;
}
