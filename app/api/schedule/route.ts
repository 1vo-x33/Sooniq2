import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getSession } from "@/lib/session"

interface ScheduleRow {
  id: number
  subject_name: string
  teacher_name: string | null
  day_of_week: number
  start_time: string
  end_time: string
  room: string | null
  class_name: string
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const classId = searchParams.get("classId") ?? session.classId

  if (!classId) {
    return NextResponse.json([])
  }

  const rows = await query<ScheduleRow[]>(
    `SELECT se.id, s.name AS subject_name, u.name AS teacher_name,
            se.day_of_week, se.start_time, se.end_time, se.room, c.name AS class_name
     FROM schedule_entries se
     JOIN subjects s ON se.subject_id = s.id
     JOIN classes c ON se.class_id = c.id
     LEFT JOIN users u ON s.teacher_id = u.id
     WHERE se.class_id = ?
     ORDER BY se.day_of_week, se.start_time`,
    [classId]
  )

  return NextResponse.json(rows)
}
