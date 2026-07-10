import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerSupabase } from "@/lib/supabase/route-handler"
import { isAdmin } from "@/lib/auth/admin"

// ─── Pool de avaliações ultra-realistas brasileiras ────────────────────────────
// Humanizadas, variadas, com contexto de construção civil e atacado.
// Não use textos genéricos — cada um conta uma história real.
const REVIEW_POOL = [
  {
    name: "Carlos Eduardo Mendonça",
    role: "Mestre de Obras",
    rating: 5,
    comment: "Comprei 40 sacos pra reboco de um sobrado aqui em Ribeirão e o produto chegou no prazo certinho. Qualidade excelente, trabalhei com isso há muitos anos e esse lote veio sem nenhum grão empedrado. Recomendo demais.",
  },
  {
    name: "Fernanda Oliveira Santos",
    role: "Engenheira Civil",
    rating: 5,
    comment: "Usamos na execução de uma laje de 280m². Produto de primeira, sem variação no traço. A distribuidora tem agilidade na entrega e os motoristas são atenciosos. Com certeza vou fechar contrato para as próximas obras.",
  },
  {
    name: "Roberto Alves",
    role: "Construtor Autônomo",
    rating: 5,
    comment: "Melhor preço que encontrei na região. Já comprei em outras distribuidoras e o atendimento aqui é muito superior. O pedido foi confirmado rápido e a entrega ocorreu no dia combinado. Produto top!",
  },
  {
    name: "Marcelo T.",
    role: "Pedreiro",
    rating: 4,
    comment: "Produto bom, vim por indicação de um amigo que usa aqui faz tempo. O único detalhe foi uma pequena demora no atendimento inicial, mas depois de confirmar o pedido foi tudo tranquilo. Qualidade do material é ótima.",
  },
  {
    name: "Adriana Costa Ferreira",
    role: "Arquiteta",
    rating: 5,
    comment: "Indiquei para dois clientes que estão em fase de estrutura. Ambos elogiaram muito a qualidade e o preço. A distribuidora foi transparente com os prazos e entregou antes do previsto. Parceria certa.",
  },
  {
    name: "João Paulo Ramos",
    role: "Empreiteiro",
    rating: 5,
    comment: "Já fiz três compras aqui esse ano. Produto consistente em todos os lotes. Para quem trabalha com grandes volumes como eu, é fundamental ter confiança na qualidade — e aqui não decepciona. Nota máxima.",
  },
  {
    name: "Luís Henrique Barros",
    role: "Engenheiro Civil",
    rating: 5,
    comment: "Utilizei em fundação de residência unifamiliar com 6 pilares. Resistência dentro do esperado para CP-II-Z-32. Equipe de vendas me orientou bem sobre o volume necessário. Excelente suporte técnico.",
  },
  {
    name: "Patrícia Moura",
    role: "Compradora",
    rating: 5,
    comment: "Comprei para reforma do meu quintal — calçada e churrasqueira. Meu pedreiro disse que o material era de qualidade superior ao que costuma trabalhar. Fiquei muito satisfeita com o resultado final. Voltarei a comprar.",
  },
  {
    name: "Sérgio Nascimento",
    role: "Construtora Regional",
    rating: 5,
    comment: "Atendemos 3 obras simultâneas e essa distribuidora foi a única que conseguiu garantir entrega semanal sem atrasos. O preço de atacado é diferenciado. Estamos renovando contrato para o próximo semestre.",
  },
  {
    name: "Diego Fontana",
    role: "Pedreiro Autônomo",
    rating: 4,
    comment: "Produto bom, igual ao que compro na cidade grande mas mais barato aqui. A logística funcionou bem. Pedi na quinta e chegou na sexta pela manhã. Só faltou um saco, mas resolveram rapidinho com um crédito.",
  },
  {
    name: "Ana Beatriz Lemos",
    role: "Engenheira Civil",
    rating: 5,
    comment: "Produto excelente para estruturas em contato com solo úmido. Especificamos na obra de um galpão industrial e a resistência ficou acima do esperado nos rompimentos aos 28 dias. Distribuidora confiável.",
  },
  {
    name: "Tiago Ferreira",
    role: "Mestre de Obras",
    rating: 5,
    comment: "Trabalho com construção há 22 anos e esse material é dos melhores que já usei. Sacos bem fechados, sem umidade, prazo de validade folgado. Atendimento pelo WhatsApp foi rápido e direto ao ponto.",
  },
  {
    name: "Bruna Carvalho",
    role: "Compradora Residencial",
    rating: 5,
    comment: "Precisava de poucos sacos para reparos em casa e mesmo assim me atenderam super bem, sem me fazer sentir que o pedido era pequeno demais. Entrega no mesmo dia! Muito satisfeita.",
  },
  {
    name: "Rafael Duarte",
    role: "Empreiteiro",
    rating: 5,
    comment: "Melhor custo-benefício da região sem sombra de dúvida. Já fiz cotação em 4 distribuidoras diferentes e aqui ganharam em preço e atendimento. Já deixei vários colegas de obra sabendo.",
  },
  {
    name: "Elias Gomes",
    role: "Pedreiro",
    rating: 3,
    comment: "Produto ok, mas achei a embalagem um pouco fraca — dois sacos vieram com rasgos nas pontas. A distribuidora deu crédito sem questionar, então fez bem. O material em si é bom, sem reclamação.",
  },
  {
    name: "Vagner Lima",
    role: "Construtor",
    rating: 5,
    comment: "Trabalhei em construtora grande por 10 anos e conheço produto bom. Esse aqui é produto bom. Chegou dentro do prazo, paletes bem organizados. Recomendo para qualquer tipo de obra.",
  },
  {
    name: "Cláudia Menezes",
    role: "Proprietária de Imóvel",
    rating: 5,
    comment: "Reformei minha casa inteira e usei bastante material dessa distribuidora. Meu engenheiro aprovou tudo. O que mais gostei foi o suporte pós-venda — qualquer dúvida que tinha, respondiam rápido pelo WhatsApp.",
  },
  {
    name: "Alexandre Teixeira",
    role: "Arquiteto",
    rating: 4,
    comment: "Ótima distribuidora. Uso para projetos de clientes na faixa de médio e alto padrão. O produto chega uniforme, o que facilita muito o controle de qualidade na obra. Só acho que poderiam ter mais opções de parcelamento.",
  },
  {
    name: "Paulo Roberto S.",
    role: "Mestre de Obras",
    rating: 5,
    comment: "Já é a quinta compra que faço aqui. O produto é consistente em todos os lotes — isso é o mais importante pra quem trabalha com traço fixo. Entrega sempre no prazo. Parabéns à equipe.",
  },
  {
    name: "Giovanna Araújo",
    role: "Engenheira Civil",
    rating: 5,
    comment: "Utilizei em obra de alvenaria estrutural. Produto com resistência acima do mínimo normativo. A equipe de vendas entendeu a especificação técnica sem problemas. Distribuidora séria e profissional.",
  },
  {
    name: "Fábio Santos",
    role: "Pedreiro Autônomo",
    rating: 5,
    comment: "Meu cliente me pediu pra economizar sem perder qualidade e aqui consegui os dois. Produto de primeira linha, preço de atacado sem burocracia. Vou indicar para todos os meus parceiros de obra.",
  },
  {
    name: "Weslei Rodrigues",
    role: "Empreiteiro",
    rating: 5,
    comment: "Fiz pedido às 8h e às 14h já estava sendo entregue. Isso é serviço! Sem contar que o produto é exatamente o que foi descrito. Zero surpresa negativa. Já somos parceiros fixos daqui.",
  },
  {
    name: "Mônica Albuquerque",
    role: "Construtora",
    rating: 5,
    comment: "Nossa empresa usa esse produto há mais de 2 anos. A qualidade se manteve constante em todos os lotes. Preço competitivo para grandes volumes. A distribuidora é referência na nossa região.",
  },
  {
    name: "Henrique Dornelas",
    role: "Construtor Autônomo",
    rating: 4,
    comment: "Produto muito bom. Na primeira compra tive uma pequena dificuldade no cadastro, mas o time resolveu em minutos pelo WhatsApp. Depois disso, tudo certo. O material chegou em perfeitas condições.",
  },
  {
    name: "Leandro Castro",
    role: "Mestre de Obras",
    rating: 5,
    comment: "Compro aqui há 3 anos. Produto confiável, entrega pontual, equipe prestativa. Tudo o que um profissional de obra precisa. Daria 10 estrelas se pudesse.",
  },
]

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDateInPast(maxDaysAgo: number): string {
  const daysAgo = randomBetween(1, maxDaysAgo)
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  // Horário aleatório durante horário comercial
  date.setHours(randomBetween(8, 18))
  date.setMinutes(randomBetween(0, 59))
  return date.toISOString()
}

