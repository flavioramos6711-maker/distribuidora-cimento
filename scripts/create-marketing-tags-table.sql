-- Tabela para gerenciar tags de marketing dinamicamente
CREATE TABLE IF NOT EXISTS marketing_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- gtm, google_ads, google_analytics, meta_pixel, tiktok_pixel, hotjar, clarity, custom
  name TEXT NOT NULL,
  tag_id TEXT, -- ID da tag (GTM-XXX, AW-XXX, G-XXX, etc)
  enabled BOOLEAN DEFAULT true,
  code TEXT, -- Codigo personalizado (para type=custom)
  conversion_label TEXT, -- Rotulo de conversao (Google Ads)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indice para busca por tipo
CREATE INDEX IF NOT EXISTS idx_marketing_tags_type ON marketing_tags(type);

-- Indice para tags ativas
CREATE INDEX IF NOT EXISTS idx_marketing_tags_enabled ON marketing_tags(enabled) WHERE enabled = true;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_marketing_tags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS marketing_tags_updated_at ON marketing_tags;
CREATE TRIGGER marketing_tags_updated_at
  BEFORE UPDATE ON marketing_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_marketing_tags_updated_at();

-- Inserir tags padrao (se nao existirem)
INSERT INTO marketing_tags (type, name, tag_id, enabled)
SELECT 'gtm', 'Google Tag Manager', 'GTM-MLK62TBK', true
WHERE NOT EXISTS (SELECT 1 FROM marketing_tags WHERE type = 'gtm');

INSERT INTO marketing_tags (type, name, tag_id, enabled, conversion_label)
SELECT 'google_ads', 'Google Ads', 'AW-16526087847', true, 'oaK8CIry9L4aEJbA05c_'
WHERE NOT EXISTS (SELECT 1 FROM marketing_tags WHERE type = 'google_ads');

-- Enable RLS
ALTER TABLE marketing_tags ENABLE ROW LEVEL SECURITY;

-- Politica para leitura publica (necessario para carregar tags no frontend)
DROP POLICY IF EXISTS "marketing_tags_public_read" ON marketing_tags;
CREATE POLICY "marketing_tags_public_read" ON marketing_tags
  FOR SELECT USING (true);

-- Politica para escrita (apenas usuarios autenticados/admins)
DROP POLICY IF EXISTS "marketing_tags_authenticated_write" ON marketing_tags;
CREATE POLICY "marketing_tags_authenticated_write" ON marketing_tags
  FOR ALL USING (auth.role() = 'authenticated');
