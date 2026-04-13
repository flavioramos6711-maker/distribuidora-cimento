-- =============================================================================
-- Cria ou ATUALIZA contas do painel admin (tabela public.admin_users).
-- Execute no Supabase: Dashboard → SQL → New query → Run.
--
-- Requisitos no app: .env.local com SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL
--
-- O password_hash abaixo é bcrypt (compatível com app/api/admin/login).
-- Para gerar outro hash: pnpm admin:hash-password -- "suaNovaSenha"
-- =============================================================================

INSERT INTO public.admin_users (email, password_hash, name)
VALUES
  (
    'consultorgabriel2026@gmail.com',
    '$2a$12$NUOQyJUPxve.oxPrmnxu1u6BpVe2.Ixyf0gPbtVmtuPVA40SrwH0G',
    'Consultor Gabriel'
  ),
  (
    'flavioramos6711@gmail.com',
    '$2a$12$NUOQyJUPxve.oxPrmnxu1u6BpVe2.Ixyf0gPbtVmtuPVA40SrwH0G',
    'Flavio Ramos'
  )
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name;
