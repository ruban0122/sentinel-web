-- Check floor and section relationships
-- Run this to see what data exists for your contractor's floor

SELECT 
    f.id as floor_id,
    f.name as floor_name,
    f.floor_code,
    f.section_id,
    s.id as section_id_from_join,
    s.name as section_name,
    s.site_id,
    si.name as site_name
FROM floors f
LEFT JOIN sections s ON f.section_id = s.id
LEFT JOIN sites si ON s.site_id = si.id
WHERE f.id IN (
    SELECT floor_id FROM contractors WHERE company_id = 'YOUR_COMPANY_ID'
);

-- Replace 'YOUR_COMPANY_ID' with your actual company ID
-- This will show you if the floors have section_id set correctly
