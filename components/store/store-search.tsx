"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { Search, Sparkles } from "lucide-react"

const DEBOUNCE_MS = 280

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
      className="relative w-full"
      onSubmit={(e) => {
        if (onBusca) {
          e.preventDefault()
          if (debounceRef.current) clearTimeout(debounceRef.current)
          pushBusca(q)
        }
      }}
    >
          <div className="group relative flex items-center">
        <input
          type="search"
          name="q"
          autoComplete="off"
          value={q}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="O que você está procurando hoje?"
          className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-5 pr-20 text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none transition-all focus:border-[#002D5B] focus:ring-1 focus:ring-[#002D5B]/10"
        />
        <button
          type="submit"
          className="absolute right-0 h-12 w-14 flex items-center justify-center rounded-r-lg bg-gradient-to-br from-[#F47920] to-[#e06b10] text-white transition-all hover:brightness-110 active:scale-95 group/search"
          aria-label="Buscar"
        >
          <Search className="h-5 w-5 group-hover/search:scale-110 transition-transform" />
        </button>
      </div>
    </form>
  )
}
