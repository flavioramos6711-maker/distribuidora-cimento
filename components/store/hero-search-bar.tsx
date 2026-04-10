"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

export default function HeroSearchBar() {
  const [q, setQ] = useState("")
  const router = useRouter()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const t = q.trim()
    router.push(t ? `/busca?q=${encodeURIComponent(t)}` : "/produtos")
  }

  return (
    <div className="relative z-10 w-full max-w-2xl mx-auto px-4 -mt-6 sm:-mt-8 mb-2">
      <form
        onSubmit={submit}
        className="flex items-center gap-2 rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-lg shadow-secondary/5 px-2 py-2 pl-4 ring-1 ring-border/60"
      >
        <Search className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar cimento, argamassa, ferragens..."
          className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-2"
          aria-label="Buscar produtos"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Buscar
        </button>
      </form>
    </div>
  )
}
