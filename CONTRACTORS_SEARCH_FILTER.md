# Contractors Search & Filter Feature

## Overview
Added comprehensive search and filtering capabilities to the Contractors Management page.

## Features

### 🔍 **Search Functionality**
- **Real-time search** across contractor names and worker codes
- **Case-insensitive** matching
- **Debounced** URL updates for better performance
- Search icon indicator in the input field

### 🎯 **Filter Options**

1. **Site Filter**
   - Filter contractors by their assigned floor's site
   - Dropdown shows all available sites
   - "All Sites" option to clear filter

2. **Assignment Status Filter**
   - **Assigned**: Show only contractors with a floor assignment
   - **Unassigned**: Show only contractors without a floor assignment
   - **All Status**: Show all contractors (default)

### 🏷️ **Active Filters Display**
- Visual badges showing currently active filters
- Shows:
  - Search query (if any)
  - Selected site name
  - Assignment status
- Easy to see what filters are applied

### 🧹 **Clear Filters**
- **Clear button** appears when any filter is active
- One-click to reset all filters
- Returns to showing all contractors

### 📊 **Results Count**
- Header shows total number of contractors matching filters
- Updates dynamically as filters change
- Example: "(5 contractors)" or "(1 contractor)"

### 💡 **Smart Empty States**
- Different messages based on context:
  - **No filters**: "No contractors yet" + Add button
  - **With filters**: "No contractors found" + suggestion to adjust filters

## User Experience

### **Filter Workflow**
1. Type in search box → Results filter instantly
2. Select a site → Shows only contractors assigned to floors in that site
3. Choose assignment status → Filters by floor assignment
4. Click "Clear" → Reset all filters

### **URL-Based Filtering**
- Filters are stored in URL query parameters
- Shareable URLs with filters applied
- Browser back/forward works correctly
- Bookmarkable filtered views

### **Responsive Design**
- Toolbar adapts to screen size
- Filters wrap on smaller screens
- Mobile-friendly dropdowns

## Technical Implementation

### **Query Parameters**
- `?q=search` - Search query
- `?site=site-id` - Site filter
- `?hasFloor=true|false` - Assignment status

### **Database Queries**
- Server-side filtering for search and assignment status
- Client-side filtering for site (due to nested relationship)
- Optimized queries with proper indexes

### **Components**
- `ContractorToolbar` - Search and filter UI
- `ContractorsPage` - Query building and data fetching
- `ContractorList` - Display with smart empty states

## Example Use Cases

1. **Find specific contractor**: Search by name or code
2. **View contractors at a site**: Filter by site
3. **Find unassigned contractors**: Filter by "Unassigned"
4. **Audit assignments**: Search + filter combination

## Files Modified/Created

1. ✅ `contractor-toolbar.tsx` - New toolbar component
2. ✅ `page.tsx` - Updated with search params and filtering
3. ✅ `contractor-list.tsx` - Updated empty states

---

**Status**: ✅ Search and filter fully functional!
