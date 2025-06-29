
-- Create a helper function in the public schema to safely get the Clerk user ID from the JWT claims.
-- This allows us to identify the user based on the token provided by Clerk.
CREATE OR REPLACE FUNCTION public.get_clerk_user_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'sub'
$$;

-- Grant permission for authenticated users to use this new function.
GRANT EXECUTE ON FUNCTION public.get_clerk_user_id() TO authenticated;

-- First, let's drop the old policies that were causing issues.
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;

-- Now, let's create the correct policies using our new helper function.

-- This policy allows users to view their own profile.
CREATE POLICY "Users can view their own profile." ON public.profiles
  FOR SELECT USING (clerk_user_id = public.get_clerk_user_id());

-- This policy allows users to update their own profile.
CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (clerk_user_id = public.get_clerk_user_id()) WITH CHECK (clerk_user_id = public.get_clerk_user_id());

-- This policy allows users to insert their own profile. This was missing before.
CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (clerk_user_id = public.get_clerk_user_id());
