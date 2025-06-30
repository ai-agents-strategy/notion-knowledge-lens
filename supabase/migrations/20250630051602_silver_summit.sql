/*
  # Recreate Database Schema with Proper Auth Integration

  1. Drop existing tables
    - Drop all existing tables that have incorrect auth integration

  2. Create new tables with proper auth integration
    - `profiles` table with user_id referencing auth.users.id
    - `integrations` table with user_id referencing auth.users.id  
    - `graphs` table with user_id referencing auth.users.id

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public access to gallery graphs

  4. Indexes
    - Add performance indexes on user_id columns
    - Add indexes for public graph access
*/

-- Drop existing tables
DROP TABLE IF EXISTS graphs CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing enum if it exists
DROP TYPE IF EXISTS graph_visibility CASCADE;

-- Create enum for graph visibility
CREATE TYPE graph_visibility AS ENUM ('private', 'unlisted', 'gallery');

-- Create profiles table with proper auth integration
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  user_name text,
  user_bio text,
  user_website text,
  user_twitter text,
  user_linkedin text,
  user_github text,
  user_email text
);

-- Create integrations table with proper auth integration
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  integration_type text NOT NULL,
  api_key text NOT NULL,
  database_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create graphs table with proper auth integration
CREATE TABLE IF NOT EXISTS graphs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE graphs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can read profiles for gallery"
  ON profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Integrations policies
CREATE POLICY "Users can read own integrations"
  ON integrations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations"
  ON integrations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations"
  ON integrations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations"
  ON integrations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Graphs policies
CREATE POLICY "Users can read own graphs"
  ON graphs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own graphs"
  ON graphs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own graphs"
  ON graphs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own graphs"
  ON graphs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(integration_type);
CREATE INDEX IF NOT EXISTS idx_graphs_user_id ON graphs(user_id);
CREATE INDEX IF NOT EXISTS idx_graphs_public_id ON graphs(public_id);
CREATE INDEX IF NOT EXISTS idx_graphs_visibility_public ON graphs(visibility, public_id) WHERE visibility = 'gallery' AND public_id IS NOT NULL;

-- Create helper function to get current user ID
CREATE OR REPLACE FUNCTION get_auth_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT auth.uid();
$$;