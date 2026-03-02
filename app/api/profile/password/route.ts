import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { query } from "@/lib/db"
import { getSession } from "@/lib/session"

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { password } = await req.json()
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
  }

  const hash = await bcrypt.hash(password, 12)
  await query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, session.userId])

  return NextResponse.json({ ok: true })
}
