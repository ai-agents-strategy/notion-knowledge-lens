
-- Create a table for public profiles
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id text NOT NULL UNIQUE,
  notion_api_key text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- This policy allows users to view their own profile.
CREATE POLICY "Users can view their own profile." ON public.profiles
  FOR SELECT USING (clerk_user_id = auth.uid()::text);

-- This policy allows users to update their own profile.
CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (clerk_user_id = auth.uid()::text) WITH CHECK (clerk_user_id = auth.uid()::text);

