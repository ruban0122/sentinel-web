# Contractors Management Feature

## Overview
Complete CRUD system for managing contractors and assigning them to specific floors.

## Features Created

### 1. **Settings Page Update**
- Added "Contractors" card to `/settings` page
- Links to `/settings/contractors`

### 2. **Contractors List Page** (`/settings/contractors`)
- View all contractors in a clean card layout
- Each contractor card shows:
  - Contractor name
  - Company worker code
  - Assigned floor (if any) with full location path
- Actions available:
  - **Edit**: Inline editing of contractor details
  - **Delete**: Remove contractor (with confirmation)
  - **Assign Floor**: Navigate to floor assignment page

### 3. **Add Contractor Page** (`/settings/contractors/add`)
- Simple form with fields:
  - Contractor Name (required)
  - Company Worker Code (optional)
- Form validation
- Success redirect to contractors list

### 4. **Floor Assignment Page** (`/settings/contractors/[id]/assign-floor`)
- Interactive single floor selection interface
- Features:
  - **Radio-style Selection**: Click floor cards to select (only one at a time)
  - **Organized by Site → Section → Floor**
  - **Accordion Layout**: Expandable sections for easy navigation
  - **Current Selection Display**: Shows selected floor with full path
  - **Clear Button**: Remove current assignment
  - **Save**: Update contractor's floor assignment

## Database Schema

### `contractors` table
```sql
create table public.contractors (
  id text not null,
  company_worker_code text null,
  name text null,
  floor_id text null,
  created_at timestamp with time zone null,
  constraint company_workers_pkey primary key (id),
  constraint company_workers_floor_id_fkey foreign KEY (floor_id) references floors (id)
);
```

**Fields:**
- `id` - Unique identifier (text/UUID)
- `name` - Contractor name
- `company_worker_code` - Optional identifier/code
- `floor_id` - Foreign key to floors table (nullable)
- `created_at` - Timestamp

## User Flow

1. **Navigate to Settings** → Click "Contractors"
2. **View Contractors** → See all contractors with their assigned floors
3. **Add New Contractor**:
   - Click "Add Contractor"
   - Enter name and optional worker code
   - Submit → Returns to list
4. **Edit Contractor**:
   - Click Edit icon
   - Modify name or worker code inline
   - Save or Cancel
5. **Assign Floor**:
   - Click "Assign Floor" button
   - Browse sites/sections
   - Click a floor card to select it
   - Click "Save Assignment"
6. **Delete Contractor**:
   - Click Delete icon
   - Confirm deletion
   - Contractor removed

## UI/UX Highlights

- **Consistent Design**: Matches existing Sites page styling
- **Inline Editing**: No navigation required for quick updates
- **Visual Feedback**: 
  - Selected floor highlighted with primary color
  - Checkmark icon on selected floor
  - Clear display of current assignment
- **Empty States**: Helpful messages when no data exists
- **Responsive Layout**: Grid layout adapts to screen size
- **Icons**: Lucide icons for visual clarity
- **Single Selection**: Radio-button style (only one floor per contractor)

## Technical Implementation

- **Server Components**: Main pages fetch data server-side
- **Client Components**: Interactive lists and forms
- **Type Safety**: Full TypeScript types for all data structures
- **Supabase Integration**: All CRUD operations use Supabase client
- **Router Refresh**: Ensures data stays in sync after mutations
- **Nested Queries**: Fetches floor details with section and site names

## Key Differences from Initial Implementation

✅ **Simplified Schema**: Uses actual database structure  
✅ **Single Floor Assignment**: One contractor = one floor (not multiple)  
✅ **Worker Code Field**: Uses `company_worker_code` instead of contact details  
✅ **Direct Relationship**: `floor_id` on contractors table (not `contractor_id` on floors)  

## Files Created/Updated

1. `/settings/page.tsx` (updated - added Contractors card)
2. `/settings/contractors/page.tsx`
3. `/settings/contractors/contractor-list.tsx`
4. `/settings/contractors/add/page.tsx`
5. `/settings/contractors/[id]/assign-floor/page.tsx`
6. `/settings/contractors/[id]/assign-floor/floor-assignment.tsx`

---

**Status**: ✅ Complete and connected to actual database schema!
