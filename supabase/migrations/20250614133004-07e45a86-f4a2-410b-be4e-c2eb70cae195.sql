
-- Create integrations table to store various API integrations
CREATE TABLE public.integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Clerk user ID
  integration_type TEXT NOT NULL, -- 'notion', 'slack', etc.
  api_key TEXT NOT NULL,
  database_id TEXT, -- For Notion database ID
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one integration type per user
  UNIQUE(user_id, integration_type)
);

-- Add Row Level Security
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Create policies for integrations table
CREATE POLICY "Users can view their own integrations" 
  ON public.integrations 
  FOR SELECT 
  USING (user_id = get_clerk_user_id());

CREATE POLICY "Users can create their own integrations" 
  ON public.integrations 
  FOR INSERT 
  WITH CHECK (user_id = get_clerk_user_id());

CREATE POLICY "Users can update their own integrations" 
  ON public.integrations 
  FOR UPDATE 
  USING (user_id = get_clerk_user_id());

CREATE POLICY "Users can delete their own integrations" 
  ON public.integrations 
  FOR DELETE 
  USING (user_id = get_clerk_user_id());

-- Remove notion_api_key column from profiles table since we're moving it
ALTER TABLE public.profiles DROP COLUMN IF EXISTS notion_api_key;
