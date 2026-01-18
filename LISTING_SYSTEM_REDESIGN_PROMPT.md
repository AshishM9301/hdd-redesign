# Listing System Redesign - Implementation Phases

## Overview

This document outlines the phased implementation plan to transform the listing system from authentication-required to allowing anonymous listings while maintaining security and user experience.

---

## Current Setup Analysis

### Current State
- **Listing Creation**: Requires user authentication (protected procedure)
- **Listing Access**: Listing page accessible with authentication
- **Status Flow**: DRAFT → PUBLISHED → RESERVED → SOLD/ARCHIVED
- **User Management**: Listings are tied to `userId` (required field in schema)

### Current Schema Constraints
- `Listing.userId` is required (non-nullable)
- All listing mutations use `protectedProcedure`
- Listing creation creates draft that user must publish
- No reference number system exists

---

## Phase 1: Enable Anonymous Listings with Reference Numbers

### Objective
Allow users to create listings without authentication, generate unique reference numbers, and access listings via reference numbers.

### Requirements

#### 1.1 Database Schema Changes

**File: `prisma/schema.prisma`**

- Make `Listing.userId` nullable: `userId String?`
- Add `referenceNumber` field to `Listing` model:
  ```prisma
  referenceNumber String? @unique
  ```
- Add index for reference number: `@@index([referenceNumber])`
- Keep all other fields as-is

#### 1.2 Reference Number Generation

**Location: `src/lib/utils.ts` or new file `src/lib/listing-utils.ts`**

- Create function `generateReferenceNumber(): string`
- Format: Prefix (e.g., "REF-") + timestamp + random alphanumeric (e.g., "REF-20250116123456-A7B9")
- Ensure uniqueness: Check database before assigning
- Length: Approximately 20-25 characters

#### 1.3 Router Updates

**File: `src/server/api/routers/listing.ts`**

**Create Listing Mutation:**
- Change from `protectedProcedure` to `publicProcedure`
- Make `userId` optional in listing creation
- Generate `referenceNumber` during listing creation
- Set status to `DRAFT` if user not logged in, or allow user choice if logged in
- Return `referenceNumber` in response

**New Query: `getByReference`**
- Input: `referenceNumber: string`
- Procedure: `publicProcedure`
- Return: Full listing details (only PUBLISHED + AVAILABLE for non-owners)
- If user is authenticated and owns listing, show all statuses

#### 1.4 Form Updates

**File: `src/app/sell/list/_components/listing-form.tsx`**

- Remove authentication requirement check
- After successful submission:
  - If not logged in: Display reference number prominently with message
  - Show "Save this reference number" message
  - Optionally show "Login to manage this listing" link

**File: `src/app/sell/list/_components/steps/review-step.tsx`**

- No changes required (will be handled in Phase 3)

#### 1.5 Navigation Updates

**File: `src/app/_components/nav-section.tsx`**

- Update "Go to Listing" link behavior
- Instead of redirecting to `/rent`, create new page `/listings/access`
- OR add input field in navigation dropdown/modal for reference number

**New Page: `src/app/listings/access/page.tsx`**

- Create input field for reference number
- Submit button that redirects to `/listings/[referenceNumber]`
- Display error if reference number not found
- Show helpful message about what reference numbers are

#### 1.6 Listing Detail Page Updates

**File: `src/app/listings/[id]/page.tsx`**

- Support both ID and reference number lookup
- Try to find by ID first, then by reference number
- Display reference number on listing page (if user owns listing)
- Allow access without authentication if listing is PUBLISHED + AVAILABLE

#### 1.7 Testing Checklist
- [ ] Can create listing without login
- [ ] Reference number is generated and unique
- [ ] Can access listing via reference number without login
- [ ] Reference number is displayed to owner
- [ ] Navigation "Go to Listing" works with reference number input

---

## Phase 2: User Listing Management for Authenticated Users

### Objective
Enable logged-in users to view and manage their listings, with enhanced features compared to anonymous listings.

### Requirements

#### 2.1 User Listing Dashboard

**File: `src/app/sell/listings/page.tsx`**

- Keep existing functionality
- Show listings where `userId` matches current user
- Add filter for "All Listings" vs "My Listings" (only show if logged in)
- Display reference numbers in table if available

#### 2.2 Link Anonymous Listing to Account

**New Router Procedure: `linkListingToAccount`**

**File: `src/server/api/routers/listing.ts`**

- Input: `referenceNumber: string`
- Procedure: `protectedProcedure`
- Logic:
  - Find listing by reference number
  - Check if `userId` is null
  - If null, update `userId` to current user's ID
  - If not null, check if already owned by user (return success)
  - If owned by different user, return error
- Return: Updated listing

**New Page or Component: `src/app/sell/listings/link/page.tsx` or modal**

- Input field for reference number
- Submit button to link listing to account
- Display success/error messages
- Redirect to listings page after successful link

