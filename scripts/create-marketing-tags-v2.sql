-- Tabela para gerenciar tags de marketing dinamicamente
CREATE TABLE IF NOT EXISTS marketing_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  tag_id TEXT,
  enabled BOOLEAN DEFAULT true,
  code TEXT,
  conversion_label TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE marketing_tags ENABLE ROW LEVEL SECURITY;

-- Politica para leitura publica
CREATE POLICY "marketing_tags_public_read" ON marketing_tags
  FOR SELECT USING (true);

-- Politica para escrita
CREATE POLICY "marketing_tags_authenticated_write" ON marketing_tags
  FOR ALL USING (auth.role() = 'authenticated');
