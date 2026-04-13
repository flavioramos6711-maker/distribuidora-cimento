-- Segurança em admin_users + exemplo de seed com senha hasheada (bcrypt via pgcrypto).
-- Execute no SQL Editor do Supabase (Dashboard → SQL).
--
-- Requisitos no app: SUPABASE_SERVICE_ROLE_KEY no .env (rotas /api/admin/* usam service role).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- RLS: bloqueia leitura/escrita via anon key no PostgREST.
-- A chave service_role ignora RLS — usada só no servidor nas APIs de admin.
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Sem políticas para public/authenticated = sem acesso pela API pública.
-- (Não crie política SELECT aberta para anon.)

-- ---------------------------------------------------------------------------
-- Criar ou atualizar um administrador (ajuste email, senha e nome).
-- O hash é compatível com bcryptjs no Node (login em app/api/admin/login).
-- ---------------------------------------------------------------------------
-- INSERT INTO public.admin_users (email, password_hash, name)
-- VALUES (
--   lower(trim('admin@suaempresa.com.br')),
--   crypt('DefinaUmaSenhaForte', gen_salt('bf', 10)),
--   'Administrador'
-- )
-- ON CONFLICT (email) DO UPDATE SET
--   password_hash = EXCLUDED.password_hash,
--   name = EXCLUDED.name;