#### 2.3 Listing Ownership Verification

**File: `src/server/api/routers/listing.ts`**

- Update `verifyListingOwnership` helper:
  - Check if listing `userId` matches current user OR
  - If listing `userId` is null, allow access if user has linked via reference (future: approval system)
- Update all protected mutations to use this verification

#### 2.4 UI Enhancements

**File: `src/app/listings/[id]/page.tsx`**

- Show "Link to Account" button if:
  - User is logged in
  - Listing `userId` is null
  - Current user doesn't already own this listing
- After linking, show ownership badge
- Hide reference number from public view (only show to owner)

#### 2.5 Testing Checklist
- [ ] Logged-in users can see all their listings
- [ ] Can link anonymous listing to account via reference number
- [ ] Cannot link listing already owned by another user
- [ ] Ownership verification works correctly
- [ ] UI shows appropriate options based on ownership status

---

## Phase 3: Review Step Dialog and Publish Flow

### Objective
Update review step to show confirmation dialog with different flows for authenticated vs anonymous users.

### Requirements

#### 3.1 Review Step Dialog Updates

**File: `src/app/sell/list/_components/steps/review-step.tsx`**

- No direct changes (dialog will be in parent component)

**File: `src/app/sell/list/_components/listing-form.tsx`**

- Update `handleStepSubmit` for final step (review):
  - Before submitting, check if user is authenticated
  - If NOT authenticated:
    - Show AlertDialog:
      - Title: "Are you sure you want to submit?"
      - Message: "Your listing will be created but will need to be published after you log in. Save your reference number to manage your listing later."
      - Actions: "Cancel" | "Submit Listing"
      - On confirm: Create listing as DRAFT
  - If authenticated:
    - Show AlertDialog:
      - Title: "Publish or Save as Draft?"
      - Message: "Would you like to publish this listing now or save it as a draft?"
      - Actions: "Cancel" | "Save as Draft" | "Publish Now"
      - On "Save as Draft": Create listing as DRAFT
      - On "Publish Now": Create listing and immediately publish (create + publish mutation)

#### 3.2 Reference Number Display

**File: `src/app/sell/list/_components/listing-form.tsx`**

- After successful anonymous listing creation:
  - Show success toast with reference number
  - Display modal/page with:
    - Large, copyable reference number
    - "Save this reference number" warning
    - "Login to manage your listing" button/link
    - Link to access listing via reference

#### 3.3 Publish Flow Updates

**File: `src/server/api/routers/listing.ts`**

- Ensure `publish` procedure works for both authenticated and anonymous listings
- For anonymous listings: Require reference number + some verification (future: email verification)

#### 3.4 Testing Checklist
- [ ] Anonymous users see appropriate dialog on review submit
- [ ] Authenticated users see publish/draft choice dialog
- [ ] Reference number is displayed after anonymous listing creation
- [ ] Draft listings can be published later
- [ ] Dialog messages are clear and helpful

---

## Phase 4: Listing Assurance System (Admin Panel)

### Objective
Create admin interface for listing assurance/verification. Add assurance status to listings.

### Requirements

#### 4.1 Database Schema Changes

**File: `prisma/schema.prisma`**

- Add `assured` boolean field to `Listing` model: `assured Boolean @default(false)`
- Add `assuredAt` timestamp: `assuredAt DateTime?`
- Add `assuredBy` user relation (optional): `assuredById String?`, `assuredBy User? @relation(...)`
- Add index: `@@index([assured])`

**Note**: May need to add `role` field to `User` model for admin identification:
```prisma
role String @default("user") // "user" | "admin"
```

#### 4.2 Admin Authentication & Authorization

**File: `src/server/api/trpc.ts`**

- Create `adminProcedure`:
  - Extends `protectedProcedure`
  - Checks if user role is "admin"
  - Throws `FORBIDDEN` if not admin

#### 4.3 Admin Router

**New File: `src/server/api/routers/admin.ts`** (or add to existing router)

- `getAllListings`: Get all listings with filters (status, assured, etc.)
  - Procedure: `adminProcedure`
  - Include pagination
  - Include filters for status, assured status, date range
- `assureListing`: Mark listing as assured
  - Input: `listingId: string`
  - Procedure: `adminProcedure`
  - Set `assured = true`, `assuredAt = now()`, `assuredBy = currentUserId`
- `unassureListing`: Remove assurance from listing
  - Input: `listingId: string`
  - Procedure: `adminProcedure`
  - Set `assured = false`, `assuredAt = null`, `assuredBy = null`

#### 4.4 Admin Pages

**New Page: `src/app/admin/listings/page.tsx`**

- Table/grid view of all listings
- Columns: Reference #, Equipment, Status, Assured, Created, Actions
- Filters:
  - Status filter dropdown
  - Assured filter (All / Assured / Not Assured)
  - Search by reference number or equipment details
