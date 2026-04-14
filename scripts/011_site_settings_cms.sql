-- CMS leve: identidade visual e conteúdo institucional (site_settings).
-- Rode no SQL Editor do Supabase após scripts de admins e storage.
--
-- Uso:
--   - Logo, favicon, slides do hero (banner_images JSON), textos institucionais, depoimentos (JSON).
--   - Uploads continuam em Storage (buckets produtos/banners); URLs salvas nesta tabela.

CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  logo_url TEXT,
  favicon_url TEXT,
  banner_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  institutional_title TEXT,
  institutional_body TEXT,
  testimonials JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.site_settings IS 'Configuração visual e de conteúdo da loja (singleton id=default).';
COMMENT ON COLUMN public.site_settings.banner_images IS 'Array de slides: [{ "image_url", "link?", "title?", "subtitle?" }].';
COMMENT ON COLUMN public.site_settings.testimonials IS 'Array: [{ "name", "text", "rating?" (1-5), "role?" }].';

INSERT INTO public.site_settings (id) VALUES ('default')
ON CONFLICT (id) DO NOTHING;

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
