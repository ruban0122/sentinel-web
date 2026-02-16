-- Add created_by field to companies table to track who created each company

-- Add the created_by column (UUID type to match auth.users.id)
ALTER TABLE public.companies 
ADD COLUMN created_by uuid REFERENCES auth.users(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS companies_created_by_idx 
ON public.companies(created_by);

-- Update existing companies (optional - set to NULL or a specific user)
-- If you want to assign existing companies to a specific user, uncomment and modify:
-- UPDATE public.companies 
-- SET created_by = 'YOUR_USER_UUID_HERE'::uuid 
-- WHERE created_by IS NULL;

-- Enable RLS on companies table
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Add RLS policies - Allow ALL authenticated users to manage ALL companies
CREATE POLICY "Authenticated users can view all companies"
ON public.companies
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update all companies"
ON public.companies
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete all companies"
ON public.companies
FOR DELETE
TO authenticated
USING (true);
