import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/auth/admin"

export const dynamic = "force-dynamic"

/** Logado como admin → já vai para o painel. */
export default async function AdminLoginGateLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user && (await isAdmin(supabase, user.id))) {
    redirect("/admin")
  }

  return <>{children}</>
}
