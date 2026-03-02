import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getSession } from "@/lib/session"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session.userId || session.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { status } = await req.json()

  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  await query(
    "UPDATE absences SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?",
    [status, session.userId, id]
  )

  // Notify student
  await query(
    `INSERT INTO notifications (user_id, title, message)
     SELECT a.student_id,
            CONCAT('Absence ', ?),
            CONCAT('Your absence report has been ', ?, ' by ', ?)
     FROM absences a WHERE a.id = ?`,
    [status, status, session.name, id]
  )

  return NextResponse.json({ ok: true })
}
