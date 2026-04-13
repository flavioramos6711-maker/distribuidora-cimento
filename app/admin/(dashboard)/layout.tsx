import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ADMIN_ACCESS_COOKIE } from "@/lib/admin/constants"
import { verifyAdminAccessToken } from "@/lib/admin/session-token"
import AdminAppShell from "@/components/admin/AdminAppShell"

export const dynamic = "force-dynamic"

/**
 * Painel admin v2: sessão validada no SERVIDOR (cookie httpOnly assinado).
 * Não depende de fetch /api/admin/verify no cliente — elimina falhas de timing e credenciais.
 */
export default async function AdminDashboardRootLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies()
  const session = verifyAdminAccessToken(jar.get(ADMIN_ACCESS_COOKIE)?.value)
  if (!session) {
    redirect("/admin/login")
  }

  return (
    <AdminAppShell adminEmail={session.email} adminName={session.name}>
      {children}
    </AdminAppShell>
  )
}
