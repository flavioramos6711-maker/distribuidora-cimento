import type { NextRequest } from "next/server"
import type { NextResponse } from "next/server"
import { ADMIN_ACCESS_COOKIE, ADMIN_SESSION_MAX_AGE_SEC } from "./constants"
import { signAdminAccessToken, verifyAdminAccessToken, type AdminAccessPayload } from "./session-token"

export function getAdminAccessPayload(request: NextRequest): AdminAccessPayload | null {
  return verifyAdminAccessToken(request.cookies.get(ADMIN_ACCESS_COOKIE)?.value)
}

export function attachAdminAccessCookie(
  response: NextResponse,
  input: { sub: string; email: string; name: string | null }
): void {
  const token = signAdminAccessToken(input)
  response.cookies.set(ADMIN_ACCESS_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SEC,
  })
}

export function clearAdminAccessCookie(response: NextResponse): void {
  response.cookies.set(ADMIN_ACCESS_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}
