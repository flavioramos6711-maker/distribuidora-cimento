-- =============================================================================
-- 013_add_description_to_categories.sql
-- =============================================================================

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description TEXT;
