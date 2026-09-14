// =============================================================================
// VALIDAÇÃO DE INPUTS - Esquemas Zod para todas as entradas de dados
// =============================================================================
// Todo input do usuário deve passar por um schema deste arquivo
// =============================================================================

import { z } from "zod"

// -----------------------------------------------------------------------------
// AUTH - Login
// -----------------------------------------------------------------------------
export const loginSchema = z.object({
  email: z.string().email("Email inválido").max(255).trim(),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(128),
  scope: z.enum(["admin", "user"]).optional(),
})

export type LoginInput = z.infer<typeof loginSchema>

// -----------------------------------------------------------------------------
// AUTH - Register
// -----------------------------------------------------------------------------
export const registerSchema = z.object({
  email: z.string().email("Email inválido").max(255).trim(),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres").max(128),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  phone: z.string().regex(/^\(\d{2}\)\d{9}$/, "Telefone deve estar no formato (XX)XXXXXXXXX").optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>

// -----------------------------------------------------------------------------
// ADMIN - Product CRUD
// -----------------------------------------------------------------------------
export const productSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(200),
  description: z.string().max(2000).optional(),
  price: z.number().positive("Preço deve ser positivo").max(999999.99),
  category_id: z.string().uuid("ID de categoria inválido"),
  image_url: z.string().url("URL de imagem inválida").optional(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
  is_new: z.boolean().optional(),
  is_discount: z.boolean().optional(),
  stock_quantity: z.number().int().min(0).max(99999).optional(),
})

export type ProductInput = z.infer<typeof productSchema>

// -----------------------------------------------------------------------------
// ADMIN - Category CRUD
// -----------------------------------------------------------------------------
export const categorySchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífen").max(50),
  description: z.string().max(500).optional(),
  sort_order: z.number().int().min(0).max(999).optional(),
  active: z.boolean().optional(),
})

export type CategoryInput = z.infer<typeof categorySchema>

// -----------------------------------------------------------------------------
// ORDER - Checkout
// -----------------------------------------------------------------------------
export const orderSchema = z.object({
  customer_name: z.string().min(2, "Nome obrigatório").max(100),
  customer_email: z.string().email("Email inválido").max(255),
  customer_phone: z.string().regex(/^\(\d{2}\)\d{9}$/, "Telefone inválido"),
  customer_address: z.string().min(5, "Endereço obrigatório").max(500),
  customer_city: z.string().min(2, "Cidade obrigatória").max(100),
  customer_state: z.string().length(2, "Estado deve ter 2 caracteres").toUpperCase(),
  customer_zip: z.string().regex(/^\d{8}$/, "CEP inválido"),
  items: z.array(z.object({
    product_id: z.string().uuid("ID de produto inválido"),
    quantity: z.number().int().min(1).max(1000),
    unit_price: z.number().positive("Preço deve ser positivo"),
  })).min(1, "Pelo menos um item é obrigatório"),
  payment_method: z.enum(["pix", "credit_card", "bank_transfer", "cash"]),
  total: z.number().positive("Total deve ser positivo"),
  notes: z.string().max(1000).optional(),
})

export type OrderInput = z.infer<typeof orderSchema>

// -----------------------------------------------------------------------------
// CONTACT / FALE CONOSCO
// -----------------------------------------------------------------------------
export const contactSchema = z.object({
  name: z.string().min(2, "Nome obrigatório").max(100),
  email: z.string().email("Email inválido").max(255),
  phone: z.string().regex(/^\(\d{2}\)\d{9}$/, "Telefone inválido").optional(),
  subject: z.string().min(5, "Assunto obrigatório").max(200),
  message: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres").max(2000),
})

export type ContactInput = z.infer<typeof contactSchema>

// -----------------------------------------------------------------------------
// WHATSAPP ANALYTICS
// -----------------------------------------------------------------------------
export const whatsappClickSchema = z.object({
  source: z.string().min(1, "Fonte obrigatória").max(50),
  page: z.string().max(200).optional(),
  action: z.string().max(50).optional(),
})

export type WhatsappClickInput = z.infer<typeof whatsappClickSchema>

// -----------------------------------------------------------------------------
// UTILITY - Sanitizar string para evitar XSS
// -----------------------------------------------------------------------------
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim()
}

/**
 * Valida e sanitiza um objeto contra schemas Zod
 * @throws {Error} Se a validação falhar
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)

  if (!result.success) {
    const errors = result.error.errors.map(e => ({
      path: e.path.join("."),
      message: e.message,
    }))
    throw new Error(`Validação falhou: ${JSON.stringify(errors)}`)
  }

  return result.data
}
