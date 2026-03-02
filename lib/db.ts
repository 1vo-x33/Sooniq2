import mysql from "mysql2/promise"

let pool: mysql.Pool | null = null

export function isDemo(): boolean {
  return !process.env.MYSQL_URL
}

export function getPool(): mysql.Pool {
  if (!pool) {
    const url = process.env.MYSQL_URL
    if (!url) {
      throw new Error("MYSQL_URL environment variable is not set")
    }
    pool = mysql.createPool(url)
  }
  return pool
}

export async function query<T = unknown>(sql: string, params?: unknown[]): Promise<T> {
  if (isDemo()) {
    return demoQuery<T>(sql, params)
  }
  const p = getPool()
  const [rows] = await p.execute(sql, params)
  return rows as T
}

// ---------------------------------------------------------------------------
// Demo in-memory data — used when MYSQL_URL is not set
// ---------------------------------------------------------------------------

const DEMO_CLASSES = [
  { id: 1, name: "SD2A", year: 2, programme: "Software Development" },
  { id: 2, name: "SD2B", year: 2, programme: "Software Development" },
]

const DEMO_SUBJECTS = [
  { id: 1, name: "Mathematics", code: "MATH101", teacher_id: 2 },
  { id: 2, name: "Web Development", code: "WEB201", teacher_id: 2 },
  { id: 3, name: "Database Design", code: "DB301", teacher_id: 2 },
  { id: 4, name: "English", code: "ENG101", teacher_id: 2 },
  { id: 5, name: "Project Management", code: "PM201", teacher_id: 2 },
]

// Demo users — password_hash stores plaintext for demo mode (bcrypt skipped)
const DEMO_USERS = [
  {
    id: 1,
    name: "Malek",
    email: "malek@mborijnland.nl",
    password_hash: "DEMO:spitfire",
    role: "student" as const,
    class_id: 1,
    class_name: "SD2A",
    phone: null,
    student_number: "STU2024001",
    created_at: "2024-09-01",
  },
  {
    id: 2,
    name: "Mr. de Vries",
    email: "devries@mborijnland.nl",
    password_hash: "DEMO:spitfire",
    role: "teacher" as const,
    class_id: null,
    class_name: null,
    phone: null,
    student_number: null,
    created_at: "2024-09-01",
  },
]

/** In demo mode, passwords are stored as "DEMO:<plaintext>" — no bcrypt needed. */
export function checkDemoPassword(hash: string, plain: string): boolean {
  if (hash.startsWith("DEMO:")) return hash.slice(5) === plain
  return false
}

const DEMO_ABSENCES = [
  {
    id: 1, student_id: 1, student_name: "Malek", subject_id: 2, subject_name: "Web Development",
    date: "2025-02-20", type: "sick" as const, status: "approved" as const,
    reason: "Flu symptoms", reviewed_by: 2, reviewer_name: "Mr. de Vries", created_at: "2025-02-20",
  },
  {
    id: 2, student_id: 1, student_name: "Malek", subject_id: 1, subject_name: "Mathematics",
    date: "2025-02-26", type: "late" as const, status: "approved" as const,
    reason: "Train delay", reviewed_by: 2, reviewer_name: "Mr. de Vries", created_at: "2025-02-26",
  },
  {
    id: 3, student_id: 1, student_name: "Malek", subject_id: 3, subject_name: "Database Design",
    date: "2025-03-01", type: "sick" as const, status: "pending" as const,
    reason: "Headache", reviewed_by: null, reviewer_name: null, created_at: "2025-03-01",
  },
]

let demoAbsences = [...DEMO_ABSENCES]
let nextAbsenceId = 4

const DEMO_SCHEDULE = [
  { id: 1, subject_id: 1, subject_name: "Mathematics", class_id: 1, class_name: "SD2A", room: "A101", day_of_week: 1, start_time: "09:00:00", end_time: "10:30:00", teacher_id: 2 },
  { id: 2, subject_id: 2, subject_name: "Web Development", class_id: 1, class_name: "SD2A", room: "C203", day_of_week: 1, start_time: "11:00:00", end_time: "12:30:00", teacher_id: 2 },
  { id: 3, subject_id: 4, subject_name: "English", class_id: 1, class_name: "SD2A", room: "B105", day_of_week: 2, start_time: "09:00:00", end_time: "10:30:00", teacher_id: 2 },
  { id: 4, subject_id: 3, subject_name: "Database Design", class_id: 1, class_name: "SD2A", room: "C201", day_of_week: 2, start_time: "11:00:00", end_time: "12:30:00", teacher_id: 2 },
  { id: 5, subject_id: 5, subject_name: "Project Management", class_id: 1, class_name: "SD2A", room: "A203", day_of_week: 3, start_time: "13:00:00", end_time: "14:30:00", teacher_id: 2 },
  { id: 6, subject_id: 1, subject_name: "Mathematics", class_id: 1, class_name: "SD2A", room: "A101", day_of_week: 4, start_time: "09:00:00", end_time: "10:30:00", teacher_id: 2 },
  { id: 7, subject_id: 2, subject_name: "Web Development", class_id: 1, class_name: "SD2A", room: "C203", day_of_week: 4, start_time: "11:00:00", end_time: "12:30:00", teacher_id: 2 },
  { id: 8, subject_id: 4, subject_name: "English", class_id: 1, class_name: "SD2A", room: "B105", day_of_week: 5, start_time: "09:00:00", end_time: "10:30:00", teacher_id: 2 },
]

