import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getSession } from "@/lib/session"

interface AbsenceRow {
  id: number
  student_id: number
  student_name: string
  subject_name: string | null
  date: string
  type: "sick" | "late" | "other"
  reason: string | null
  status: "pending" | "approved" | "rejected"
  reviewed_at: string | null
  created_at: string
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const statusFilter = searchParams.get("status")

  if (session.role === "student") {
    let sql = `
      SELECT a.id, a.student_id, u.name AS student_name, s.name AS subject_name,
             a.date, a.type, a.reason, a.status, a.reviewed_at, a.created_at
      FROM absences a
      LEFT JOIN users u ON a.student_id = u.id
      LEFT JOIN subjects s ON a.subject_id = s.id
      WHERE a.student_id = ?
    `
    const params: unknown[] = [session.userId]
    if (statusFilter) {
      sql += " AND a.status = ?"
      params.push(statusFilter)
    }
    sql += " ORDER BY a.date DESC"
    const rows = await query<AbsenceRow[]>(sql, params)
    return NextResponse.json(rows)
  }

  // Teacher: see all absences for their classes
  let sql = `
    SELECT a.id, a.student_id, u.name AS student_name, s.name AS subject_name,
           a.date, a.type, a.reason, a.status, a.reviewed_at, a.created_at
    FROM absences a
    LEFT JOIN users u ON a.student_id = u.id
    LEFT JOIN subjects s ON a.subject_id = s.id
    WHERE 1=1
  `
  const params: unknown[] = []
  if (statusFilter) {
    sql += " AND a.status = ?"
    params.push(statusFilter)
  }
  sql += " ORDER BY a.date DESC LIMIT 200"
  const rows = await query<AbsenceRow[]>(sql, params)
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.userId || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { date, type, reason, subjectId } = await req.json()

  if (!date || !type) {
    return NextResponse.json({ error: "Date and type are required" }, { status: 400 })
  }

  const result = await query<{ insertId: number }>(
    `INSERT INTO absences (student_id, subject_id, date, type, reason, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    [session.userId, subjectId ?? null, date, type, reason ?? null]
  )

  // Create notification for teachers
  await query(
    `INSERT INTO notifications (user_id, title, message)
     SELECT u.id, 'New Absence Report', CONCAT(?, ' reported ', ?, ' on ', ?)
     FROM users u WHERE u.role = 'teacher'`,
    [session.name, type, date]
  )

  return NextResponse.json({ id: result.insertId }, { status: 201 })
}
