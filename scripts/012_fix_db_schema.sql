-- =============================================================================
-- SCRIPT DE CORREÇÃO UNIFICADO - 012_fix_db_schema.sql
-- Este script corrige os erros de esquema e tipos de dados reportados.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) CORREÇÃO: whatsapp_clicks (adicionar colunas faltantes)
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

-- Adiciona colunas se a tabela já existia sem elas
ALTER TABLE public.whatsapp_clicks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL;
ALTER TABLE public.whatsapp_clicks ADD COLUMN IF NOT EXISTS page TEXT;
ALTER TABLE public.whatsapp_clicks ADD COLUMN IF NOT EXISTS device_type TEXT;
ALTER TABLE public.whatsapp_clicks ADD COLUMN IF NOT EXISTS browser TEXT;
ALTER TABLE public.whatsapp_clicks ADD COLUMN IF NOT EXISTS os TEXT;
ALTER TABLE public.whatsapp_clicks ADD COLUMN IF NOT EXISTS source TEXT;

-- Ajusta tipos e defaults caso existam valores nulos em colunas obrigatórias
UPDATE public.whatsapp_clicks SET source = 'unknown' WHERE source IS NULL;
ALTER TABLE public.whatsapp_clicks ALTER COLUMN source SET DEFAULT 'unknown';
ALTER TABLE public.whatsapp_clicks ALTER COLUMN source SET NOT NULL;

-- -----------------------------------------------------------------------------
-- 2) CORREÇÃO: site_settings (corrigir ID e colunas CMS)
-- -----------------------------------------------------------------------------

-- Se a tabela existir e o ID for UUID, precisamos recriar para suportar ID='default'
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'site_settings') THEN
        IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'id') = 'uuid' THEN
            DROP TABLE public.site_settings CASCADE;
        END IF;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  logo_url TEXT,
  favicon_url TEXT,
  chat_header_url TEXT,
  banner_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  institutional_title TEXT,
  institutional_body TEXT,
  testimonials JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Garante colunas se a tabela já existia (e não foi dropada acima)
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS banner_images JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS testimonials JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS favicon_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS chat_header_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS institutional_title TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS institutional_body TEXT;

-- Insere o registro singleton se não existir
INSERT INTO public.site_settings (id) VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3) POLÍTICAS DE SEGURANÇA (RLS)
-- -----------------------------------------------------------------------------

-- whatsapp_clicks
ALTER TABLE public.whatsapp_clicks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "whatsapp_clicks_select_admins" ON public.whatsapp_clicks;
CREATE POLICY "whatsapp_clicks_select_admins"
  ON public.whatsapp_clicks
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_select_public" ON public.site_settings;
CREATE POLICY "site_settings_select_public"
  ON public.site_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "site_settings_update_admin" ON public.site_settings;
CREATE POLICY "site_settings_update_admin"
  ON public.site_settings
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.id = auth.uid()));

DROP POLICY IF EXISTS "site_settings_insert_admin" ON public.site_settings;
CREATE POLICY "site_settings_insert_admin"
  ON public.site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.id = auth.uid()));
