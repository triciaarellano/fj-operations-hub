import type { Level, SubmissionStatus } from "@/types/dashboard";

const levelStyles = { 4: "border-blue-100 bg-blue-50 text-blue-600", 5: "border-violet-100 bg-violet-50 text-violet-600", 6: "border-emerald-100 bg-emerald-50 text-emerald-600" };
export function LevelBadge({ level }: { level: Level }) {
  return <span className={`inline-flex whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-medium ${levelStyles[level]}`}>Level {level}</span>;
}

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  const style = status === "Submitted" ? "bg-emerald-50 text-emerald-700" : status === "Pending" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700";
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-medium ${style}`}><span className="size-1 rounded-full bg-current" />{status}</span>;
}
