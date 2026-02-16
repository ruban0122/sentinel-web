# Company Management Feature

## Overview
Complete company management system allowing **any authenticated user** to view and manage **all companies** in the system.

## Access Model

### 🔓 **Open Access for All Authenticated Users**

- **View**: Any logged-in user can see ALL companies
- **Create**: Any logged-in user can create companies
- **Edit**: Any logged-in user can edit ANY company
- **Delete**: Any logged-in user can delete ANY company

### 📝 **Audit Trail**

- `created_by` field tracks which user created each company
- Used for audit purposes only, not access control
- All users can still manage all companies

## Database Changes Required

### ⚠️ **IMPORTANT: Run This SQL First**

You need to add the `created_by` field to the `companies` table. Run this SQL in your Supabase SQL Editor:

```sql
-- Add created_by field to companies table
ALTER TABLE public.companies 
ADD COLUMN created_by uuid REFERENCES auth.users(id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS companies_created_by_idx 
ON public.companies(created_by);

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
```

**Location**: `supabase/add_created_by_to_companies.sql`

## Features

### 📋 **Companies List Page** (`/settings/companies`)

- **Displays**: ALL companies in the system
- **Shows**:
  - Company name
  - Address
  - Creation date
  - Edit and delete buttons
- **Features**:
  - Inline editing
  - Delete with confirmation
  - Empty state with "Add Company" button
- **Access**: Any authenticated user can view all companies

### ➕ **Add Company Page** (`/settings/companies/add`)

- **Form Fields**:
  - Company Name (required)
  - Address (optional, textarea)
- **Validation**:
  - Company name is required
  - User must be logged in
- **On Submit**:
  - Creates company with `created_by = user.id` (for audit)
  - Redirects to companies list
- **Design**: Professional form with icon, descriptions, and clear layout

### ✏️ **Edit Company** (Inline)

- Click edit icon to enable editing
- Modify name and address
- Save or cancel changes
- Updates database immediately
- **Any user can edit any company**

### 🗑️ **Delete Company**

- Click delete icon
- Confirmation dialog warns about associated data
- Deletes company from database
- Removes from list immediately
- **Any user can delete any company**

## Security Model

### ✅ **Authentication Required**

- All operations require logged-in user
- Unauthenticated users are blocked
- Clear error messages

### ✅ **Row Level Security (RLS)**

RLS policies allow ALL authenticated users to:
1. **SELECT**: View all companies
2. **INSERT**: Create new companies
3. **UPDATE**: Edit any company
4. **DELETE**: Delete any company

### 📊 **Audit Trail**

- `created_by` field records who created each company
- Can be used for reporting and auditing
- Does NOT restrict access

## Data Flow

### **Creating a Company**

1. User fills form
2. System gets `user.id` from auth session
3. Company created with:
   - `id`: Generated UUID
   - `name`: From form
   - `address`: From form (optional)
   - `created_by`: Logged-in user's ID (audit only)
   - `created_at`: Current timestamp

### **Viewing Companies**

1. System gets authenticated user
2. Query: `SELECT * FROM companies` (no filtering)
3. ALL companies are returned
4. RLS allows this for authenticated users

### **Editing/Deleting Companies**

1. User clicks edit/delete on ANY company
2. System verifies user is authenticated
3. RLS allows operation
4. Changes applied to database

## UI Components

### **Settings Card**
- Added "Companies" card to `/settings` page
- Icon: Building2
- Links to `/settings/companies`

### **Company List**
- Grid layout with cards
- Each card shows company info
- Inline edit mode
- Delete confirmation
- Shows ALL companies

### **Add Company Form**
- Clean, professional design
- Icon header
- Field descriptions
- Validation feedback
- Loading states

## Files Created

1. ✅ `/settings/companies/page.tsx` - Main companies list page
2. ✅ `/settings/companies/company-list.tsx` - Company list component
3. ✅ `/settings/companies/add/page.tsx` - Add company form
4. ✅ `/settings/page.tsx` - Updated with Companies card
5. ✅ `supabase/add_created_by_to_companies.sql` - Database migration

