
-- Remove api_key column from integrations table since we're storing keys in localStorage
ALTER TABLE public.integrations DROP COLUMN IF EXISTS api_key;
