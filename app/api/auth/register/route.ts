import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { query } from "@/lib/db"
import { getSession } from "@/lib/session"

export async function POST(req: NextRequest) {
  const { name, email, password, role, classId } = await req.json()

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 })
  }

  if (!["student", "teacher"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  const existing = await query<{ id: number }[]>(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [email]
  )

  if (existing.length) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 })
  }

  const hash = await bcrypt.hash(password, 12)

  const result = await query<{ insertId: number }>(
    "INSERT INTO users (name, email, password_hash, role, class_id) VALUES (?, ?, ?, ?, ?)",
    [name, email, hash, role, role === "student" ? (classId ?? null) : null]
  )

  const userId = result.insertId

  const session = await getSession()
  session.userId = userId
  session.role = role
  session.name = name
  session.email = email
  session.classId = classId ?? undefined
  await session.save()

  return NextResponse.json({ role, name }, { status: 201 })
}
