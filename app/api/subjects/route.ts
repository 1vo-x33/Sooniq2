import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getSession } from "@/lib/session"

interface SubjectRow {
  id: number
  name: string
  teacher_name: string | null
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const classId = searchParams.get("classId") ?? session.classId

  if (!classId) {
    const rows = await query<SubjectRow[]>(
      `SELECT s.id, s.name, u.name AS teacher_name
       FROM subjects s
       LEFT JOIN users u ON s.teacher_id = u.id
       ORDER BY s.name`
    )
    return NextResponse.json(rows)
  }

  const rows = await query<SubjectRow[]>(
    `SELECT DISTINCT s.id, s.name, u.name AS teacher_name
     FROM subjects s
     JOIN schedule_entries se ON se.subject_id = s.id
     LEFT JOIN users u ON s.teacher_id = u.id
     WHERE se.class_id = ?
     ORDER BY s.name`,
    [classId]
  )
  return NextResponse.json(rows)
}
