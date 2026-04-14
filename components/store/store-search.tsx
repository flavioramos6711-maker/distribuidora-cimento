"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { Search } from "lucide-react"

const DEBOUNCE_MS = 280

/**
 * Campo único de busca: no mobile ocupa a linha inteira abaixo da barra principal (order + basis-full no header).
 */
export default function StoreSearch() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const onBusca = pathname === "/busca"
  const [q, setQ] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (onBusca) {
      setQ(searchParams.get("q") || "")
    } else {
      setQ("")
    }
  }, [onBusca, searchParams])

  const pushBusca = useCallback(
    (next: string) => {
      const trimmed = next.trim()
      const url = trimmed ? `/busca?q=${encodeURIComponent(trimmed)}` : "/busca"
      router.replace(url)
    },
    [router],
  )

  const handleChange = (value: string) => {
    setQ(value)
    if (!onBusca) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      pushBusca(value)
    }, DEBOUNCE_MS)
  }

  return (
    <form
      method="get"
      action="/busca"
      className="relative w-full min-w-0 md:flex-1 md:max-w-2xl md:mx-auto"
      onSubmit={(e) => {
        if (onBusca) {
          e.preventDefault()
          if (debounceRef.current) clearTimeout(debounceRef.current)
          pushBusca(q)
        }
      }}
    >
      <input
        type="search"
        name="q"
        autoComplete="off"
        value={q}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Buscar materiais, marcas, categorias..."
        className="w-full rounded-xl border border-border/80 bg-background/60 pl-4 pr-12 py-2.5 sm:py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
      />
      <button
        type="submit"
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg bg-primary p-2 text-primary-foreground hover:bg-primary/90 transition"
        aria-label="Buscar"
      >
        <Search className="w-4 h-4" />
      </button>
    </form>
  )
}
