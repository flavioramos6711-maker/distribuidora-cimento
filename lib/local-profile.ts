/** Dados complementares no navegador (até integração com Supabase profiles) */

const PROFILE_KEY = "ccc_distribuidora_profile"
const ADDR_KEY = "ccc_distribuidora_addresses"

export type LocalProfile = {
  fullName: string
  phone: string
  company?: string
}

export type LocalAddress = {
  id: string
  label: string
  street: string
  number: string
  complement?: string
  district: string
  city: string
  state: string
  zip: string
}

export function getLocalProfile(): LocalProfile | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? (JSON.parse(raw) as LocalProfile) : null
  } catch {
    return null
  }
}

export function setLocalProfile(p: LocalProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
}

export function getLocalAddresses(): LocalAddress[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(ADDR_KEY)
    const a = raw ? JSON.parse(raw) : []
    return Array.isArray(a) ? a : []
  } catch {
    return []
  }
}

export function setLocalAddresses(list: LocalAddress[]) {
  localStorage.setItem(ADDR_KEY, JSON.stringify(list))
}
