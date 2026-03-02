"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Check, Loader2, X } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge, TypeBadge } from "@/components/status-badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Absence {
  id: number
  student_name: string
  subject_name: string | null
  date: string
  type: "sick" | "late" | "other"
  status: "pending" | "approved" | "rejected"
  reason: string | null
  created_at: string
}

export default function TeacherAbsencesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState("all")
  const [reviewing, setReviewing] = useState<number | null>(null)

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login")
    if (!isLoading && user?.role !== "teacher") router.replace("/dashboard")
  }, [user, isLoading, router])

  const url = user
    ? `/api/absences${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`
    : null

  const { data: absences, isLoading: loadingAbsences, mutate } = useSWR<Absence[]>(url)

  const review = async (id: number, status: "approved" | "rejected") => {
    setReviewing(id)
    await fetch(`/api/absences/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setReviewing(null)
    mutate()
  }

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
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Manage Absences</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Review and approve student absence reports
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {absences?.length ?? 0} reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAbsences ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !absences?.length ? (
            <p className="text-center text-muted-foreground text-sm py-10">No reports found.</p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Student</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Date</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Subject</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Type</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Reason</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {absences.map((a) => (
                      <tr key={a.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-2.5 px-3 font-medium">{a.student_name}</td>
                        <td className="py-2.5 px-3">{format(new Date(a.date), "MMM d, yyyy")}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{a.subject_name ?? "—"}</td>
                        <td className="py-2.5 px-3"><TypeBadge type={a.type} /></td>
                        <td className="py-2.5 px-3 text-muted-foreground max-w-xs truncate">{a.reason ?? "—"}</td>
                        <td className="py-2.5 px-3"><StatusBadge status={a.status} /></td>
                        <td className="py-2.5 px-3">
                          {a.status === "pending" && (
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                onClick={() => review(a.id, "approved")}
                                disabled={reviewing === a.id}
                              >
                                {reviewing === a.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0 border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => review(a.id, "rejected")}
                                disabled={reviewing === a.id}
                              >
                                <X size={12} />
                              </Button>
                            </div>
                          )}
                        </td>
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
                      <span className="font-medium text-sm">{a.student_name}</span>
                      <StatusBadge status={a.status} />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">{format(new Date(a.date), "MMM d, yyyy")}</span>
                      <TypeBadge type={a.type} />
                      {a.subject_name && <span className="text-xs text-muted-foreground">{a.subject_name}</span>}
                    </div>
                    {a.reason && <p className="text-xs text-muted-foreground">{a.reason}</p>}
                    {a.status === "pending" && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          onClick={() => review(a.id, "approved")}
                          disabled={reviewing === a.id}
                        >
                          {reviewing === a.id ? <Loader2 size={12} className="mr-1.5 animate-spin" /> : <Check size={12} className="mr-1.5" />}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => review(a.id, "rejected")}
                          disabled={reviewing === a.id}
                        >
                          <X size={12} className="mr-1.5" />
                          Reject
                        </Button>
                      </div>
                    )}
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
