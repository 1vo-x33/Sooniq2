import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getSession } from "@/lib/session"

interface NotificationRow {
  id: number
  title: string
  message: string
  is_read: number
  created_at: string
}

export async function GET() {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rows = await query<NotificationRow[]>(
    `SELECT id, title, message, is_read, created_at
     FROM notifications
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 50`,
    [session.userId]
  )

  return NextResponse.json(rows)
}

export async function PATCH() {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [session.userId])
  return NextResponse.json({ ok: true })
}
