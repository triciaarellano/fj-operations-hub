"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MultiSelectProps<T extends string | number> {
  label: string;
  options: readonly T[];
  selected: T[];
  onChange: (values: T[]) => void;
  formatOption?: (option: T) => string;
}

export function MultiSelect<T extends string | number>({ label, options, selected, onChange, formatOption = String }: MultiSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [alignEnd, setAlignEnd] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);
  return <div className="relative" ref={ref} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }} onKeyDown={(event) => { if (event.key === "Escape") { setOpen(false); ref.current?.querySelector("button")?.focus(); } }}><button type="button" aria-expanded={open} onClick={() => { const bounds = ref.current?.getBoundingClientRect(); setAlignEnd(Boolean(bounds && bounds.left + 240 > window.innerWidth - 16)); setOpen(!open); }} className={`flex h-10 items-center gap-2 rounded-lg border bg-white px-3 text-[11px] ${selected.length ? "border-slate-400 text-[#364f6b]" : "border-slate-200 text-slate-500"}`}>{selected.length === 1 ? formatOption(selected[0]) : label}{selected.length > 1 && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px]">{selected.length}</span>}<ChevronDown size={13} className="ml-auto shrink-0 text-slate-400" /></button>{open && <fieldset className={`absolute top-12 z-20 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-lg ${alignEnd ? "right-0" : "left-0"}`}><legend className="sr-only">{label}</legend><button className="mb-1 w-full border-b border-slate-100 px-2 py-2 text-left text-[10px] text-slate-400 hover:text-[#364f6b]" onClick={() => onChange([])}>All options · Clear selection</button>{options.map((option) => <label key={option} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2.5 text-[11px] text-slate-600 hover:bg-slate-50"><input className="sr-only" type="checkbox" checked={selected.includes(option)} onChange={() => onChange(selected.includes(option) ? selected.filter((value) => value !== option) : [...selected, option])} /><span className={`flex size-3.5 shrink-0 items-center justify-center rounded border ${selected.includes(option) ? "border-[#364f6b] bg-[#364f6b] text-white" : "border-slate-300"}`}>{selected.includes(option) && <Check size={11} />}</span>{formatOption(option)}</label>)}</fieldset>}</div>;
}
