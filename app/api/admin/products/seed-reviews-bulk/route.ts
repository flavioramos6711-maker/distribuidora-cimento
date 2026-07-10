import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerSupabase } from "@/lib/supabase/route-handler"
import { isAdmin } from "@/lib/auth/admin"
import { REVIEW_POOL } from "@/lib/review-pool"

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDateInPast(maxDaysAgo: number): string {
  const daysAgo = randomBetween(1, maxDaysAgo)
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(randomBetween(8, 18))
  date.setMinutes(randomBetween(0, 59))
  return date.toISOString()
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function POST(request: NextRequest) {
  const { supabase, jsonWithSession } = createRouteHandlerSupabase(request)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return jsonWithSession({ error: "Faça login no painel." }, { status: 401 })
  }
  if (!(await isAdmin(supabase, user.id))) {
    return jsonWithSession({ error: "Acesso restrito a administradores." }, { status: 403 })
  }

  const { productIds } = await request.json()
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return jsonWithSession({ error: "Forneça um array de productIds válido." }, { status: 400 })
  }

  let totalGenerated = 0

  for (const productId of productIds) {
    // Busca avaliações que o produto JÁ TEM, para não repetir
    const { data: existingReviews } = await supabase
      .from("reviews")
      .select("comment")
      .eq("product_id", productId)

    const existingComments = new Set((existingReviews || []).map((r) => r.comment))

    // Filtra o pool para pegar apenas avaliações que o produto AINDA NÃO TEM
    const availablePool = REVIEW_POOL.filter((r) => !existingComments.has(r.comment))

    if (availablePool.length === 0) {
      continue // Se o produto já tem todas as avaliações possíveis, pula
    }

    // Calcula de 12 a 18 (ou o limite do pool)
    const count = Math.min(randomBetween(12, 18), availablePool.length)

    // Sorteia as selecionadas
    const selected = shuffle(availablePool).slice(0, count)

    // Prepara para inserir
    const rows = selected.map((r) => ({
      product_id: productId,
      customer_name: r.name,
      rating: r.rating,
      comment: r.comment,
      approved: true, // Avaliações automáticas já nascem aprovadas
      created_at: randomDateInPast(180),
    }))

    if (rows.length > 0) {
      const { error } = await supabase.from("reviews").insert(rows)
      if (!error) {
        totalGenerated += rows.length
      }
    }
  }

  return jsonWithSession({ ok: true, generated: totalGenerated })
}
