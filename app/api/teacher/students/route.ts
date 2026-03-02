import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getSession } from "@/lib/session"

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

export async function GET() {
  const session = await getSession()
  if (!session.userId || session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rows = await query<StudentStat[]>(
    `SELECT u.id, u.name, u.email, c.name AS class_name,
       COUNT(a.id) AS total,
       SUM(a.type = 'sick') AS sick,
       SUM(a.type = 'late') AS late,
       SUM(a.status = 'pending') AS pending
     FROM users u
     LEFT JOIN classes c ON u.class_id = c.id
     LEFT JOIN absences a ON a.student_id = u.id
     WHERE u.role = 'student'
     GROUP BY u.id, u.name, u.email, c.name
     ORDER BY u.name`
  )

  return NextResponse.json(rows)
}
