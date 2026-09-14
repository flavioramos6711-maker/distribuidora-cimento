# =============================================================================
# DISTRIBUIDORA DE CIMENTO - Dockerfile
# =============================================================================
# Build: docker build -t distribuidora-cimento .
# Run:    docker run -p 3000:3000 --env-file .env.local distribuidora-cimento
# =============================================================================

# ---- STAGE 1: Dependencies ----
FROM node:22-alpine AS deps
WORKDIR /app

# Instalar dependências nativas necessárias para Sharp
RUN apk add --no-cache libc6-compat

# Copiar package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Instalar pnpm
RUN corepack enable pnpm && pnpm add -g pnpm@9.15.0

# Instalar dependências
RUN pnpm install --frozen-lockfile --prod=false

# ---- STAGE 2: Build ----
FROM node:22-alpine AS builder
WORKDIR /app

# Copiar node_modules do stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variáveis de ambiente para build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build da aplicação
RUN pnpm run build

# ---- STAGE 3: Production ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Criar usuário não-root por segurança
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copiar arquivos necessários do builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Permissões de segurança
RUN chown -R appuser:appgroup /app && \
    chmod -R 755 /app && \
    chmod -R 777 /app/.next/cache

# Trocar para usuário não-root
USER appuser

# Expor porta
EXPOSE 3000
ENV PORT=3000
HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Iniciar aplicação
CMD ["node", "server.js"]
