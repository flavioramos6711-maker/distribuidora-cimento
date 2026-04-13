import { NextResponse } from "next/server"
import { clearAdminAccessCookie } from "@/lib/admin/session"

export const runtime = "nodejs"

const LEGACY_COOKIE = "admin_session"

export async function POST() {
  const response = NextResponse.json({ success: true })
  clearAdminAccessCookie(response)
  response.cookies.set(LEGACY_COOKIE, "", { maxAge: 0, path: "/" })
  return response
}
