import { NextRequest, NextResponse } from "next/server"
import { createPublicClient } from "@/lib/supabase/public"

function generateOrderCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = "PED-"
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

type CartItem = {
  id: string
  name: string
  price: number
  unit: string
  qty: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, email } = body as { items: CartItem[]; email?: string }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio." }, { status: 400 })
    }

    // Recalcular total no servidor (nunca confiar no valor do client)
    const total = items.reduce((sum, i) => {
      const price = Number(i.price)
      const qty = Math.max(1, Math.floor(Number(i.qty)))
      if (!isFinite(price) || price <= 0) return sum
      return sum + price * qty
    }, 0)

    if (total <= 0) {
      return NextResponse.json({ error: "Total inválido." }, { status: 400 })
    }

    const itemsSummary = items
      .map((i) => `- ${i.name} (x${i.qty}) — R$ ${(Number(i.price) * i.qty).toFixed(2)}`)
      .join("\n")

    const code = generateOrderCode()
    const supabase = createPublicClient()
    const { error } = await supabase.from("orders").insert({
      code,
      email: email?.trim() || null,
      status: "received",
      total,
      items,
      items_summary: itemsSummary,
    })

    if (error) {
      console.error("orders insert error:", error)
      return NextResponse.json({ error: "Falha ao salvar pedido." }, { status: 500 })
    }

    return NextResponse.json({ ok: true, code, total })
  } catch (err) {
    console.error("orders route error:", err)
    return NextResponse.json({ error: "Erro interno." }, { status: 500 })
  }
}
