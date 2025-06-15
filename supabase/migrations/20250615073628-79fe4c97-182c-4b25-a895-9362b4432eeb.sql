
ALTER TABLE public.graphs ADD COLUMN color_settings JSONB;

COMMENT ON COLUMN public.graphs.color_settings IS 'Stores user-defined color settings for graph visualization, e.g., category and connection colors.';
