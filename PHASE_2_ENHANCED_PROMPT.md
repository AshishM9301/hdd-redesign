# Phase 2 Enhanced Prompt: User Listing Management for Authenticated Users

## *objective*
Enable logged-in users to view and manage their listings with enhanced features compared to anonymous listings. Implement listing-to-account linking functionality, ownership verification updates, and UI enhancements that provide seamless management experience for authenticated users.

## *context*
I'm working in a T3 stack application (Next.js 15 App Router, tRPC, Prisma, Better Auth) where Phase 1 has already been completed - listings can be created anonymously with reference numbers. The schema supports nullable `userId` and `referenceNumber` fields. Existing files include:
- `src/server/api/routers/listing.ts` - Contains listing router with `getByUser`, `verifyListingOwnership` helper, and various mutations
- `src/app/sell/listings/page.tsx` - User listings dashboard that currently filters by `userId`
- `src/app/listings/[id]/page.tsx` - Listing detail page that shows reference numbers to owners
- `src/hooks/use-auth.ts` - Authentication hook providing `user`, `isAuthenticated`, and `session`
- `prisma/schema.prisma` - Has `Listing` model with `userId String?` and `referenceNumber String? @unique`

## *instructions*
- **2.1 User Listing Dashboard Updates** (`src/app/sell/listings/page.tsx`):
  - Keep existing functionality intact
  - Ensure listings shown match current user's `userId`
  - Add reference number column in table if available
  - Display reference numbers using monospace font for readability

- **2.2 Link Anonymous Listing to Account** (`src/server/api/routers/listing.ts`):
  - Create new `linkListingToAccount` protected procedure
  - Input schema: `z.object({ referenceNumber: z.string().min(1) })`
  - Logic flow:
    1. Find listing by `referenceNumber`
    2. If listing not found, throw `NOT_FOUND` error
    3. Check if `userId` is null
    4. If null, update `userId` to current user's ID and return updated listing
    5. If not null, check if `userId` matches current user (return success with existing listing)
    6. If owned by different user, throw `FORBIDDEN` error with message "This listing is already linked to another account"
  - Return full listing with relations (contactInfo, listingDetails, mediaAttachments, user)
  - Add to listingRouter export

- **2.3 Link Listing Page/Component** (`src/app/sell/listings/link/page.tsx`):
  - Create new page with form for reference number input
  - Use Input component from `@/components/ui/input`
  - Use Button component from `@/components/ui/button`
  - Use toast notifications from `sonner` for success/error messages
  - Redirect to `/sell/listings` after successful linking
  - Add loading state during mutation
  - Display helpful instructions about linking listings
  - Show validation errors for invalid reference numbers

- **2.4 Listing Ownership Verification Update** (`src/server/api/routers/listing.ts`):
  - Update `verifyListingOwnership` helper function (lines 400-425)
  - Change signature to check ownership OR allow if listing has null userId (for future approval system compatibility)
  - Current logic: Check if `listing.userId === userId`
  - New logic: Allow if `listing.userId === userId` OR if `listing.userId === null` (anonymous listings)
  - Keep existing error handling for NOT_FOUND case
  - All protected mutations already use this helper, so no changes needed elsewhere

- **2.5 Listing Detail Page UI Enhancements** (`src/app/listings/[id]/page.tsx`):
  - Add "Link to Account" button that appears when:
    - User is logged in (`isAuthenticated === true`)
    - Listing `userId` is null
    - Current user doesn't already own this listing (`isOwner === false`)
  - Button should call `linkListingToAccount` mutation with listing's `referenceNumber`
  - Show toast notification on success/error
  - After successful linking, hide "Link to Account" button and show ownership badge
  - Ensure reference number is only visible to owner (already implemented, verify it works)
  - Add loading state to button during mutation

- **2.6 Additional UI Polish**:
  - Use consistent styling with existing components (Shadcn UI)
  - Add proper error messages and loading states
  - Ensure accessibility with proper ARIA labels
  - Use TypeScript types from existing codebase patterns

## *verification*
- Test logged-in users can see all their listings on `/sell/listings` page
- Test reference numbers are displayed in listings table
- Test `linkListingToAccount` procedure:
  - Successfully links anonymous listing when `userId` is null
  - Returns success when listing already owned by current user
  - Throws `FORBIDDEN` error when listing owned by different user
  - Throws `NOT_FOUND` error when reference number doesn't exist
- Test `/sell/listings/link` page:
  - Form accepts reference number input
  - Displays validation errors for empty/invalid inputs
  - Shows success message and redirects after successful link
- Test ownership verification:
  - Users can modify their own listings
  - Users cannot modify listings owned by others
- Test listing detail page:
  - "Link to Account" button appears for anonymous listings when user is logged in
  - Button successfully links listing to account
  - Reference number only visible to owner
  - Ownership badge appears after linking

## *preferences*
- Follow existing code patterns in the codebase
- Use tRPC procedures for all API calls (no Next.js actions)
- Use Shadcn UI components for consistency
- Implement loading states using spinner components
- Use toast notifications (sonner) for user feedback
- Write code directly in the specified files
- Maintain TypeScript strict type safety
- Follow DRY principles and reuse existing utilities
- Use proper error handling with TRPCError
- Ensure all mutations have proper ownership verification

