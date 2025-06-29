
-- Create a table to store user-generated knowledge graphs
CREATE TABLE public.graphs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  nodes JSONB,
  connections JSONB,
  public_id UUID UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.graphs IS 'Stores user-generated knowledge graphs from Notion syncs, with an optional public ID for sharing.';
COMMENT ON COLUMN public.graphs.user_id IS 'The Clerk user ID of the graph owner.';
COMMENT ON COLUMN public.graphs.nodes IS 'The JSONB representation of the graph nodes.';
COMMENT ON COLUMN public.graphs.connections IS 'The JSONB representation of the graph connections.';
COMMENT ON COLUMN public.graphs.public_id IS 'A unique ID for sharing the graph publicly. If NULL, the graph is private.';

-- Enable Row Level Security for the graphs table
ALTER TABLE public.graphs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view, create, update, and delete their own graphs.
CREATE POLICY "Users can manage their own graphs"
ON public.graphs
FOR ALL
USING (public.get_clerk_user_id() = user_id)
WITH CHECK (public.get_clerk_user_id() = user_id);

-- Function to update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the 'updated_at' timestamp on modification.
CREATE TRIGGER handle_graphs_updated_at
BEFORE UPDATE ON public.graphs
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
