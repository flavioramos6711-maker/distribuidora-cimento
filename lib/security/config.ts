// =============================================================================
// SECURITY CONFIGURATION
// =============================================================================
// Centraliza todas as configurações de segurança e variáveis de ambiente
// =============================================================================

export const SECURITY_CONFIG = {
  // Rate limiting
  rateLimit: {
    windowMs: 60000,    // 1 minuto
    maxRequests: 30,     // máximo de requisições por janela
  },

  // Sessão
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 dias em segundos
    secret: process.env.NEXT_AUTH_SECRET || "fallback-secret-change-me",
  },

  // Admin registration
  adminRegistrationOpen: process.env.ADMIN_REGISTRATION_OPEN === "true",

  // URLs
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",

  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  },

  // Analytics
  analytics: {
    gtmId: process.env.NEXT_PUBLIC_GTM_ID || "",
    gaId: process.env.NEXT_PUBLIC_GA_ID || "",
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
  },
} as const

/**
 * Verifica se a aplicação está em modo de desenvolvimento
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development"
}

/**
 * Verifica se a aplicação está em modo de produção
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production"
}

/**
 * Valida se as variáveis de ambiente obrigatórias estão definidas
 * @returns array de erros (vazio se tudo OK)
 */
export function validateEnv(): string[] {
  const errors: string[] = []

  if (!SECURITY_CONFIG.supabase.url) {
    errors.push("NEXT_PUBLIC_SUPABASE_URL não definida")
  }
  if (!SECURITY_CONFIG.supabase.anonKey) {
    errors.push("NEXT_PUBLIC_SUPABASE_ANON_KEY não definida")
  }
  if (!SECURITY_CONFIG.supabase.serviceRoleKey && isProduction()) {
    errors.push("SUPABASE_SERVICE_ROLE_KEY não definida (obrigatória em produção)")
  }

  return errors
}