## Usage Flow

1. **User logs in**
2. **Goes to Settings** → Clicks "Companies"
3. **Sees ALL companies** in the system
4. **Can edit ANY company** (inline editing)
5. **Can delete ANY company** (with confirmation)
6. **Clicks "Add Company"**
7. **Fills form** (name + optional address)
8. **Submits** → Company created with their user ID for audit
9. **Returns to list** → New company appears

## Example Data

### **Database Schema**
```sql
companies
├─ id: uuid (primary key)
├─ name: text
├─ address: text (nullable)
├─ created_by: uuid (references auth.users.id) ← For audit
└─ created_at: timestamp
```

### **Sample Records**
```sql
-- Company created by User A
id: "company-1"
name: "ABC Construction"
address: "123 Main St"
created_by: "user-a-uuid"  ← Audit trail
created_at: "2024-01-01"

-- Company created by User B
id: "company-2"
name: "XYZ Engineering"
address: "456 Oak Ave"
created_by: "user-b-uuid"  ← Audit trail
created_at: "2024-01-02"

-- Both User A and User B can view/edit/delete BOTH companies
```

## Relationship to Other Data

### **Company → Sites → Workers**

```
Company (managed by any user)
  └─ company_id ─→ Sites
                    └─ site_id ─→ Workers
                    └─ site_id ─→ Sections
                                   └─ Floors
```

### **Important Notes:**

1. **Deleting a company** may affect:
   - Sites (have `company_id`)
   - Workers (have `company_id`)
   - Attendance (has `company_id`)
   - Incidents (has `company_id`)
   - Complaints (has `company_id`)

2. **Consider adding CASCADE** or **RESTRICT** rules:
   ```sql
   -- Prevent deletion if company has sites
   ALTER TABLE sites
   ADD CONSTRAINT fk_company
   FOREIGN KEY (company_id) 
   REFERENCES companies(id)
   ON DELETE RESTRICT;
   ```

## Testing Checklist

- [ ] Run SQL migration in Supabase
- [ ] Login as User A
- [ ] Navigate to Settings → Companies
- [ ] Verify you see ALL companies
- [ ] Create a new company
- [ ] Edit ANY company (including ones created by others)
- [ ] Delete a company (with confirmation)
- [ ] Login as User B
- [ ] Verify User B can also see and manage ALL companies
- [ ] Verify `created_by` field is populated correctly

## Comparison: Companies vs Other Features

### **Companies (Open Access)**
- ✅ Any user can view ALL companies
- ✅ Any user can edit ANY company
- ✅ Any user can delete ANY company
- 📝 `created_by` for audit only

### **Sites, Workers, etc. (Company-Scoped)**
- 🔒 Users only see their own company's data
- 🔒 Filtered by `company_id`
- 🔒 Cannot see other companies' data

## Future Enhancements

### 🔮 **Potential Features**

1. **Company Logo Upload**
2. **Company Settings** (timezone, currency, etc.)
3. **Company Statistics** (sites, workers, attendance)
4. **Company Activity Log** (who edited what)
5. **Company Archive** (soft delete instead of hard delete)
6. **Role-Based Access** (if needed in future)
   - Admin: Full access
   - Manager: View only
   - etc.

## Migration Notes

### **Existing Companies**

If you have existing companies in the database:

```sql
-- Option 1: Leave created_by as NULL
-- (Companies created before this feature)

-- Option 2: Set to a default admin user
UPDATE public.companies 
SET created_by = 'ADMIN_USER_UUID_HERE'::uuid 
WHERE created_by IS NULL;
```

---

**Status**: ✅ Ready to use after running SQL migration
**Security**: ✅ Authenticated users only, RLS enforced
**Access Model**: 🔓 Open access for all authenticated users
**Audit**: 📝 Tracks who created each company
