-- Adiciona colunas faltantes na tabela site_settings
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS banner_images jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS testimonials jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS institutional_title text,
ADD COLUMN IF NOT EXISTS institutional_body text,
ADD COLUMN IF NOT EXISTS chat_avatar_url text,
ADD COLUMN IF NOT EXISTS chat_agent_name text DEFAULT 'Atendente';
