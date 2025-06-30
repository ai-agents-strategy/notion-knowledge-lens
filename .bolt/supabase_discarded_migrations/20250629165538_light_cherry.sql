/*
  # Add graph visibility and user profile fields

  1. New Tables
    - Add visibility column to graphs table
    - Add user profile fields for social links and branding
    - Add graph metadata fields

  2. Changes
    - Add visibility enum: private, unlisted, gallery
    - Add user profile fields: name, bio, website, social links
    - Add graph metadata: title, description, tags

  3. Security
    - Update RLS policies for new visibility levels
    - Add policies for gallery access
*/

-- Add visibility enum type
CREATE TYPE graph_visibility AS ENUM ('private', 'unlisted', 'gallery');

-- Add columns to graphs table
ALTER TABLE graphs 
ADD COLUMN IF NOT EXISTS visibility graph_visibility DEFAULT 'private',
ADD COLUMN IF NOT EXISTS graph_title text,
ADD COLUMN IF NOT EXISTS graph_description text,
ADD COLUMN IF NOT EXISTS graph_tags text[];

-- Add user profile fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS user_name text,
ADD COLUMN IF NOT EXISTS user_bio text,
ADD COLUMN IF NOT EXISTS user_website text,
ADD COLUMN IF NOT EXISTS user_twitter text,
ADD COLUMN IF NOT EXISTS user_linkedin text,
ADD COLUMN IF NOT EXISTS user_github text;

-- Update existing graphs to have 'unlisted' visibility if they have a public_id
UPDATE graphs 
SET visibility = 'unlisted' 
WHERE public_id IS NOT NULL AND visibility = 'private';

-- Create index for gallery queries
CREATE INDEX IF NOT EXISTS idx_graphs_visibility_public ON graphs(visibility, public_id) 
WHERE visibility = 'gallery' AND public_id IS NOT NULL;

-- Update RLS policies for graphs table
DROP POLICY IF EXISTS "Users can read own graphs" ON graphs;
DROP POLICY IF EXISTS "Users can insert own graphs" ON graphs;
DROP POLICY IF EXISTS "Users can update own graphs" ON graphs;
DROP POLICY IF EXISTS "Users can delete own graphs" ON graphs;

-- New RLS policies
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

-- Add RLS policies for profiles table
CREATE POLICY "Public can read profiles for gallery"
  ON profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = clerk_user_id)
  WITH CHECK (auth.uid()::text = clerk_user_id);