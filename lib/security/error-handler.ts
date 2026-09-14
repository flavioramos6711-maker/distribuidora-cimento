// =============================================================================
// ERROR HANDLER - Tratamento centralizado de erros
// =============================================================================
// Fornece respostas padronizadas e logging consistente
// =============================================================================

export interface AppError {
  message: string
  code: string
  statusCode: number
  details?: Record<string, unknown>
}

// Códigos de erro do sistema
export const ERROR_CODES = {
  // Auth
  AUTH_INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  AUTH_USER_NOT_FOUND: "AUTH_USER_NOT_FOUND",
  AUTH_SESSION_EXPIRED: "AUTH_SESSION_EXPIRED",
  AUTH_NOT_ADMIN: "AUTH_NOT_ADMIN",

  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  INVALID_INPUT_FORMAT: "INVALID_INPUT_FORMAT",

  // Database
  DATABASE_ERROR: "DATABASE_ERROR",
  RECORD_NOT_FOUND: "RECORD_NOT_FOUND",
  RECORD_ALREADY_EXISTS: "RECORD_ALREADY_EXISTS",

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",

  // General
  INTERNAL_ERROR: "INTERNAL_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const

/**
 * Cria um AppError com código e status específicos
 */
export function createError(
  message: string,
  code: string = ERROR_CODES.INTERNAL_ERROR,
  statusCode: number = 500,
  details?: Record<string, unknown>,
): AppError {
  return { message, code, statusCode, details }
}

/**
 * Converte erros conhecidos em respostas HTTP padronizadas
 */
export function handleError(error: unknown): AppError {
  // Erros Supabase
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as Error).message

    // Senha inválida
    if (msg.includes("Invalid login credentials")) {
      return createError("Credenciais inválidas", ERROR_CODES.AUTH_INVALID_CREDENTIALS, 401)
    }

    // Rate limiting do Supabase
    if (msg.includes("rate limit")) {
      return createError("Limite de requisições excedido", ERROR_CODES.RATE_LIMIT_EXCEEDED, 429)
    }
  }

  // Erros de validação
  if (error instanceof Error && error.message.startsWith("Validação falhou")) {
    return createError(error.message, ERROR_CODES.VALIDATION_ERROR, 400)
  }

  // Erro genérico
  return createError("Erro interno do servidor", ERROR_CODES.INTERNAL_ERROR, 500)
}

/**
 * Responde com erro em formato padronizado
 */
export function errorResponse(error: AppError, init?: ResponseInit): Response {
  const body = {
    error: error.message,
    code: error.code,
    ...(process.env.NODE_ENV === "development" && { details: error.details }),
  }

  return new Response(JSON.stringify(body), {
    status: error.statusCode,
    headers: {
      "Content-Type": "application/json",
      "X-Error-Code": error.code,
    },
    ...init,
  })
}

/**
 * Responde com sucesso em formato padronizado
 */
export function successResponse<T>(data: T, init?: ResponseInit): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  })
}
