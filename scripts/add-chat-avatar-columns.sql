-- Adiciona colunas para avatar e nome do atendente no chat
-- Executar no Supabase SQL Editor

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS chat_avatar_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS chat_agent_name TEXT DEFAULT 'Atendente';
