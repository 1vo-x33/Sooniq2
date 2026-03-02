import { NextResponse } from "next/server"
import { query } from "@/lib/db"

interface ClassRow {
  id: number
  name: string
  year: number
}

export async function GET() {
  const rows = await query<ClassRow[]>("SELECT id, name, year FROM classes ORDER BY year, name")
  return NextResponse.json(rows)
}
