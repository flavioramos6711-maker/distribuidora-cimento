-- =============================================================================
-- ADICIONAR COLUNAS FALTANTES AO CATÁLOGO
-- Executar após 001_create_schema.sql
-- =============================================================================

-- Adicionar coluna SKU na tabela products (se ainda não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'sku'
  ) THEN
    ALTER TABLE public.products ADD COLUMN sku TEXT UNIQUE;
    RAISE NOTICE 'Coluna sku adicionada à tabela products';
  ELSE
    RAISE NOTICE 'Coluna sku já existe na tabela products';
  END IF;
END $$;

-- Adicionar coluna weight (peso) se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'weight'
  ) THEN
    ALTER TABLE public.products ADD COLUMN weight NUMERIC(10,2);
    RAISE NOTICE 'Coluna weight adicionada à tabela products';
  ELSE
    RAISE NOTICE 'Coluna weight já existe na tabela products';
  END IF;
END $$;

-- Garantir que images[] existe e está configurado corretamente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'images'
  ) THEN
    ALTER TABLE public.products ADD COLUMN images TEXT[] DEFAULT ARRAY[]::TEXT[];
    RAISE NOTICE 'Coluna images adicionada à tabela products';
  END IF;
END $$;

-- Índice para buscar por SKU (performance)
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_is_discount ON public.products(is_discount) WHERE is_discount = true;
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON public.products(subcategory_id);

-- =============================================================================
-- IMAGENS DE EXEMPLO - Usar placeholders para desenvolvimento
-- Em produção, substituir por imagens reais do 333obra
-- =============================================================================

-- Função para gerar URL de placeholder inteligente
CREATE OR REPLACE FUNCTION public.get_product_image(p_name TEXT, p_sku TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN format(
    'https://placehold.co/800x800/eeeeee/666666/png?text=%s',
    encode(p_name::bytea, 'hex')
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;
