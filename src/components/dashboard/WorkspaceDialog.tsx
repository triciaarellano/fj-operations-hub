"use client";

import { useEffect, useRef } from "react";
import { CircleHelp, FileSpreadsheet, RefreshCw, X } from "lucide-react";

interface WorkspaceDialogProps {
  kind: "integration" | "help" | null;
  message: string;
  onClose: () => void;
  onRefresh: () => void;
}

export function WorkspaceDialog({ kind, message, onClose, onRefresh }: WorkspaceDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (kind) ref.current?.showModal(); else ref.current?.close(); }, [kind]);
  return <dialog ref={ref} aria-labelledby="workspace-dialog-title" onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} className="m-auto max-h-[calc(100dvh-40px)] w-[calc(100%-32px)] max-w-lg rounded-2xl border border-slate-200 bg-white p-7 text-slate-600 shadow-2xl backdrop:bg-slate-900/35 backdrop:backdrop-blur-sm">
    <button onClick={onClose} aria-label="Close dialog" className="icon-button absolute right-3 top-3"><X size={18} /></button>
    {kind === "integration" ? <>
      <FileSpreadsheet size={28} className="mb-5 text-emerald-600/70" /><h2 id="workspace-dialog-title" className="section-title">Connect your Google Sheet</h2><p className="mt-3 text-xs leading-relaxed text-slate-400">{message}</p>
      <ol className="my-5 list-decimal space-y-3 pl-4 text-xs leading-relaxed"><li>Deploy your Google Apps Script as a Web App returning learner records as JSON.</li><li>Copy <code>.env.example</code> to <code>.env.local</code> and set <code>GOOGLE_APPS_SCRIPT_URL</code> to your deployment’s <code>/exec</code> URL.</li><li>Restart the app, then refresh the dashboard.</li></ol>
      <button className="button-primary" onClick={() => { onClose(); onRefresh(); }}><RefreshCw size={14} />Check connection</button>
    </> : <><CircleHelp size={28} className="mb-5 text-slate-400" /><h2 id="workspace-dialog-title" className="section-title">Your staff workspace</h2><ul className="mt-4 list-disc space-y-3 pl-4 text-xs leading-relaxed text-slate-500"><li>Use the sidebar to open the overview, learner directory, course schedules, or action items.</li><li>Search learners by name, email or ID. Combine multiple intake, level and pathway filters.</li><li>The calendar uses blue for Level 4, purple for Level 5 and emerald for Level 6. A diamond marks an assessment deadline.</li><li>Update source records in Google Sheets, then use Refresh data to load the latest information.</li></ul></>}
  </dialog>;
}
