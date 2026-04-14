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
        placeholder="Buscar produtos..."
        className="h-11 w-full rounded-full border border-border/50 bg-muted/40 pl-4 pr-12 text-sm text-foreground shadow-inner placeholder:text-muted-foreground outline-none transition duration-200 focus:border-primary/35 focus:bg-background focus:shadow-app"
      />
      <button
        type="submit"
        className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground transition duration-200 hover:scale-[1.05] hover:bg-primary/92 active:scale-[0.95]"
        aria-label="Buscar"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  )
}
