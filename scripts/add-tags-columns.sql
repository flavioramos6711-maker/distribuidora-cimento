-- Add marketing tags columns to site_settings table
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS gtm_id TEXT DEFAULT 'GTM-MLK62TBK',
ADD COLUMN IF NOT EXISTS google_ads_id TEXT DEFAULT 'AW-16526087847',
ADD COLUMN IF NOT EXISTS gtm_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS google_ads_enabled BOOLEAN DEFAULT TRUE;

-- Update existing row with default values if columns were just added
UPDATE site_settings
SET 
  gtm_id = COALESCE(gtm_id, 'GTM-MLK62TBK'),
  google_ads_id = COALESCE(google_ads_id, 'AW-16526087847'),
  gtm_enabled = COALESCE(gtm_enabled, TRUE),
  google_ads_enabled = COALESCE(google_ads_enabled, TRUE)
WHERE id = 'default';
