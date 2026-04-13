import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ADMIN_ACCESS_COOKIE } from "@/lib/admin/constants"
import { verifyAdminAccessToken } from "@/lib/admin/session-token"

export const dynamic = "force-dynamic"

/** Já autenticado: vai direto ao painel. */
export default async function AdminLoginGateLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies()
  const session = verifyAdminAccessToken(jar.get(ADMIN_ACCESS_COOKIE)?.value)
  if (session) {
    redirect("/admin")
  }
  return <>{children}</>
}
