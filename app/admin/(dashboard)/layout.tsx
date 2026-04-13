import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/auth/admin"
import AdminAppShell from "@/components/admin/AdminAppShell"

export const dynamic = "force-dynamic"

/**
 * Painel admin: sessão Supabase Auth + linha em public.admins.
 * UI (AdminAppShell) inalterada — apenas origem dos dados de usuário.
 */
export default async function AdminDashboardRootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  const ok = await isAdmin(supabase, user.id)
  if (!ok) {
    redirect("/admin/login?error=acesso_negado")
  }

  const meta = user.user_metadata as { full_name?: string; name?: string } | undefined
  const name = meta?.full_name ?? meta?.name ?? null
  const email = user.email ?? ""

  return (
    <AdminAppShell adminEmail={email} adminName={name}>
      {children}
    </AdminAppShell>
  )
}
