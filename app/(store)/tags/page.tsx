"use client"

import Link from "next/link"
import { Tag as TagIcon } from "lucide-react"

// Inicialmente hardcoded, preparado para CRUD via dashboard
const TAGS = [
  { id: "1", name: "Cimento", slug: "cimento", count: 12 },
  { id: "2", name: "Argamassa", slug: "argamassa", count: 8 },
  { id: "3", name: "Ferramentas", slug: "ferramentas", count: 15 },
  { id: "4", name: "Pisos", slug: "pisos", count: 20 },
  { id: "5", name: "Tintas", slug: "tintas", count: 10 },
  { id: "6", name: "Eletricidade", slug: "eletricidade", count: 25 },
  { id: "7", name: "Hidráulica", slug: "hidraulica", count: 18 },
  { id: "8", name: "Iluminação", slug: "iluminacao", count: 14 },
]

export default function TagsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 border-b pb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <TagIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Tags</h1>
          <p className="text-muted-foreground">Navegue pelos produtos através de etiquetas</p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {TAGS.map((tag) => (
          <Link
            key={tag.id}
            href={`/tag/${tag.slug}`}
            className="group relative flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-6 text-center transition-all hover:border-primary/50 hover:shadow-lg active:scale-95"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary/10 group-hover:text-primary">
              <TagIcon className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-semibold text-foreground group-hover:text-primary">
              {tag.name}
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {tag.count} produtos
            </span>
          </Link>
        ))}
      </div>
    </main>
  )
}
