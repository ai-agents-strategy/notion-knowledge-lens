/*
  # Complete database schema with visibility and user profile features

  1. New Tables
    - `profiles` - User profile information
    - `integrations` - API keys and integration settings
    - `graphs` - Knowledge graph data with visibility controls

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and public access
    - Add policies for gallery visibility

  3. Features
    - Graph visibility levels (private, unlisted, gallery)
    - User profile fields for social links and branding
    - Graph metadata (title, description, tags)
*/

-- Create custom types
CREATE TYPE graph_visibility AS ENUM ('private', 'unlisted', 'gallery');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_name text,
  user_bio text,
  user_website text,
  user_twitter text,
  user_linkedin text,
  user_github text
);

-- Create integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  integration_type text NOT NULL,
  api_key text NOT NULL,
  database_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create graphs table
CREATE TABLE IF NOT EXISTS graphs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  nodes jsonb,
  connections jsonb,
  public_id text UNIQUE,
  visibility graph_visibility DEFAULT 'private',
  graph_title text,
  graph_description text,
  graph_tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE graphs ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(integration_type);
CREATE INDEX IF NOT EXISTS idx_graphs_user_id ON graphs(user_id);
CREATE INDEX IF NOT EXISTS idx_graphs_public_id ON graphs(public_id);
CREATE INDEX IF NOT EXISTS idx_graphs_visibility_public ON graphs(visibility, public_id) 
WHERE visibility = 'gallery' AND public_id IS NOT NULL;

-- RLS Policies for profiles table
CREATE POLICY "Public can read profiles for gallery"
  ON profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = clerk_user_id)
  WITH CHECK (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can delete own profile"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = clerk_user_id);

-- RLS Policies for integrations table
CREATE POLICY "Users can read own integrations"
  ON integrations
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own integrations"
  ON integrations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own integrations"
  ON integrations
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own integrations"
  ON integrations
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- RLS Policies for graphs table
CREATE POLICY "Users can read own graphs"
  ON graphs
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Public can read gallery graphs"
  ON graphs
  FOR SELECT
  TO anon, authenticated
  USING (visibility = 'gallery' AND public_id IS NOT NULL);

CREATE POLICY "Public can read unlisted graphs by public_id"
  ON graphs
  FOR SELECT
  TO anon, authenticated
  USING (visibility = 'unlisted' AND public_id IS NOT NULL);

CREATE POLICY "Users can insert own graphs"
  ON graphs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own graphs"
  ON graphs
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own graphs"
  ON graphs
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Create function to get current user ID
CREATE OR REPLACE FUNCTION get_clerk_user_id()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT auth.uid()::text;
$$;