- Actions per row:
  - "Assure" / "Unassure" button
  - "View Details" link
  - Status change options (if needed)
- Pagination support

**Layout Protection:**
- Create `src/app/admin/layout.tsx` to protect all `/admin/*` routes
- Check authentication and admin role
- Redirect to login if not authenticated
- Show 403 if authenticated but not admin

#### 4.5 Listing Display Updates

**File: `src/app/listings/[id]/page.tsx`**

- Display "Assured" badge/indicator if `assured === true`
- Show assurance date and admin info (if applicable)

**File: `src/app/buy/page.tsx` (listing browse page)**

- Show assured indicator on listing cards
- Add filter for "Assured Listings Only"
- Sort option: "Assured First"

#### 4.6 Testing Checklist
- [ ] Admin role can be assigned to users
- [ ] Admin can access admin panel
- [ ] Non-admin users cannot access admin panel
- [ ] Admin can see all listings with filters
- [ ] Admin can assure/unassure listings
- [ ] Assured status displays correctly on listing pages
- [ ] Assured filter works on browse page

---

## Phase 4 Enhanced: Listing Assurance System (Admin Panel) - Detailed Implementation

### *objective*
Create a comprehensive admin interface for listing assurance/verification with role-based access control, allowing administrators to verify and mark listings as assured, providing users with trust indicators.

### *context*
Working in a T3 stack application with Next.js 15 App Router, tRPC, Prisma, and Better Auth. The listing system supports both authenticated and anonymous listings. Users model exists but lacks role field. Need to implement admin role system, assurance tracking, admin router procedures, protected admin routes, and UI components for admin management and user-facing assurance indicators.

### *instructions*
1. **Database Schema Updates** (`prisma/schema.prisma`):
   - Add `role` field to `User` model: `role String @default("user")` (values: "user" | "admin")
   - Add to `Listing` model:
     - `assured Boolean @default(false)`
     - `assuredAt DateTime?`
     - `assuredById String?`
     - `assuredBy User? @relation("AssuredListings", fields: [assuredById], references: [id])`
   - Add to `User` model relation: `assuredListings Listing[] @relation("AssuredListings")`
   - Add index: `@@index([assured])` on Listing model
   - Create and run Prisma migration

2. **Admin Procedure** (`src/server/api/trpc.ts`):
   - Create `adminProcedure` that extends `protectedProcedure`
   - Check if `ctx.session.user` exists and has `role === "admin"`
   - Throw `TRPCError` with code `FORBIDDEN` if user is not admin
   - Export the procedure for use in routers

3. **Admin Router** (`src/server/api/routers/admin.ts` - create new file):
   - `getAllListings` query using `adminProcedure`:
     - Input: `{ status?: ListingStatus, assured?: boolean, page?: number, limit?: number, search?: string }`
     - Return paginated listings with all relations (user, contactInfo, mediaAttachments, listingDetails)
     - Support filtering by status, assured status, and search by reference number or equipment details
   - `assureListing` mutation:
     - Input: `{ listingId: string }`
     - Set `assured = true`, `assuredAt = now()`, `assuredById = currentUserId`
     - Return updated listing
   - `unassureListing` mutation:
     - Input: `{ listingId: string }`
     - Set `assured = false`, `assuredAt = null`, `assuredById = null`
     - Return updated listing

4. **Router Registration** (`src/server/api/root.ts`):
   - Import `adminRouter` from `./routers/admin`
   - Add `admin: adminRouter` to `appRouter`

5. **Admin Layout Protection** (`src/app/admin/layout.tsx` - create new file):
   - Server component using `getSession` from better-auth
   - Check if user is authenticated, redirect to `/login` if not
   - Check if user role is "admin", show 403 page if not admin
   - Wrap children with admin-only access

6. **Admin Listings Page** (`src/app/admin/listings/page.tsx` - create new file):
   - Client component using tRPC hooks
   - Table view with columns: Reference #, Equipment (Manufacturer/Model/Year), Status, Assured badge, Created date, Actions
   - Filters: Status dropdown, Assured filter (All/Assured/Not Assured), Search input for reference or equipment
   - Action buttons per row: "Assure"/"Unassure" toggle button, "View Details" link to `/listings/[id]`
   - Pagination controls at bottom
   - Loading states with skeletons
   - Error handling with toast notifications

7. **Listing Display Updates** (`src/app/listings/[id]/page.tsx`):
   - Display "Assured" badge next to status badge if `listing.assured === true`
   - Show assurance date and admin name if available (from `assuredBy` relation)
   - Use Badge component with distinct styling for assured indicator

8. **Buy Page Updates** (`src/app/buy/page.tsx` and `src/app/buy/_components/buy-filters.tsx`):
   - Add assured indicator to `ListingCard` component display
   - Add "Assured Listings Only" filter checkbox/switch in filters
   - Add sort option "Assured First" in sort dropdown
   - Pass assured filter to `getAvailable` query in listing router

