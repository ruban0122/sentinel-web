# Contractors Company Scoping - Implementation

## Overview
Contractors are now properly scoped to companies. Users can only see and manage contractors belonging to their own company.

## Database Changes Required

### ⚠️ **IMPORTANT: Run This SQL First**

You need to add the `company_id` field to the `contractors` table. Run this SQL in your Supabase SQL Editor:

```sql
-- Add company_id to contractors table
ALTER TABLE public.contractors 
ADD COLUMN company_id text REFERENCES public.companies(id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS contractors_company_id_idx 
ON public.contractors(company_id);

-- Enable RLS on contractors table
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view contractors in their company"
ON public.contractors
FOR SELECT
TO authenticated
USING (
    company_id = (
        SELECT company_id 
        FROM public.users 
        WHERE uid = auth.uid()
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
        WHERE uid = auth.uid()
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
        WHERE uid = auth.uid()
    )
)
WITH CHECK (
    company_id = (
        SELECT company_id 
        FROM public.users 
        WHERE uid = auth.uid()
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
        WHERE uid = auth.uid()
    )
);
```

**Location**: `supabase/add_company_id_to_contractors.sql`

## Changes Made

### ✅ **1. Contractors List Page** (`/settings/contractors/page.tsx`)

**Before:**
```tsx
.from('contractors')
.select('*')  // ❌ Shows ALL contractors
```

**After:**
```tsx
.from('contractors')
.select('*')
.eq('company_id', companyId)  // ✅ Only user's company
```

### ✅ **2. Add Contractor Page** (`/settings/contractors/add/page.tsx`)

**Before:**
```tsx
.insert({
    name: formData.name,
    // ❌ No company_id
})
```

**After:**
```tsx
.insert({
    name: formData.name,
    company_id: companyId,  // ✅ User's company
})
```

### ✅ **3. Floor Assignment Page** (`/settings/contractors/[id]/assign-floor/page.tsx`)

**Before:**
```tsx
.from('sites')
.select('...')  // ❌ Shows ALL sites
```

**After:**
```tsx
.from('sites')
.select('...')
.eq('company_id', companyId)  // ✅ Only user's company sites
```

Also verifies that the contractor being assigned belongs to the user's company.

### ✅ **4. Sites Filter**

Sites dropdown in contractors page also filtered by company:
```tsx
.from('sites')
.select('id, name')
.eq('company_id', companyId)  // ✅ Only user's company sites
```

## Security Model

### 🔒 **Company-Scoped Access**

- Users can ONLY see contractors in their company
- Users can ONLY create contractors for their company
- Users can ONLY edit/delete contractors in their company
- Cross-company access is blocked

### 🔒 **Row Level Security (RLS)**

RLS policies enforce company scoping at database level:
1. **SELECT**: Only contractors in user's company
2. **INSERT**: Must be user's company_id
3. **UPDATE**: Only contractors in user's company
4. **DELETE**: Only contractors in user's company

### 🔒 **Access Denied Handling**

If user has no company_id:
```tsx
<div>
    <h1>Access Denied</h1>
    <p>Your account is not associated with a company.</p>
</div>
```

## Data Flow

### **Creating a Contractor**

1. User fills form (name, company_worker_code)
2. System gets user's `company_id`
3. Contractor created with:
   - `id`: Generated UUID
   - `name`: From form
   - `company_worker_code`: From form
   - `company_id`: User's company
   - `floor_id`: null (assigned later)
   - `created_at`: Current timestamp

### **Viewing Contractors**

1. System gets user's `company_id`
2. Query: `SELECT * FROM contractors WHERE company_id = user_company_id`
3. Only user's company contractors are returned
4. RLS enforces this at database level

### **Assigning Floors**

When assigning contractors to floors:
- Only floors from sites in user's company are shown
- Contractor can only be assigned to floors in same company
- Cross-company floor assignment is prevented

## Database Schema

### **Before (Missing company_id)**
```sql
contractors
├─ id: text (primary key)
├─ name: text
├─ company_worker_code: text
├─ floor_id: text (nullable)
└─ created_at: timestamp
```

