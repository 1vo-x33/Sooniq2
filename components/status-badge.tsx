import { cn } from "@/lib/utils"

type Status = "pending" | "approved" | "rejected"
type AbsenceType = "sick" | "late" | "other"

const statusConfig: Record<Status, { label: string; className: string }> = {
  pending:  { label: "Pending",  className: "bg-amber-400/15  text-amber-700  border-amber-400/40" },
  approved: { label: "Approved", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/40" },
  rejected: { label: "Rejected", className: "bg-red-500/15    text-red-700    border-red-500/40" },
}

const typeConfig: Record<AbsenceType, { label: string; className: string }> = {
  sick:  { label: "Sick",  className: "bg-primary/10  text-primary   border-primary/25" },
  late:  { label: "Late",  className: "bg-orange-500/12 text-orange-700 border-orange-400/35" },
  other: { label: "Other", className: "bg-slate-200    text-slate-600  border-slate-300" },
}

export function StatusBadge({ status }: { status: Status }) {
  const cfg = statusConfig[status]
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border", cfg.className)}>
      {cfg.label}
    </span>
  )
}

export function TypeBadge({ type }: { type: AbsenceType }) {
  const cfg = typeConfig[type]
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border", cfg.className)}>
      {cfg.label}
    </span>
  )
}