9. **Listing Router Updates** (`src/server/api/routers/listing.ts`):
   - Update `getAvailable` query to accept `assured?: boolean` filter
   - Apply assured filter in where clause if provided
   - Support assured sorting in orderBy when requested

10. **ListingCard Component** (`src/app/_components/listing-card.tsx` - check and update):
    - Display small assured badge/icon if listing is assured
    - Position badge prominently but not obtrusively

### *verification*
- Admin role can be assigned to users in database
- Admin can access `/admin/listings` page
- Non-admin authenticated users see 403 when accessing admin routes
- Non-authenticated users redirect to login from admin routes
- Admin can see all listings with proper pagination
- Filters work: status, assured status, search
- Admin can assure listing (sets assured=true, assuredAt, assuredById)
- Admin can unassure listing (clears assurance fields)
- Assured badge displays on listing detail page when assured=true
- Assured indicator shows on listing cards in buy page
- Assured filter works on buy page (only shows assured listings when enabled)
- Assured sorting works (assured listings appear first)
- All mutations show toast notifications on success/error

### *preferences*
- Use Shadcn UI components throughout (Table, Badge, Button, etc.)
- Use tRPC for all API calls (no Next.js actions)
- Follow existing code patterns and TypeScript conventions
- Implement loading states and error handling
- Use toast notifications for user feedback
- Ensure responsive design for admin table

---

## Phase 5: Listing Connection Approval System

### Objective
Implement approval workflow for linking anonymous listings to user accounts when user claims ownership.

### Requirements

#### 5.1 Database Schema Changes

**File: `prisma/schema.prisma`**

- Create new model `ListingConnectionRequest`:
```prisma
model ListingConnectionRequest {
  id            String   @id @default(cuid())
  listingId     String
  listing       Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  status        String   @default("PENDING") // "PENDING" | "APPROVED" | "REJECTED"
  proofDocument String?  // URL to uploaded proof document
  proofNotes    String?
  reviewedBy    String?  // Admin user ID
  reviewedAt    DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([listingId, userId])
  @@index([status])
  @@index([userId])
}
```

- Add relation to `Listing` model: `connectionRequests ListingConnectionRequest[]`
- Add relation to `User` model: `listingConnectionRequests ListingConnectionRequest[]`

#### 5.2 Router Updates

**File: `src/server/api/routers/listing.ts`**

- Update `linkListingToAccount`:
  - Instead of directly linking, create `ListingConnectionRequest` with status "PENDING"
  - Require proof document upload (optional but recommended)
  - Return request ID

**New Procedures:**
- `requestListingConnection`:
  - Input: `referenceNumber: string`, `proofDocument?: string`, `proofNotes?: string`
  - Procedure: `protectedProcedure`
  - Create connection request
- `getMyConnectionRequests`:
  - Procedure: `protectedProcedure`
  - Return user's pending/approved/rejected requests
- `cancelConnectionRequest`:
  - Input: `requestId: string`
  - Procedure: `protectedProcedure`
  - Delete request if status is PENDING

**File: `src/server/api/routers/admin.ts`**

- `getConnectionRequests`:
  - Procedure: `adminProcedure`
  - Return all pending requests with listing and user info
- `approveConnectionRequest`:
  - Input: `requestId: string`
  - Procedure: `adminProcedure`
  - Update listing `userId`
  - Set request status to "APPROVED"
  - Set `reviewedBy` and `reviewedAt`
- `rejectConnectionRequest`:
  - Input: `requestId: string`, `reason?: string`
  - Procedure: `adminProcedure`
  - Set request status to "REJECTED"
  - Set `reviewedBy`, `reviewedAt`, and optional reason

#### 5.3 UI Components

**New Page: `src/app/sell/listings/connect/page.tsx`**

- Form to request listing connection:
  - Reference number input
  - Proof document upload (use existing image upload component)
  - Notes textarea (optional)
  - Submit button
  - Show existing requests status

**File: `src/app/listings/[id]/page.tsx`**

- If listing `userId` is null and user is logged in:
  - Show "Claim This Listing" button instead of direct link
  - On click, redirect to connection request page with pre-filled reference

**New Page: `src/app/admin/connections/page.tsx`**

- List all pending connection requests
- Show: Reference #, Equipment, Requested By, Proof Document, Request Date
- Actions: "Approve" / "Reject" buttons
- Modal/dialog for rejection reason input

**File: `src/app/sell/listings/page.tsx`**

- Show pending connection requests section
- Display status of requests
- Show approved listings (now linked to account)

#### 5.4 Proof Document Storage

- Use existing storage system (`src/lib/storage`)
- Store proof documents in separate folder: `listings/connection-proofs/[requestId]`
- Support images and PDFs
- Limit file size and validate file types

