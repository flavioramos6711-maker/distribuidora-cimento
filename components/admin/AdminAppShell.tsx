"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Layers,
  ShoppingCart,
  Star,
  Image as ImageIcon,
  LogOut,
  Menu,
  X,
  ChevronRight,
  MessageCircle,
  BarChart3,
  ExternalLink,
  PieChart,
  User,
  Settings,
  Globe,
} from "lucide-react"

const menuItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Pedidos", href: "/admin/pedidos", icon: ShoppingCart },
  { label: "WhatsApp", href: "/admin/whatsapp", icon: MessageCircle },
  { label: "Analytics WA", href: "/admin/analytics-whatsapp", icon: PieChart },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Google", href: "/admin/google", icon: Globe },
  { label: "Categorias", href: "/admin/categorias", icon: FolderTree },
  { label: "Subcategorias", href: "/admin/subcategorias", icon: Layers },
  { label: "Produtos", href: "/admin/produtos", icon: Package },
  { label: "Avaliacoes", href: "/admin/avaliacoes", icon: Star },
  { label: "Banners", href: "/admin/banners", icon: ImageIcon },
  { label: "CMS / Aparência", href: "/admin/settings", icon: Settings },
] as const

type Props = {
  children: React.ReactNode
  adminEmail: string
  adminName: string | null
}

export default function AdminAppShell({ children, adminEmail, adminName }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    window.location.href = "/admin/login"
  }

  return (
    <div className="admin-shell min-h-screen flex text-white relative overflow-x-hidden bg-[#020b1d]">
      {/* Background Irmãos Metrala oficial com 40% de opacidade real */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40 bg-center bg-no-repeat bg-contain"
        style={{
          backgroundImage: "url('/irmaos-metrala.png')",
          backgroundAttachment: "fixed",
        }}
      />

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#010c24]/95 backdrop-blur-xl border-r border-[#0055ff]/30 text-white transform transition-transform lg:translate-x-0 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#0055ff]/25">
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">Painel</h2>
            <p className="text-xs text-blue-200/70 truncate max-w-[11rem]" title={adminEmail}>
              {adminName ? `Olá, ${adminName.split(" ")[0]}` : adminEmail}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/60 hover:text-white"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 flex flex-col gap-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-[#0055ff] to-[#0047ab] text-white shadow-[0_0_16px_rgba(0,85,255,0.45)] border border-[#0055ff]/60 font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-[#0055ff]/15 hover:border-[#0055ff]/30 border border-transparent"
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-[#0055ff]/25 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-blue-200/80 hover:text-white hover:bg-[#0055ff]/15 border border-[#0055ff]/20 transition-all w-full"
          >
            <ExternalLink className="w-5 h-5" />
            Ver loja
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:text-white hover:bg-red-500/20 border border-red-500/20 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative z-10">
        <header className="bg-[#020d26]/85 backdrop-blur-md border-b border-[#0055ff]/30 px-4 py-3 flex flex-wrap items-center gap-3 lg:px-6 relative z-10">
          <button type="button" onClick={() => setSidebarOpen(true)} className="lg:hidden text-white" aria-label="Abrir menu">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {(() => {
              const item = menuItems.find((m) => pathname === m.href || (m.href !== "/admin" && pathname.startsWith(m.href)))
              const Icon = item?.icon || LayoutDashboard
              return <Icon className="w-5 h-5 text-[#0055ff] shrink-0" />
            })()}
            <h1 className="text-lg font-bold text-white truncate">
              {menuItems.find((m) => pathname === m.href || (m.href !== "/admin" && pathname.startsWith(m.href)))?.label ||
                "Dashboard"}
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs bg-[#0055ff]/15 border border-[#0055ff]/30 px-3 py-1.5 rounded-full text-blue-200 max-w-[220px] truncate">
            <User className="w-3.5 h-3.5 shrink-0 text-[#0055ff]" />
            <span className="truncate">{adminName || adminEmail}</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto relative z-10">{children}</main>
      </div>
    </div>
  )
}
