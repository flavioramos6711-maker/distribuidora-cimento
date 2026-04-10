/** Pedidos salvos localmente (finalização via WhatsApp) até integração com backend */

export type OrderStatus = "received" | "picking" | "shipped" | "delivered"

export type LocalOrder = {
  id: string
  code: string
  email?: string
  status: OrderStatus
  createdAt: string
  total: number
  itemsSummary: string
}

const KEY = "ccc_distribuidora_orders"

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function generateOrderCode() {
  const n = Math.floor(10000 + Math.random() * 90000)
  return `CCC-${n}`
}

export function getLocalOrders(): LocalOrder[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as LocalOrder[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveLocalOrder(order: Omit<LocalOrder, "id" | "createdAt"> & { id?: string; createdAt?: string }) {
  const list = getLocalOrders()
  const next: LocalOrder = {
    id: order.id || uid(),
    code: order.code,
    email: order.email,
    status: order.status,
    createdAt: order.createdAt || new Date().toISOString(),
    total: order.total,
    itemsSummary: order.itemsSummary,
  }
  list.unshift(next)
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)))
  return next
}

export function findOrderByCode(code: string): LocalOrder | undefined {
  const c = code.trim().toUpperCase()
  return getLocalOrders().find((o) => o.code.toUpperCase() === c)
}

export function findOrdersByEmail(email: string): LocalOrder[] {
  const e = email.trim().toLowerCase()
  if (!e) return []
  return getLocalOrders().filter((o) => o.email?.toLowerCase() === e)
}
