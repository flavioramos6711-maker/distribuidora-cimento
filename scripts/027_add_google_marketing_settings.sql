-- =============================================================================
-- MIGRAÇÃO 027: Configurações de Google Marketing e SEO Local
-- Adiciona colunas para GTM, GA4, Search Console, Google Ads e Google Meu Negócio
-- =============================================================================

-- Adiciona colunas na tabela site_settings (se não existirem)
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS gtm_id TEXT,
  ADD COLUMN IF NOT EXISTS ga4_id TEXT,
  ADD COLUMN IF NOT EXISTS google_site_verification TEXT,
  ADD COLUMN IF NOT EXISTS google_ads_id TEXT,
  ADD COLUMN IF NOT EXISTS google_ads_conversion_label TEXT,
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS business_address TEXT,
  ADD COLUMN IF NOT EXISTS business_phone TEXT,
  ADD COLUMN IF NOT EXISTS business_hours TEXT,
  ADD COLUMN IF NOT EXISTS business_maps_url TEXT;

-- Comentários para documentação
COMMENT ON COLUMN public.site_settings.gtm_id IS 'Google Tag Manager Container ID (ex: GTM-XXXXXXX)';
COMMENT ON COLUMN public.site_settings.ga4_id IS 'Google Analytics 4 Measurement ID (ex: G-XXXXXXXXXX)';
COMMENT ON COLUMN public.site_settings.google_site_verification IS 'Token de verificação do Google Search Console (meta tag google-site-verification)';
COMMENT ON COLUMN public.site_settings.google_ads_id IS 'Google Ads Conversion ID (ex: AW-XXXXXXXXX)';
COMMENT ON COLUMN public.site_settings.google_ads_conversion_label IS 'Google Ads Conversion Label para conversões específicas';
COMMENT ON COLUMN public.site_settings.business_name IS 'Nome da empresa no Google Meu Negócio (Razão Social / Nome Fantasia)';
COMMENT ON COLUMN public.site_settings.business_address IS 'Endereço completo para Google Meu Negócio e schema.org';
COMMENT ON COLUMN public.site_settings.business_phone IS 'Telefone principal para contato (formato exibição)';
COMMENT ON COLUMN public.site_settings.business_hours IS 'Horário de funcionamento (ex: "Seg-Sex: 07h-18h | Sáb: 07h-12h")';
COMMENT ON COLUMN public.site_settings.business_maps_url IS 'URL do perfil do Google Maps / Google Meu Negócio';

-- Atualiza o registro default com valores padrão baseados nos dados da empresa
UPDATE public.site_settings
SET
  business_name = COALESCE(business_name, 'Cimento & Cal Distribuidora'),
  business_address = COALESCE(business_address, 'Rua Igarapava, 73 - Vila Albertina, Ribeirão Preto - SP, CEP 14.075-453'),
  business_phone = COALESCE(business_phone, '(16) 9644-7972'),
  business_hours = COALESCE(business_hours, 'Segunda a Sexta: 07:00 - 18:00 | Sábado: 07:00 - 12:00'),
  business_maps_url = COALESCE(business_maps_url, 'https://maps.google.com/?q=Cimento+Cal+Distribuidora+Ribeirao+Preto')
WHERE id = 'default';

-- Garante que a linha default existe (caso a tabela esteja vazia)
INSERT INTO public.site_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;