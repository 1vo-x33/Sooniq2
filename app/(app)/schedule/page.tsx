"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Clock, MapPin } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ScheduleEntry {
  id: number
  subject_name: string
  teacher_name: string | null
  day_of_week: number
  start_time: string
  end_time: string
  room: string | null
  class_name: string
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

function formatTime(t: string) {
  // t is "HH:MM:SS"
  const [h, m] = t.split(":")
  const hour = parseInt(h)
  const ampm = hour >= 12 ? "PM" : "AM"
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

export default function SchedulePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login")
  }, [user, isLoading, router])

  const { data: entries, isLoading: loadingSchedule } = useSWR<ScheduleEntry[]>(
    user ? "/api/schedule" : null
  )

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const byDay = DAYS.map((day, idx) => ({
    day,
    entries: (entries ?? []).filter((e) => e.day_of_week === idx + 1),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Weekly Schedule</h1>
        {entries?.[0]?.class_name && (
          <p className="text-muted-foreground text-sm mt-0.5">Class: {entries[0].class_name}</p>
        )}
      </div>

      {loadingSchedule ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !entries?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No schedule found. Your teacher will add your class schedule here.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {byDay.map(({ day, entries: dayEntries }) => (
            <Card key={day} className={dayEntries.length === 0 ? "opacity-50" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {day}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dayEntries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No classes</p>
                ) : (
                  <div className="space-y-3">
                    {dayEntries.map((e) => (
                      <div key={e.id} className="flex gap-3">
                        <div className="w-1 rounded-full bg-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{e.subject_name}</p>
                          {e.teacher_name && (
                            <p className="text-xs text-muted-foreground mt-0.5">{e.teacher_name}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock size={11} />
                              {formatTime(e.start_time)} – {formatTime(e.end_time)}
                            </span>
                            {e.room && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin size={11} />
                                {e.room}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