### **After (With company_id)**
```sql
contractors
├─ id: text (primary key)
├─ name: text
├─ company_worker_code: text
├─ company_id: text ← NEW FIELD
├─ floor_id: text (nullable)
└─ created_at: timestamp
```

## Relationships

### **Company → Contractors → Floors**

```
Company
  └─ company_id ─→ Contractors
                     └─ floor_id ─→ Floors
                                     └─ section_id ─→ Sections
                                                       └─ site_id ─→ Sites
```

### **Data Consistency**

- Contractor's `company_id` must match their assigned floor's site's company
- When assigning floor, system only shows floors from sites in same company
- Prevents cross-company data mixing

## Migration Notes

### **Existing Contractors**

If you have existing contractors in the database without `company_id`:

```sql
-- Option 1: Assign to a default company
UPDATE public.contractors 
SET company_id = 'DEFAULT_COMPANY_ID_HERE' 
WHERE company_id IS NULL;

-- Option 2: Delete orphaned contractors
DELETE FROM public.contractors 
WHERE company_id IS NULL;

-- Option 3: Assign based on floor's site's company
UPDATE public.contractors c
SET company_id = (
    SELECT s.company_id 
    FROM floors f
    JOIN sections sec ON f.section_id = sec.id
    JOIN sites s ON sec.site_id = s.id
    WHERE f.id = c.floor_id
)
WHERE c.company_id IS NULL 
AND c.floor_id IS NOT NULL;
```

## Testing Checklist

### **Test with Company A User:**
- [ ] Login as Company A user
- [ ] Navigate to Settings → Contractors
- [ ] Verify only Company A contractors are shown
- [ ] Create new contractor
- [ ] Verify contractor has Company A's company_id
- [ ] Assign contractor to floor
- [ ] Verify only Company A sites/floors are shown

### **Test with Company B User:**
- [ ] Login as Company B user
- [ ] Navigate to Settings → Contractors
- [ ] Verify CANNOT see Company A contractors
- [ ] Verify can ONLY see Company B contractors
- [ ] Create contractor
- [ ] Verify contractor has Company B's company_id

### **Test without Company:**
- [ ] Login as user with no company_id
- [ ] Navigate to Settings → Contractors
- [ ] Verify "Access Denied" message appears
- [ ] Verify no contractors are shown

## Files Modified

1. ✅ `/settings/contractors/page.tsx` - Added company filtering
2. ✅ `/settings/contractors/add/page.tsx` - Added company_id to insert
3. ✅ `supabase/add_company_id_to_contractors.sql` - Database migration

## Comparison with Other Features

| Feature | Access Model | Scoping |
|---------|-------------|---------|
| **Companies** | 🔓 Open | All users see all |
| **Contractors** | 🔒 Scoped | Only your company |
| **Sites** | 🔒 Scoped | Only your company |
| **Workers** | 🔒 Scoped | Only your company |
| **Attendance** | 🔒 Scoped | Only your company |
| **Incidents** | 🔒 Scoped | Only your company |
| **Complaints** | 🔒 Scoped | Only your company |

## Security Benefits

### ✅ **Data Isolation**
- Contractors properly isolated by company
- No cross-company data leaks
- Enforced at query and database level

### ✅ **Access Control**
- Users without company_id are blocked
- Clear error messages
- No partial data exposure

### ✅ **Consistent Protection**
- Same pattern as other company-scoped features
- Easy to audit
- Easy to maintain

## Future Enhancements

### 🔮 **Potential Features**

1. **Contractor Statistics** (per company)
2. **Contractor Performance Tracking**
3. **Contractor Certification Management**
4. **Contractor Contact Information**
5. **Contractor Document Storage**
6. **Contractor Work History**

---

**Status**: ✅ Ready to use after running SQL migration
**Security**: 🔒 Fully secured with company scoping and RLS
**Access Model**: Company-scoped (users see only their company's contractors)
**Consistency**: Matches other company-scoped features
