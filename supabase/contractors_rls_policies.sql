-- RLS Policies for Contractors Table
-- Run this in your Supabase SQL Editor

-- First, check if RLS is enabled (it is, based on the error)
-- We need to add policies to allow authenticated users to manage contractors

-- Policy 1: Allow authenticated users to SELECT contractors
CREATE POLICY "Allow authenticated users to select contractors"
ON public.contractors
FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Allow authenticated users to INSERT contractors
CREATE POLICY "Allow authenticated users to insert contractors"
ON public.contractors
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 3: Allow authenticated users to UPDATE contractors
CREATE POLICY "Allow authenticated users to update contractors"
ON public.contractors
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy 4: Allow authenticated users to DELETE contractors
CREATE POLICY "Allow authenticated users to delete contractors"
ON public.contractors
FOR DELETE
TO authenticated
USING (true);

-- If you want to be more restrictive and tie contractors to companies:
-- You would need to add a company_id field and use policies like:
-- USING (company_id = (SELECT company_id FROM auth.users WHERE id = auth.uid()))

-- For now, these policies allow any authenticated user to manage contractors
-- Adjust based on your security requirements
