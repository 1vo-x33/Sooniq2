"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Plus } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge, TypeBadge } from "@/components/status-badge"

interface Absence {
  id: number
  subject_name: string | null
  date: string
  type: "sick" | "late" | "other"
  status: "pending" | "approved" | "rejected"
  reason: string | null
  created_at: string
}

export default function StudentAbsencesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login")
    if (!isLoading && user?.role !== "student") router.replace("/dashboard")
  }, [user, isLoading, router])

  const { data: absences, isLoading: loadingAbsences } = useSWR<Absence[]>(
    user ? "/api/absences" : null
  )

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">My Absences</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {absences?.length ?? 0} reports total
          </p>
        </div>
        <Button onClick={() => router.push("/absences/report")} className="shrink-0">
          <Plus size={16} className="mr-2" />
          Report Absence
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">All Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAbsences ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !absences?.length ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground text-sm">No absence reports yet.</p>
              <Button variant="outline" className="mt-4" onClick={() => router.push("/absences/report")}>
                Report your first absence
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Date</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Subject</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Type</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Reason</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {absences.map((a) => (
                      <tr key={a.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-2.5 px-3 font-medium">{format(new Date(a.date), "MMM d, yyyy")}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{a.subject_name ?? "—"}</td>
                        <td className="py-2.5 px-3"><TypeBadge type={a.type} /></td>
                        <td className="py-2.5 px-3 text-muted-foreground max-w-xs truncate">{a.reason ?? "—"}</td>
                        <td className="py-2.5 px-3"><StatusBadge status={a.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden space-y-3">
                {absences.map((a) => (
                  <div key={a.id} className="border border-border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{format(new Date(a.date), "MMM d, yyyy")}</span>
                      <StatusBadge status={a.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      <TypeBadge type={a.type} />
                      {a.subject_name && <span className="text-xs text-muted-foreground">{a.subject_name}</span>}
                    </div>
                    {a.reason && <p className="text-xs text-muted-foreground">{a.reason}</p>}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
