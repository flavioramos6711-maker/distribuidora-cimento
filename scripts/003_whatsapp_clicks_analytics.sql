-- Analytics de cliques WhatsApp (executar no SQL Editor do Supabase)
-- A leitura no admin usa a service role via API; inserts públicos via API com service role.

CREATE TABLE IF NOT EXISTS public.whatsapp_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  page TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS whatsapp_clicks_created_at_idx ON public.whatsapp_clicks (created_at DESC);
CREATE INDEX IF NOT EXISTS whatsapp_clicks_source_idx ON public.whatsapp_clicks (source);

-- Se a tabela já existia só com colunas antigas:
ALTER TABLE public.whatsapp_clicks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL;
ALTER TABLE public.whatsapp_clicks ADD COLUMN IF NOT EXISTS page TEXT;
ALTER TABLE public.whatsapp_clicks ADD COLUMN IF NOT EXISTS device_type TEXT;
ALTER TABLE public.whatsapp_clicks ADD COLUMN IF NOT EXISTS browser TEXT;
ALTER TABLE public.whatsapp_clicks ADD COLUMN IF NOT EXISTS os TEXT;
