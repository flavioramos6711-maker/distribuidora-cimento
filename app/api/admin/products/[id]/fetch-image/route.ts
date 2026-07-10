import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerSupabase } from "@/lib/supabase/route-handler"
import { isAdmin } from "@/lib/auth/admin"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

  const { id } = params
  if (!id) {
    return jsonWithSession({ error: "ID do produto inválido." }, { status: 400 })
  }

  // Pegar o nome do produto
  const { data: product } = await supabase.from("products").select("name").eq("id", id).single()
  if (!product) {
    return jsonWithSession({ error: "Produto não encontrado." }, { status: 404 })
  }

  try {
    // Raspar imagem do Google Images (thumbnails)
    const query = encodeURIComponent(product.name + " produto")
    const url = `https://www.google.com/search?q=${query}&tbm=isch`
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })
    
    const html = await res.text()
    
    // Procura pela primeira imagem cacheada pelo Google (thumbnail)
    const match = html.match(/src="(https:\/\/encrypted-tbn0\.gstatic\.com\/images[^"]+)"/)
    
    if (match && match[1]) {
      const imageUrl = match[1]
      
      // Atualizar o banco de dados
      const { error: updateError } = await supabase
        .from("products")
        .update({ image_url: imageUrl })
        .eq("id", id)

      if (updateError) {
        return jsonWithSession({ error: "Erro ao atualizar produto no banco." }, { status: 500 })
      }
      
      return jsonWithSession({ ok: true, imageUrl })
    } else {
      return jsonWithSession({ error: "Nenhuma imagem encontrada pelo scraper." }, { status: 404 })
    }
  } catch (error: any) {
    return jsonWithSession({ error: error.message || "Falha na raspagem" }, { status: 500 })
  }
}
