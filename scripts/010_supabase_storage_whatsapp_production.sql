-- =============================================================================
-- Infra Supabase: Storage (produtos + banners) + tabela whatsapp_clicks completa
-- Execute este arquivo INTEIRO no SQL Editor do projeto (Supabase Dashboard).
-- Idempotente: pode rodar mais de uma vez.
-- Pré-requisito recomendado: public.admins (scripts/009_admins_supabase_auth.sql)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) STORAGE: buckets públicos para URLs getPublicUrl() na loja
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'produtos',
    'produtos',
    true,
    8388608,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]
  ),
  (
    'banners',
    'banners',
    true,
    8388608,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]
  )
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Leitura pública das imagens (site + Next/Image). Upload do painel usa service role.
DROP POLICY IF EXISTS "Public read objects produtos" ON storage.objects;
CREATE POLICY "Public read objects produtos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'produtos');

DROP POLICY IF EXISTS "Public read objects banners" ON storage.objects;
CREATE POLICY "Public read objects banners"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'banners');

-- -----------------------------------------------------------------------------
-- 2) whatsapp_clicks: estrutura compatível com app/api/analytics/whatsapp-click
--    e app/api/admin/whatsapp-analytics (id, user_id, source, page, device_type,
--    browser, os, created_at)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whatsapp_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'unknown',
  page TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_clicks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL;
ALTER TABLE public.whatsapp_clicks ADD COLUMN IF NOT EXISTS page TEXT;
ALTER TABLE public.whatsapp_clicks ADD COLUMN IF NOT EXISTS device_type TEXT;
ALTER TABLE public.whatsapp_clicks ADD COLUMN IF NOT EXISTS browser TEXT;
ALTER TABLE public.whatsapp_clicks ADD COLUMN IF NOT EXISTS os TEXT;
ALTER TABLE public.whatsapp_clicks ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE public.whatsapp_clicks ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;

-- Dados legíveis antes de NOT NULL / defaults
UPDATE public.whatsapp_clicks SET source = 'unknown' WHERE source IS NULL;
UPDATE public.whatsapp_clicks SET created_at = now() WHERE created_at IS NULL;

ALTER TABLE public.whatsapp_clicks ALTER COLUMN source SET DEFAULT 'unknown';
ALTER TABLE public.whatsapp_clicks ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.whatsapp_clicks ALTER COLUMN source SET NOT NULL;
ALTER TABLE public.whatsapp_clicks ALTER COLUMN created_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS whatsapp_clicks_created_at_idx ON public.whatsapp_clicks (created_at DESC);
CREATE INDEX IF NOT EXISTS whatsapp_clicks_source_idx ON public.whatsapp_clicks (source);

-- -----------------------------------------------------------------------------
-- 3) RLS: leitura apenas para admins autenticados (painel). Service role ignora RLS.
-- -----------------------------------------------------------------------------
ALTER TABLE public.whatsapp_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "whatsapp_clicks_select_admins" ON public.whatsapp_clicks;
CREATE POLICY "whatsapp_clicks_select_admins"
  ON public.whatsapp_clicks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  );

-- Sem política INSERT/UPDATE/DELETE para authenticated: inserções vêm da API com service role.

COMMENT ON TABLE public.whatsapp_clicks IS 'Cliques WhatsApp; escrita via /api/analytics/whatsapp-click (service role).';
