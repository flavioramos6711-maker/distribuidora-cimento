-- Tabela de autorização do painel admin (Supabase Auth).
-- O id deve coincidir com auth.users.id após cadastro/login.
--
-- 1) Rode este script no SQL Editor do Supabase.
-- 2) Crie o usuário em Authentication → Users (ou via /api/auth/register com scope admin, se habilitado).
-- 3) Insira a linha em admins com o MESMO id do auth.users:
--
-- INSERT INTO public.admins (id, email, role)
-- VALUES ('<uuid-do-auth.users>', 'email@exemplo.com', 'admin');

CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admins_email_idx ON public.admins (lower(email));

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_select_own" ON public.admins;
CREATE POLICY "admins_select_own"
  ON public.admins
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

COMMENT ON TABLE public.admins IS 'Usuários com acesso ao /admin; autenticação via auth.users.';
