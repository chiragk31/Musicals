-- Fix security issue: Restrict profiles table access to authenticated users only
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a new policy that only allows authenticated users to view profiles
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Note: This still allows authenticated users to see all profiles, which is needed
-- for the app to display usernames of song uploaders. If you want to restrict this
-- further to only allow users to see their own profile, use:
-- USING (auth.uid() = id)