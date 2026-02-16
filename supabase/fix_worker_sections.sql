-- Update existing workers to have correct section_id and site_id
-- This fixes workers that were imported before the section/site assignment was working

-- Update workers' section_id and site_id based on their contractor's floor
UPDATE workers w
SET 
    section_id = f.section_id,
    site_id = s.site_id
FROM contractors c
JOIN floors f ON c.floor_id = f.id
JOIN sections s ON f.section_id = s.id
WHERE w.company_id = c.company_id
  AND (w.section_id IS NULL OR w.site_id IS NULL);

-- Verify the update
SELECT 
    w.id,
    w.name,
    w.worker_code,
    w.section_id,
    w.site_id,
    s.name as section_name,
    si.name as site_name
FROM workers w
LEFT JOIN sections s ON w.section_id = s.id
LEFT JOIN sites si ON w.site_id = si.id
ORDER BY w.created_at DESC
LIMIT 20;
