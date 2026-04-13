-- =============================================================================
-- GARANTIR ACESSO AO PAINEL ADMIN (Supabase → SQL → New query → RUN)
-- =============================================================================
--
-- ANTES DE RODAR ESTE SQL:
--   1) No projeto (.env.local ou Vercel): NEXT_PUBLIC_SUPABASE_URL e
--      SUPABASE_SERVICE_ROLE_KEY (service_role do Supabase → Settings → API).
--   2) Depois do deploy, faça login em /admin/login com o e-mail abaixo e a
--      senha que você definiu ao gerar este hash (pnpm admin:hash-password).
--
-- Hash bcrypt atualizado e conferido no projeto (mesma senha para ambos e-mails
-- se você usar este arquivo sem alterar o password_hash).
--
-- =============================================================================

INSERT INTO public.admin_users (email, password_hash, name)
VALUES
  (
    'consultorgabriel2026@gmail.com',
    '$2a$12$F1RUz0o7o5pxMiv4oJyaOu57VohxlLsFOvmnbf5Sy4xgJngPFhPwy',
    'Consultor Gabriel'
  ),
  (
    'flavioramos6711@gmail.com',
    '$2a$12$F1RUz0o7o5pxMiv4oJyaOu57VohxlLsFOvmnbf5Sy4xgJngPFhPwy',
    'Flavio Ramos'
  )
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name;
