import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"

export async function GET() {
  const session = await getSession()
  if (!session.userId) {
    return NextResponse.json(null, { status: 401 })
  }
  return NextResponse.json({
    userId: session.userId,
    role: session.role,
    name: session.name,
    email: session.email,
    classId: session.classId,
  })
}