const DEMO_NOTIFICATIONS = [
  { id: 1, user_id: 1, title: "Absence Approved", message: "Your sick day on Feb 20 was approved by Mr. de Vries.", is_read: 0, created_at: "2025-02-21" },
  { id: 2, user_id: 1, title: "Late Arrival Approved", message: "Your late arrival on Feb 26 was approved.", is_read: 0, created_at: "2025-02-27" },
]

let demoNotifications = [...DEMO_NOTIFICATIONS]

function normalize(sql: string) {
  return sql.replace(/\s+/g, " ").trim().toLowerCase()
}

function matchesParam(val: unknown, param: unknown): boolean {
  return String(val) === String(param)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function demoQuery<T>(sql: string, params?: unknown[]): T {
  const s = normalize(sql)

  // AUTH: get user by email
  if (s.includes("from users where email")) {
    const email = params?.[0]
    const found = DEMO_USERS.filter((u) => matchesParam(u.email, email))
    return found as unknown as T
  }

  // AUTH: get user by id
  if (s.includes("from users where id")) {
    const id = params?.[0]
    const found = DEMO_USERS.filter((u) => matchesParam(u.id, id))
    return found as unknown as T
  }

  // CLASSES list
  if (s.includes("from classes")) {
    return DEMO_CLASSES as unknown as T
  }

  // SUBJECTS list
  if (s.includes("from subjects") && !s.includes("schedule")) {
    return DEMO_SUBJECTS as unknown as T
  }

  // SCHEDULE for a class
  if (s.includes("schedule_entries") || s.includes("from schedule")) {
    const classId = params?.[0]
    if (classId) {
      return DEMO_SCHEDULE.filter((e) => matchesParam(e.class_id, classId)) as unknown as T
    }
    return DEMO_SCHEDULE as unknown as T
  }

  // STATS for student
  if (s.includes("count") && s.includes("absences") && params?.length) {
    const id = params?.[0]
    const mine = demoAbsences.filter((a) => matchesParam(a.student_id, id))
    const result = {
      total: mine.length,
      sick: mine.filter((a) => a.type === "sick").length,
      late: mine.filter((a) => a.type === "late").length,
      other: mine.filter((a) => a.type === "other").length,
      pending: mine.filter((a) => a.status === "pending").length,
      approved: mine.filter((a) => a.status === "approved").length,
      students: DEMO_USERS.filter((u) => u.role === "student").length,
      rejected: mine.filter((a) => a.status === "rejected").length,
    }
    return [result] as unknown as T
  }

  // ABSENCES list — with optional status filter
  if (s.includes("from absences")) {
    let result = [...demoAbsences]
    if (params?.length) {
      for (const p of params) {
        if (p === "pending" || p === "approved" || p === "rejected") {
          result = result.filter((a) => a.status === p)
        } else {
          result = result.filter((a) => matchesParam(a.student_id, p))
        }
      }
    }
    return result as unknown as T
  }

  // INSERT absence
  if (s.startsWith("insert into absences")) {
    const [studentId, subjectId, date, type, reason] = params ?? []
    const subject = DEMO_SUBJECTS.find((s) => matchesParam(s.id, subjectId))
    const student = DEMO_USERS.find((u) => matchesParam(u.id, studentId))
    const newA = {
      id: nextAbsenceId++,
      student_id: Number(studentId),
      student_name: student?.name ?? "",
      subject_id: Number(subjectId),
      subject_name: subject?.name ?? null,
      date: String(date),
      type: type as "sick" | "late" | "other",
      status: "pending" as const,
      reason: reason ? String(reason) : null,
      reviewed_by: null,
      reviewer_name: null,
      created_at: new Date().toISOString().slice(0, 10),
    }
    demoAbsences.push(newA)
    return { insertId: newA.id } as unknown as T
  }

  // UPDATE absence status
  if (s.startsWith("update absences set status")) {
    const [status, reviewedBy, id] = params ?? []
    demoAbsences = demoAbsences.map((a) =>
      matchesParam(a.id, id) ? { ...a, status: status as "approved" | "rejected", reviewed_by: Number(reviewedBy) } : a
    )
    return { affectedRows: 1 } as unknown as T
  }

  // NOTIFICATIONS get
  if (s.includes("from notifications") && !s.includes("update")) {
    const userId = params?.[0]
    return demoNotifications.filter((n) => matchesParam(n.user_id, userId)) as unknown as T
  }

  // NOTIFICATIONS mark read
  if (s.startsWith("update notifications")) {
    const userId = params?.[0]
    demoNotifications = demoNotifications.map((n) =>
      matchesParam(n.user_id, userId) ? { ...n, is_read: 1 } : n
    )
    return { affectedRows: demoNotifications.length } as unknown as T
  }

  // STUDENTS list for teacher
  if (s.includes("from users") && s.includes("role = ?")) {
    return DEMO_USERS.filter((u) => u.role === "student") as unknown as T
  }

  // INSERT notification
  if (s.startsWith("insert into notifications")) {
    return { insertId: Date.now() } as unknown as T
  }

  // UPDATE password
  if (s.startsWith("update users set password")) {
    return { affectedRows: 1 } as unknown as T
  }

  // Fallback
  return [] as unknown as T
}
