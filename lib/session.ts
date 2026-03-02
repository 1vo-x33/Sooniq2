import { getIronSession, IronSession } from "iron-session"
import { cookies } from "next/headers"

export interface SessionData {
  userId?: number
  role?: "student" | "teacher"
  name?: string
  email?: string
  classId?: number
}

const sessionOptions = {
  password: process.env.SESSION_SECRET ?? "sooniq-fallback-secret-change-this-in-production-32",
  cookieName: "sooniq_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}
