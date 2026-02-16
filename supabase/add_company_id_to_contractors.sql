-- Add company_id to contractors table for company scoping

-- Add the company_id column
ALTER TABLE public.contractors 
ADD COLUMN company_id text REFERENCES public.companies(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS contractors_company_id_idx 
ON public.contractors(company_id);

-- Update existing contractors (optional - assign to a default company)
-- If you want to assign existing contractors to a specific company, uncomment and modify:
-- UPDATE public.contractors 
-- SET company_id = 'YOUR_COMPANY_ID_HERE' 
-- WHERE company_id IS NULL;

-- Add RLS policies for contractors
CREATE POLICY "Users can view contractors in their company"
ON public.contractors
FOR SELECT
TO authenticated
USING (
    company_id = (
        SELECT company_id 
        FROM public.users 
        WHERE uid = auth.uid()::text
    )
);

CREATE POLICY "Users can create contractors in their company"
ON public.contractors
FOR INSERT
TO authenticated
WITH CHECK (
    company_id = (
        SELECT company_id 
        FROM public.users 
        WHERE uid = auth.uid()::text
    )
);

CREATE POLICY "Users can update contractors in their company"
ON public.contractors
FOR UPDATE
TO authenticated
USING (
    company_id = (
        SELECT company_id 
        FROM public.users 
        WHERE uid = auth.uid()::text
    )
)
WITH CHECK (
    company_id = (
        SELECT company_id 
        FROM public.users 
        WHERE uid = auth.uid()::text
    )
);

CREATE POLICY "Users can delete contractors in their company"
ON public.contractors
FOR DELETE
TO authenticated
USING (
    company_id = (
        SELECT company_id 
        FROM public.users 
        WHERE uid = auth.uid()::text
    )
);

-- Enable RLS on contractors table
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;