// Embaralha array (Fisher-Yates)
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, jsonWithSession } = createRouteHandlerSupabase(request)
  const { id: productId } = await params

  // Autenticação e autorização
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return jsonWithSession({ error: "Faça login no painel." }, { status: 401 })
  }
  if (!(await isAdmin(supabase, user.id))) {
    return jsonWithSession({ error: "Acesso restrito a administradores." }, { status: 403 })
  }

  // Valida que o produto existe
  const { data: product } = await supabase
    .from("products")
    .select("id, name")
    .eq("id", productId)
    .maybeSingle()

  if (!product) {
    return jsonWithSession({ error: "Produto não encontrado." }, { status: 404 })
  }

  // Quantidade de reviews a gerar (12–18)
  const count = randomBetween(12, 18)

  // Seleciona e embaralha reviews do pool
  const selected = shuffle(REVIEW_POOL).slice(0, count)

  // Gera rows com datas escalonadas (nos últimos 6 meses — mais realista)
  const rows = selected.map((r) => ({
    product_id: productId,
    customer_name: r.name,
    rating: r.rating,
    comment: r.comment,
    approved: true, // Visível imediatamente
    created_at: randomDateInPast(180),
  }))

  const { error } = await supabase.from("reviews").insert(rows)

  if (error) {
    return jsonWithSession(
      { error: error.message, hint: "Certifique-se que a tabela 'reviews' existe (script 001_create_schema.sql)." },
      { status: 500 }
    )
  }

  return jsonWithSession({ ok: true, generated: count, productName: product.name })
}
