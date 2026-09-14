// =============================================================================
// RATE LIMITER - Proteção contra abuso de APIs
// =============================================================================
// Armazena requisições em memória (para distribuição em múltiplas instâncias,
// use Redis ou outro store distribuído)
// =============================================================================

interface RateLimitEntry {
  count: number
  resetTime: number
}

interface RateLimitConfig {
  windowMs: number      // Janela de tempo em milissegundos
  maxRequests: number    // Máximo de requisições permitidas na janela
}

const store = new Map<string, RateLimitEntry>()

/**
 * Verifica se uma requisição está dentro do rate limit
 * @returns true se a requisição deve ser permitida, false se deve ser bloqueada
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 100 },
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = store.get(identifier)

  if (!entry || now > entry.resetTime) {
    // Nova janela
    store.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    }
  }

  if (entry.count >= config.maxRequests) {
    // Limite excedido
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  // Incrementar contador
  entry.count++
  store.set(identifier, entry)

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Limpa entradas expiradas do rate limiter
 */
export function cleanupRateLimiter(): void {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key)
    }
  }
}

/**
 * Reseta o rate limit para um identificador específico
 */
export function resetRateLimit(identifier: string): void {
  store.delete(identifier)
}

// Cleanup periódico a cada 5 minutos
setInterval(cleanupRateLimiter, 5 * 60 * 1000)
