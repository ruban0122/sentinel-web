-- RLS Policies for Workers Table
-- This allows authenticated users to manage workers in their company

-- Enable RLS on workers table
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to SELECT workers in their company
CREATE POLICY "Users can view workers in their company"
ON public.workers
FOR SELECT
TO authenticated
USING (
    company_id IN (
        SELECT company_id 
        FROM public.users 
        WHERE uid = auth.uid()::text
    )
);

-- Policy 2: Allow authenticated users to INSERT workers in their company
CREATE POLICY "Users can create workers in their company"
ON public.workers
FOR INSERT
TO authenticated
WITH CHECK (
    company_id IN (
        SELECT company_id 
        FROM public.users 
        WHERE uid = auth.uid()::text
    )
);

-- Policy 3: Allow authenticated users to UPDATE workers in their company
CREATE POLICY "Users can update workers in their company"
ON public.workers
FOR UPDATE
TO authenticated
USING (
    company_id IN (
        SELECT company_id 
        FROM public.users 
        WHERE uid = auth.uid()::text
    )
)
WITH CHECK (
    company_id IN (
        SELECT company_id 
        FROM public.users 
        WHERE uid = auth.uid()::text
    )
);

-- Policy 4: Allow authenticated users to DELETE workers in their company
CREATE POLICY "Users can delete workers in their company"
ON public.workers
FOR DELETE
TO authenticated
USING (
    company_id IN (
        SELECT company_id 
        FROM public.users 
        WHERE uid = auth.uid()::text
    )
);

-- Note: These policies ensure that users can only manage workers within their own company
-- The company_id is automatically scoped based on the authenticated user's company