#### 5.5 Testing Checklist
- [ ] Users can create connection requests
- [ ] Proof documents can be uploaded
- [ ] Admins can see all pending requests
- [ ] Admins can approve/reject requests
- [ ] Approved requests link listing to user account
- [ ] Users can see request status
- [ ] Listing page shows appropriate actions based on connection status

---

## Phase 5 Enhanced: Listing Connection Approval System - Detailed Implementation

### *objective*
Implement a comprehensive approval workflow system for linking anonymous listings to user accounts when users claim ownership, requiring admin review with proof document support, status tracking, and user-facing request management.

### *context*
Working in a T3 stack application with Next.js 15 App Router, tRPC, Prisma, and Better Auth. The listing system supports both authenticated and anonymous listings via reference numbers. Currently `linkListingToAccount` directly links listings to accounts. Need to replace this with an approval workflow where users submit connection requests with optional proof documents, admins review and approve/reject them, and approved requests automatically link the listing to the user account. Storage system exists at `src/lib/storage` with file upload support. Admin router and procedures already exist.

### *instructions*
1. **Database Schema Updates** (`prisma/schema.prisma`):
   - Create new model `ListingConnectionRequest` with fields:
     - `id String @id @default(cuid())`
     - `listingId String` with relation to `Listing` (onDelete: Cascade)
     - `userId String` with relation to `User` (onDelete: Cascade)
     - `status String @default("PENDING")` (values: "PENDING" | "APPROVED" | "REJECTED")
     - `proofDocument String?` (URL to uploaded proof document)
     - `proofNotes String?` (optional notes from user)
     - `rejectionReason String?` (optional reason for rejection from admin)
     - `reviewedBy String?` (Admin user ID)
     - `reviewedAt DateTime?`
     - `createdAt DateTime @default(now())`
     - `updatedAt DateTime @updatedAt`
   - Add `@@unique([listingId, userId])` to prevent duplicate requests
   - Add indexes: `@@index([status])` and `@@index([userId])`
   - Add relation to `Listing` model: `connectionRequests ListingConnectionRequest[]`
   - Add relation to `User` model: `listingConnectionRequests ListingConnectionRequest[]`
   - Create and run Prisma migration

2. **Listing Router Updates** (`src/server/api/routers/listing.ts`):
   - **Update `linkListingToAccount`** procedure:
     - Change to create `ListingConnectionRequest` with status "PENDING" instead of directly linking
     - Check if listing exists and `userId` is null
     - Check if request already exists (by listingId + userId unique constraint)
     - If request exists, return existing request
     - Create new request with `proofDocument` and `proofNotes` if provided
     - Return request ID and status
   - **New procedure `requestListingConnection`** (protectedProcedure):
     - Input: `{ referenceNumber: string, proofDocument?: string, proofNotes?: string }`
     - Find listing by reference number
     - Verify listing `userId` is null
     - Check for existing request, return if exists
     - Create `ListingConnectionRequest` with status "PENDING"
     - Return created request with relations (listing, user)
   - **New procedure `getMyConnectionRequests`** (protectedProcedure):
     - No input required
     - Return all user's connection requests (all statuses) with listing info
     - Include: id, status, listing (with equipment details), proofDocument, proofNotes, rejectionReason, createdAt, reviewedAt
     - Order by createdAt desc
   - **New procedure `cancelConnectionRequest`** (protectedProcedure):
     - Input: `{ requestId: string }`
     - Verify request belongs to current user
     - Check if status is "PENDING" (only allow canceling pending requests)
     - Delete request if valid
     - Return success message

3. **Admin Router Updates** (`src/server/api/routers/admin.ts`):
   - **New procedure `getConnectionRequests`** (adminProcedure):
     - Input: `{ status?: "PENDING" | "APPROVED" | "REJECTED", page?: number, limit?: number }` (default page=1, limit=20)
     - Return paginated connection requests with:
       - Full listing details (referenceNumber, manufacturer, model, year, equipment info)
       - User details (id, name, email)
       - Request details (status, proofDocument, proofNotes, rejectionReason, createdAt, reviewedAt, reviewedBy)
     - Filter by status if provided, default to all
     - Order by createdAt desc
     - Include pagination info (total, page, limit, totalPages)
   - **New procedure `approveConnectionRequest`** (adminProcedure):
     - Input: `{ requestId: string }`
     - Find request with listing and user relations
     - Verify request status is "PENDING"
     - Verify listing `userId` is still null (no concurrent approval)
     - Update listing `userId` to request's `userId`
     - Set request status to "APPROVED"
     - Set `reviewedBy` to current admin userId
     - Set `reviewedAt` to now()
     - Return updated request with all relations
   - **New procedure `rejectConnectionRequest`** (adminProcedure):
     - Input: `{ requestId: string, rejectionReason?: string }`
     - Find request with listing relation
     - Verify request status is "PENDING"
     - Set request status to "REJECTED"
     - Set `reviewedBy` to current admin userId
     - Set `reviewedAt` to now()
     - Set `rejectionReason` if provided
     - Return updated request with all relations

