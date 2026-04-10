"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { BarChart3, ShoppingCart, Users, Package, DollarSign, Eye, MessageCircle, TrendingUp } from "lucide-react"

const supabase = createClient()

const fetchStats = async () => {
  const [orders, profiles, products, reviews, clicks] = await Promise.all([
    supabase.from("orders").select("id, total, status, created_at"),
    supabase.from("profiles").select("id, created_at"),
    supabase.from("products").select("id, active"),
    supabase.from("reviews").select("id, approved"),
    supabase.from("whatsapp_clicks").select("id, source, created_at"),
  ])

  const totalOrders = orders.data?.length || 0
  const totalRevenue = orders.data?.reduce((sum, o) => sum + Number(o.total || 0), 0) || 0
  const totalCustomers = profiles.data?.length || 0
  const totalProducts = products.data?.filter((p) => p.active)?.length || 0
  const totalReviews = reviews.data?.length || 0
  const approvedReviews = reviews.data?.filter((r) => r.approved)?.length || 0
  const totalClicks = clicks.data?.length || 0
  const pendingOrders = orders.data?.filter((o) => o.status === "pending")?.length || 0

  // Orders by status
  const ordersByStatus = {
    pending: orders.data?.filter((o) => o.status === "pending")?.length || 0,
    processing: orders.data?.filter((o) => o.status === "processing")?.length || 0,
    shipped: orders.data?.filter((o) => o.status === "shipped")?.length || 0,
    delivered: orders.data?.filter((o) => o.status === "delivered")?.length || 0,
    cancelled: orders.data?.filter((o) => o.status === "cancelled")?.length || 0,
  }

  // Recent 7 days orders
  const last7 = new Date()
  last7.setDate(last7.getDate() - 7)
  const recent = orders.data?.filter((o) => new Date(o.created_at) >= last7)?.length || 0

  return { totalOrders, totalRevenue, totalCustomers, totalProducts, totalReviews, approvedReviews, totalClicks, pendingOrders, ordersByStatus, recent }
}

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useSWR("admin-analytics", fetchStats)

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>

  const cards = [
    { label: "Receita Total", value: `R$ ${(stats?.totalRevenue || 0).toFixed(2)}`, icon: DollarSign, color: "bg-green-100 text-green-600" },
    { label: "Total Pedidos", value: String(stats?.totalOrders || 0), icon: ShoppingCart, color: "bg-blue-100 text-blue-600" },
    { label: "Clientes", value: String(stats?.totalCustomers || 0), icon: Users, color: "bg-purple-100 text-purple-600" },
    { label: "Produtos Ativos", value: String(stats?.totalProducts || 0), icon: Package, color: "bg-orange-100 text-orange-600" },
    { label: "Avaliacoes", value: `${stats?.approvedReviews || 0}/${stats?.totalReviews || 0}`, icon: Eye, color: "bg-yellow-100 text-yellow-600" },
    { label: "Cliques WhatsApp", value: String(stats?.totalClicks || 0), icon: MessageCircle, color: "bg-emerald-100 text-emerald-600" },
    { label: "Pedidos Pendentes", value: String(stats?.pendingOrders || 0), icon: TrendingUp, color: "bg-red-100 text-red-600" },
    { label: "Pedidos (7 dias)", value: String(stats?.recent || 0), icon: BarChart3, color: "bg-indigo-100 text-indigo-600" },
  ]

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Visao geral da loja com metricas em tempo real.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <span className="text-sm text-muted-foreground">{card.label}</span>
            </div>
            <p className="text-2xl font-bold text-card-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-bold text-card-foreground mb-4">Pedidos por Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: "Pendentes", value: stats?.ordersByStatus?.pending || 0, color: "text-yellow-600 bg-yellow-100" },
            { label: "Processando", value: stats?.ordersByStatus?.processing || 0, color: "text-blue-600 bg-blue-100" },
            { label: "Enviados", value: stats?.ordersByStatus?.shipped || 0, color: "text-purple-600 bg-purple-100" },
            { label: "Entregues", value: stats?.ordersByStatus?.delivered || 0, color: "text-green-600 bg-green-100" },
            { label: "Cancelados", value: stats?.ordersByStatus?.cancelled || 0, color: "text-red-600 bg-red-100" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center text-lg font-bold ${s.color}`}>
                {s.value}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
