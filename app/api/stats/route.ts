import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getSession } from "@/lib/session"

export async function GET() {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.role === "student") {
    const [totals] = await query<{ total: number; sick: number; late: number; other: number; pending: number; approved: number }[]>(
      `SELECT
        COUNT(*) AS total,
        SUM(type = 'sick') AS sick,
        SUM(type = 'late') AS late,
        SUM(type = 'other') AS other,
        SUM(status = 'pending') AS pending,
        SUM(status = 'approved') AS approved
       FROM absences WHERE student_id = ?`,
      [session.userId]
    )
    return NextResponse.json(totals)
  }

  // Teacher stats
  const [totals] = await query<{ total: number; pending: number; approved: number; rejected: number; students: number }[]>(
    `SELECT
      COUNT(*) AS total,
      SUM(status = 'pending') AS pending,
      SUM(status = 'approved') AS approved,
      SUM(status = 'rejected') AS rejected,
      COUNT(DISTINCT student_id) AS students
     FROM absences`
  )
  return NextResponse.json(totals)
}
