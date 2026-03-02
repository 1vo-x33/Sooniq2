import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { query, isDemo, checkDemoPassword } from "@/lib/db"
import { getSession } from "@/lib/session"

interface UserRow {
  id: number
  name: string
  email: string
  password_hash: string
  role: "student" | "teacher"
  class_id: number | null
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
  }

  const rows = await query<UserRow[]>(
    "SELECT id, name, email, password_hash, role, class_id FROM users WHERE email = ? LIMIT 1",
    [email]
  )

  if (!rows.length) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }

  const user = rows[0]
  const valid = isDemo()
    ? checkDemoPassword(user.password_hash, password)
    : await bcrypt.compare(password, user.password_hash)

  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }

  const session = await getSession()
  session.userId = user.id
  session.role = user.role
  session.name = user.name
  session.email = user.email
  session.classId = user.class_id ?? undefined
  await session.save()

  return NextResponse.json({ role: user.role, name: user.name })
}
