"use client"

import { useRouter } from "next/navigation"
import useSWR from "swr"
import { CalendarDays, ClipboardCheck, ClipboardList, Clock, TrendingUp, Users } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge, TypeBadge } from "@/components/status-badge"
import { format } from "date-fns"

interface Absence {
  id: number
  student_name: string
  subject_name: string | null
  date: string
  type: "sick" | "late" | "other"
  status: "pending" | "approved" | "rejected"
  reason: string | null
}

interface StudentStats {
  total: number
  sick: number
  late: number
  other: number
  pending: number
  approved: number
}

interface TeacherStats {
  total: number
  pending: number
  approved: number
  rejected: number
  students: number
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const { data: stats } = useSWR(user ? "/api/stats" : null)
  const { data: absences } = useSWR<Absence[]>(user ? "/api/absences?status=pending" : null)

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const today = format(new Date(), "EEEE, MMMM d")

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="rounded-2xl bg-sidebar px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sidebar-foreground/60 text-xs font-medium uppercase tracking-widest mb-0.5">{today}</p>
          <h1 className="text-2xl font-extrabold text-sidebar-foreground tracking-tight">
            Hey, {user.name.split(" ")[0]}
          </h1>
          <p className="text-sidebar-foreground/60 text-sm mt-0.5">
            {user.role === "student" ? "Here's your activity overview." : "Manage your students' absences."}
          </p>
        </div>
        {user.role === "student" && (
          <Button
            onClick={() => router.push("/absences/report")}
            className="shrink-0 bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground font-semibold shadow"
          >
            <ClipboardList size={16} className="mr-2" />
            Report Absence
          </Button>
        )}
      </div>

      {/* Stats */}
      {user.role === "student" && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard label="Total Reports" value={(stats as StudentStats).total} icon={<ClipboardList size={20} />} />
          <StatCard label="Sick Days" value={(stats as StudentStats).sick} icon={<CalendarDays size={20} />} color="blue" />
          <StatCard label="Late Arrivals" value={(stats as StudentStats).late} icon={<Clock size={20} />} color="orange" />
          <StatCard label="Pending" value={(stats as StudentStats).pending} icon={<TrendingUp size={20} />} color="amber" />
        </div>
      )}

      {user.role === "teacher" && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard label="Total Reports" value={(stats as TeacherStats).total} icon={<ClipboardList size={20} />} />
          <StatCard label="Pending Review" value={(stats as TeacherStats).pending} icon={<Clock size={20} />} color="amber" />
          <StatCard label="Approved" value={(stats as TeacherStats).approved} icon={<ClipboardCheck size={20} />} color="green" />
          <StatCard label="Students" value={(stats as TeacherStats).students} icon={<Users size={20} />} color="blue" />
        </div>
      )}

      {/* Recent / Pending absences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {user.role === "student" ? "Your Recent Absences" : "Pending Absences"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!absences?.length ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {user.role === "student" ? "No absences reported yet." : "No pending absence reports."}
            </p>
          ) : (
            <div className="space-y-0 divide-y divide-border">
              {absences.slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-center justify-between py-3 gap-4">
                  <div className="min-w-0">
                    {user.role === "teacher" && (
                      <p className="text-sm font-medium text-foreground truncate">{a.student_name}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(a.date), "MMM d, yyyy")}
                      </span>
                      {a.subject_name && (
                        <span className="text-xs text-muted-foreground">· {a.subject_name}</span>
                      )}
                    </div>
                    {a.reason && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{a.reason}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <TypeBadge type={a.type} />
                    <StatusBadge status={a.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {(absences?.length ?? 0) > 0 && (
            <div className="pt-3 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(user.role === "teacher" ? "/teacher/absences" : "/absences")}
                className="text-primary hover:text-primary"
              >
                View all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color = "default",
}: {
  label: string
  value: number
  icon: React.ReactNode
  color?: "default" | "blue" | "orange" | "amber" | "green"
}) {
  const colorMap: Record<string, { card: string; icon: string; value: string }> = {
    default: { card: "border-l-4 border-l-primary", icon: "bg-primary text-white", value: "text-primary" },
    blue:    { card: "border-l-4 border-l-blue-500", icon: "bg-blue-500 text-white", value: "text-blue-600" },
    orange:  { card: "border-l-4 border-l-orange-500", icon: "bg-orange-500 text-white", value: "text-orange-600" },
    amber:   { card: "border-l-4 border-l-amber-400", icon: "bg-amber-400 text-white", value: "text-amber-600" },
    green:   { card: "border-l-4 border-l-emerald-500", icon: "bg-emerald-500 text-white", value: "text-emerald-600" },
  }
  const c = colorMap[color]
  return (
    <Card className={c.card}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-extrabold mt-1 ${c.value}`}>{value ?? 0}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${c.icon}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
