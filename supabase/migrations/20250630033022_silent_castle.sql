/*
  # Add missing profile columns

  1. New Columns
    - `user_email` (text) - User's email address
    - `user_name` (text) - User's display name  
    - `user_bio` (text) - User's biography
    - `user_website` (text) - User's website URL
    - `user_twitter` (text) - User's Twitter username
    - `user_linkedin` (text) - User's LinkedIn username
    - `user_github` (text) - User's GitHub username

  2. Changes
    - Add all missing columns to profiles table
    - All columns are nullable to maintain compatibility
*/

-- Add missing columns to profiles table
DO $$
BEGIN
  -- Add user_email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_email text;
  END IF;

  -- Add user_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_name text;
  END IF;

  -- Add user_bio column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_bio text;
  END IF;

  -- Add user_website column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_website'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_website text;
  END IF;

  -- Add user_twitter column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_twitter'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_twitter text;
  END IF;

  -- Add user_linkedin column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_linkedin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_linkedin text;
  END IF;

  -- Add user_github column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_github'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_github text;
  END IF;
END $$;