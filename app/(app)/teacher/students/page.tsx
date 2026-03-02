"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StudentStat {
  id: number
  name: string
  email: string
  class_name: string | null
  total: number
  sick: number
  late: number
  pending: number
}

export default function TeacherStudentsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login")
    if (!isLoading && user?.role !== "teacher") router.replace("/dashboard")
  }, [user, isLoading, router])

  const { data: students, isLoading: loadingStudents } = useSWR<StudentStat[]>(
    user ? "/api/teacher/students" : null
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
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Students</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Overview of all registered students</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {students?.length ?? 0} students
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStudents ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !students?.length ? (
            <p className="text-center text-muted-foreground text-sm py-10">No students registered yet.</p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Name</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Class</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Total Reports</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Sick</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Late</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Pending</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {students.map((s) => (
                      <tr key={s.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-2.5 px-3">
                          <div>
                            <p className="font-medium">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.email}</p>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">{s.class_name ?? "—"}</td>
                        <td className="py-2.5 px-3 font-medium">{s.total}</td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            {s.sick}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                            {s.late}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                            {s.pending}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden space-y-3">
                {students.map((s) => (
                  <div key={s.id} className="border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.class_name ?? "No class"}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{s.total} reports</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        {s.sick} sick
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                        {s.late} late
                      </span>
                      {s.pending > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          {s.pending} pending
                        </span>
                      )}
                    </div>
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