4. **Proof Document Upload** (`src/server/api/routers/listing.ts` in `requestListingConnection`):
   - Accept `proofDocument` as base64 encoded file (same format as media uploads)
   - Support file types: images (jpg, png, webp) and PDFs
   - Max file size: 10MB
   - Validate file type and size before upload
   - Use storage system: `StorageFactory.getProvider()` and `generateStoragePath("listings/connection-proofs", fileName, requestId)`
   - Upload file after creating request (use request ID in path)
   - Store returned URL in `proofDocument` field
   - Handle upload errors gracefully with rollback

5. **Connection Request Page** (`src/app/sell/listings/connect/page.tsx` - create new file):
   - Client component using tRPC hooks
   - Form with:
     - Reference number input (required)
     - File upload for proof document (optional, but recommended with clear label)
     - Textarea for proof notes (optional)
     - Submit button with loading state
   - Display existing requests status below form:
     - Table/cards showing: Reference #, Equipment, Status badge, Request Date, Actions (cancel if pending)
   - Show toast notifications on success/error
   - Redirect to listings page after successful submission
   - Handle URL search params: `?ref=REF-xxx` to pre-fill reference number

6. **Listing Detail Page Updates** (`src/app/listings/[id]/page.tsx`):
   - Check if listing `userId` is null and user is authenticated
   - Show "Claim This Listing" button instead of "Link to Account" if no existing request
   - Check for existing connection request status:
     - If PENDING: Show "Request Pending" badge with cancel option
     - If APPROVED: Listing is already linked (shouldn't show button)
     - If REJECTED: Show "Request Rejected" message with reason (if provided), allow new request
   - On "Claim This Listing" click, redirect to `/sell/listings/connect?ref={referenceNumber}`

7. **Admin Connections Page** (`src/app/admin/connections/page.tsx` - create new file):
   - Client component using tRPC hooks
   - Table view with columns:
     - Reference # (link to listing)
     - Equipment (Manufacturer/Model/Year)
     - Requested By (user name and email)
     - Proof Document (view/download link if exists)
     - Request Date
     - Status badge (PENDING/APPROVED/REJECTED)
     - Actions (Approve/Reject buttons for pending requests)
   - Status filter dropdown (All/Pending/Approved/Rejected)
   - Pagination controls
   - Reject dialog/modal:
     - Triggered by "Reject" button
     - Optional textarea for rejection reason
     - Confirm and Cancel buttons
   - Approve confirmation (optional AlertDialog)
   - Loading states with skeletons
   - Error handling with toast notifications
   - Show toast on approve/reject success

8. **User Listings Page Updates** (`src/app/sell/listings/page.tsx`):
   - Add section above listings table: "Pending Connection Requests"
   - Display pending requests in cards or table:
     - Reference #, Equipment info, Request date, Status badge
     - "Cancel Request" button for pending requests
   - Show approved requests that are now linked to account (normal listing display)
   - Show rejected requests with rejection reason if available

9. **Storage Path Updates** (`src/lib/storage/utils.ts` or wherever `generateStoragePath` is):
   - Ensure `generateStoragePath` supports subfolder pattern for connection proofs
   - Path format: `listings/connection-proofs/{requestId}/{fileName}`

10. **Type Definitions** (if needed in `src/types`):
    - Create `ConnectionRequestStatus` type: `"PENDING" | "APPROVED" | "REJECTED"`
    - Ensure tRPC router types are properly exported

### *verification*
- Database migration runs successfully with new `ListingConnectionRequest` model
- Users can create connection requests via `/sell/listings/connect` page
- Reference number input works and validates listing exists
- Proof document upload works (images and PDFs)
- File size and type validation works (rejects >10MB or invalid types)
- Users can see their connection requests with all statuses
- Users can cancel pending requests
- Admins can access `/admin/connections` page
- Admin table shows all connection requests with proper filters
- Admin can filter by status (PENDING/APPROVED/REJECTED)
- Admin can approve request (links listing to user, updates status, sets reviewedBy/reviewedAt)
- Admin can reject request (updates status, sets reviewedBy/reviewedAt, optional reason)
- Rejection reason displays to user in listings page
- Approved requests automatically link listing to user account (listing.userId updated)
- Listing detail page shows "Claim This Listing" for anonymous listings when logged in
- Listing detail page shows request status (PENDING/APPROVED/REJECTED) appropriately
- Cannot create duplicate requests (unique constraint prevents same listingId + userId)
- Cannot approve request if listing already linked to another user
- Pagination works for admin connection requests view
- Toast notifications show on all mutations (success/error)

### *preferences*
- Use Shadcn UI components throughout (Table, Badge, Button, Dialog, AlertDialog, etc.)
- Use tRPC for all API calls (no Next.js actions)
- Follow existing code patterns and TypeScript conventions
- Implement loading states and error handling
- Use toast notifications for user feedback
- Ensure responsive design for admin table
- Store proof documents in `listings/connection-proofs/{requestId}/` folder structure
- Support both image and PDF file types for proof documents
- Use existing storage system (`StorageFactory`, `generateStoragePath`)
- Reuse file upload patterns from existing media upload procedures

---

## Phase 6: Remove Draft Status Requirement (Optional Cleanup)

### Objective
Currently listings are created as DRAFT. Based on requirements, we may want to adjust this behavior.

### Requirements

#### 6.1 Decision Point
- **Option A**: Anonymous listings are always PUBLISHED (with assurance later)
- **Option B**: Anonymous listings are DRAFT and must be published after login
- **Option C**: Allow user choice during review step

**Based on requirements, Option B seems preferred** (create as DRAFT, publish after login).

#### 6.2 Implementation
- Keep current DRAFT status on creation
- Update messaging to clarify that listings need to be published
- Ensure publish workflow is smooth for both authenticated and anonymous listings

#### 6.3 Testing Checklist
- [ ] Anonymous listings created as DRAFT
- [ ] Authenticated users can choose publish/draft
- [ ] Draft listings can be published later
- [ ] Messaging is clear about draft status

---

## Phase 6 Enhanced: Draft Status Management and Publish Workflow - Detailed Implementation

### *objective*
Implement and refine the draft status management system for listings, ensuring clear messaging about draft status, smooth publish workflow for both authenticated and anonymous listings, and allowing authenticated users to choose between publishing immediately or saving as draft during the review step.

### *context*
Working in a T3 stack application with Next.js 15 App Router, tRPC, Prisma, and Better Auth. The listing system supports both authenticated and anonymous listings via reference numbers. Currently listings are always created with DRAFT status (see line 673 in `src/server/api/routers/listing.ts`). The publish procedure exists and works for authenticated users (`protectedProcedure`). Need to implement review step dialogs (Phase 3 requirement), allow status choice for authenticated users during creation, ensure clear messaging about draft status, and make the publish workflow smooth for both authenticated and anonymous listings. Listing form is in `src/app/sell/list/_components/listing-form.tsx` and review step is in `src/app/sell/list/_components/steps/review-step.tsx`.

### *instructions*
1. **Listing Router Updates** (`src/server/api/routers/listing.ts`):
   - Update `create` mutation to accept optional `status?: ListingStatus` input parameter
   - If `status` is provided and user is authenticated, use provided status (validate it can be DRAFT or PUBLISHED only)
   - If `status` is not provided or user is anonymous, default to `ListingStatus.DRAFT`
   - Keep existing validation and reference number generation logic
   - Ensure `availabilityStatus` is set correctly: AVAILABLE if PUBLISHED, UNAVAILABLE if DRAFT

2. **Create Listing Schema Update** (`src/server/api/routers/listing.ts`):
   - Add optional `status` field to `createListingSchema` (if not already exists)
   - Validate status can only be "DRAFT" or "PUBLISHED" if provided
   - Only authenticated users can provide PUBLISHED status

3. **Listing Form Updates** (`src/app/sell/list/_components/listing-form.tsx`):
   - In the form submission handler for final step (review), before submitting:
     - Check if user is authenticated using `useAuth()` hook
     - If NOT authenticated:
       - Show AlertDialog with:
         - Title: "Create Listing as Draft?"
         - Description: "Your listing will be created as a draft. After logging in, you can publish it to make it visible to buyers. Save your reference number to manage your listing later."
         - Actions: "Cancel" | "Create Draft Listing"
         - On confirm: Call `create` mutation with no status (defaults to DRAFT)
     - If authenticated:
       - Show AlertDialog with:
         - Title: "Publish or Save as Draft?"
         - Description: "Would you like to publish this listing now (visible to all buyers) or save it as a draft to publish later?"
         - Actions: "Cancel" | "Save as Draft" | "Publish Now"
         - On "Save as Draft": Call `create` mutation with `status: "DRAFT"`
         - On "Publish Now": Call `create` mutation with `status: "PUBLISHED"`

4. **Reference Number Display After Creation** (`src/app/sell/list/_components/listing-form.tsx`):
   - After successful listing creation (anonymous or authenticated):
     - If status is DRAFT: Show success modal/card with:
       - Large, copyable reference number display
       - Message: "Listing created as draft" (or "Draft listing created successfully")
       - Warning: "Save this reference number to manage your listing later"
       - "Login to manage your listing" button/link (if anonymous)
       - Link to access listing via reference number
     - If status is PUBLISHED: Show success message with reference number and "Listing is now live"

5. **Publish Procedure Updates** (`src/server/api/routers/listing.ts`):
   - Ensure `publish` procedure works for both authenticated users and anonymous listings (if reference number provided)
   - For anonymous listings: Consider allowing publish via reference number verification (future enhancement)
   - Current `publish` is `protectedProcedure` - this is fine, anonymous users must login first

6. **Draft Status Messaging** (multiple files):
   - Update listing detail page (`src/app/listings/[id]/page.tsx`):
     - Show clear "DRAFT" status badge if listing is draft
     - For draft listings owned by user: Show "Publish Listing" button prominently
     - Show message: "This listing is a draft and not visible to buyers. Publish it to make it available."
   - Update listings management page (`src/app/sell/listings/page.tsx`):
     - Show DRAFT status badge clearly in listing cards/table
     - Add filter for "Draft Only" or "Published Only"
     - Show action buttons: "Publish" for drafts, "Unpublish" or "Edit" for published

7. **Review Step Component** (`src/app/sell/list/_components/steps/review-step.tsx`):
   - Add informational text about draft vs published status
   - If authenticated: Show helper text "You can publish immediately or save as draft"
   - If anonymous: Show helper text "Your listing will be saved as a draft. Log in later to publish it."

8. **Publish Button/Action** (if needed in listing detail page):
   - Add "Publish" button on listing detail page for draft listings owned by user
   - Use tRPC `listing.publish` mutation
   - Show toast notification on success/error
   - Redirect or refresh page after successful publish

9. **Status Badge Component** (`src/components/listing-status-badge.tsx` - check if exists):
   - Ensure DRAFT status has distinct styling (maybe gray/muted colors)
   - DRAFT badge should be visible and clear

### *verification*
- Anonymous listings are always created as DRAFT (cannot be published during creation)
- Authenticated users see dialog with "Publish Now" or "Save as Draft" options on review step submit
- Authenticated users can create listings with PUBLISHED status immediately
- Authenticated users can create listings with DRAFT status for later editing
- Draft listings show clear DRAFT status badge on listing pages
- Reference number is displayed prominently after anonymous listing creation
- Reference number display includes warning to save the number
- Login link/button is shown to anonymous users after listing creation
- Draft listings are not visible in public listing queries (`getAvailable`, `getByReference` for non-owners)
- Users can publish draft listings using `publish` mutation
- Publish mutation validates listing completeness before publishing
- Status transition validation works correctly (DRAFT → PUBLISHED is valid)
- Availability status is set correctly (UNAVAILABLE for DRAFT, AVAILABLE for PUBLISHED)
- Toast notifications show appropriate success/error messages
- Dialog messages are clear and helpful for both authenticated and anonymous users
- Review step shows appropriate helper text based on authentication status

### *preferences*
- Use Shadcn UI components throughout (AlertDialog, Badge, Button, Card, etc.)
- Use tRPC for all API calls (no Next.js actions)
- Follow existing code patterns and TypeScript conventions
- Implement loading states for all mutations
- Use toast notifications (sonner) for user feedback
- Ensure responsive design for all dialogs and modals
- Keep draft status messaging clear and actionable
- Use `useAuth()` hook for authentication checks in components
- Ensure reference number is easily copyable (copy-to-clipboard button)
- Show loading states on form submission buttons during mutation

---

## Implementation Order Recommendation

1. **Phase 1** - Foundation: Anonymous listings + Reference numbers
2. **Phase 2** - User management: Link listings to accounts
3. **Phase 3** - UX improvement: Review step dialogs
4. **Phase 4** - Admin features: Assurance system
5. **Phase 5** - Security: Connection approval workflow
6. **Phase 6** - Polish: Status flow adjustments

---

## Technical Considerations

### Migration Strategy
- Use Prisma migrations for schema changes
- Handle nullable `userId` carefully in existing queries
- Create migration script to generate reference numbers for existing listings
- Backfill assured status for existing listings if needed

### Security Concerns
- Reference numbers must be unique and hard to guess
- Limit listing access by reference number to prevent abuse
- Validate ownership before allowing edits
- Rate limit listing creation (both authenticated and anonymous)

### Performance
- Index reference numbers properly
- Cache listing lookups by reference
- Paginate admin listing views
- Optimize connection request queries

### User Experience
- Clear messaging about reference numbers
- Easy copy-to-clipboard for reference numbers
- Email notifications (future enhancement) with reference numbers
- Helpful error messages for invalid reference numbers

---

## Future Enhancements (Out of Scope for Initial Phases)

1. Email verification for anonymous listings
2. Email notifications on listing status changes
3. Two-factor authentication for admin accounts
4. Listing analytics and reporting
5. Bulk operations for admin panel
6. Export functionality for admin data
7. Advanced search and filtering
8. Listing expiration dates
9. Auto-archive inactive listings

---

## Notes

- Each phase should be tested independently before moving to next
- Database migrations must be run between phases
- Consider feature flags for gradual rollout
- Document API changes in each phase
- Update TypeScript types as schema changes
- Maintain backward compatibility where possible

