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
} from "lucide-react"

const menuItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Pedidos", href: "/admin/pedidos", icon: ShoppingCart },
  { label: "WhatsApp", href: "/admin/whatsapp", icon: MessageCircle },
  { label: "Analytics WA", href: "/admin/analytics-whatsapp", icon: PieChart },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Categorias", href: "/admin/categorias", icon: FolderTree },
  { label: "Subcategorias", href: "/admin/subcategorias", icon: Layers },
  { label: "Produtos", href: "/admin/produtos", icon: Package },
  { label: "Avaliacoes", href: "/admin/avaliacoes", icon: Star },
  { label: "Banners", href: "/admin/banners", icon: ImageIcon },
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
    <div className="min-h-screen flex bg-muted">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform lg:translate-x-0 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-sidebar-border">
          <div>
            <h2 className="text-lg font-bold text-sidebar-foreground">Painel</h2>
            <p className="text-xs text-sidebar-foreground/60 truncate max-w-[11rem]" title={adminEmail}>
              {adminName || adminEmail}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
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
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all w-full"
          >
            <ExternalLink className="w-5 h-5" />
            Ver loja
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-red-500/20 hover:text-red-400 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="bg-card border-b border-border px-4 py-3 flex flex-wrap items-center gap-3 lg:px-6">
          <button type="button" onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground" aria-label="Abrir menu">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {(() => {
              const item = menuItems.find((m) => pathname === m.href || (m.href !== "/admin" && pathname.startsWith(m.href)))
              const Icon = item?.icon || LayoutDashboard
              return <Icon className="w-5 h-5 text-primary shrink-0" />
            })()}
            <h1 className="text-lg font-bold text-foreground truncate">
              {menuItems.find((m) => pathname === m.href || (m.href !== "/admin" && pathname.startsWith(m.href)))?.label ||
                "Dashboard"}
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground max-w-[220px] truncate">
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{adminEmail}</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
