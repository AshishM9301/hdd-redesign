# Phase 3: Review Step Dialog and Publish Flow - Enhanced Prompt

## *objective*
Update review step submission flow to show confirmation dialogs with different behaviors for authenticated vs anonymous users. Implement dialog-based confirmation before listing creation, allow authenticated users to choose between publishing immediately or saving as draft, and display reference number management UI for anonymous users after listing creation.

## **context
Working in a T3 stack application with Next.js 15 App Router, tRPC, React Hook Form, Shadcn UI components, and Better Auth for authentication. The listing form (`src/app/sell/list/_components/listing-form.tsx`) currently creates listings directly on submit without confirmation dialogs. The form supports both authenticated and anonymous users. Anonymous listings are created as DRAFT status with reference numbers, while authenticated users can create listings that are immediately usable. The listing router (`src/server/api/routers/listing.ts`) has a `create` procedure that creates listings as DRAFT and a `publish` procedure that requires authentication. Reference numbers are already generated and returned from the create mutation.

## **instructions

### 3.1 Review Step Dialog Implementation
- Modify `handleStepSubmit` in `src/app/sell/list/_components/listing-form.tsx` to check authentication status before submitting the final step (review step).
- For anonymous users (NOT authenticated):
  - Before submitting, show an AlertDialog with:
    - Title: "Are you sure you want to submit?"
    - Description: "Your listing will be created but will need to be published after you log in. Save your reference number to manage your listing later."
    - Actions: "Cancel" button and "Submit Listing" button
    - On "Submit Listing" confirm: Create listing as DRAFT (current behavior)
    - On "Cancel": Close dialog and do nothing
- For authenticated users:
  - Before submitting, show an AlertDialog with:
    - Title: "Publish or Save as Draft?"
    - Description: "Would you like to publish this listing now or save it as a draft?"
    - Actions: "Cancel" button, "Save as Draft" button, and "Publish Now" button
    - On "Save as Draft": Create listing as DRAFT (current behavior)
    - On "Publish Now": Create listing and immediately call the `publish` mutation to set status to PUBLISHED
    - On "Cancel": Close dialog and do nothing
- Use the AlertDialog component from `@/components/ui/alert-dialog`
- Manage dialog open/close state with React state
- Handle loading states during mutations (create and publish)

### 3.2 Reference Number Display Enhancement
- After successful anonymous listing creation (when `referenceNumber` is set and user is not authenticated):
  - Keep existing reference number display UI but ensure it's properly styled and prominent
  - Ensure success toast includes the reference number (already implemented)
  - Ensure the reference number card shows:
    - Large, copyable reference number input field
    - "Save this reference number" warning message (already exists)
    - "Login to manage your listing" button/link (already exists)
    - Link to view listing via reference number (already exists)
- No changes needed if the current implementation already works correctly

### 3.3 Publish Flow Updates
- Ensure the `publish` procedure in `src/server/api/routers/listing.ts` works correctly (currently requires authentication - this is expected)
- For immediate publish flow (authenticated users choosing "Publish Now"):
  - After creating the listing, immediately call the `publish` mutation
  - Handle success: Show success toast and redirect to `/sell/listings`
  - Handle errors: Show error toast with appropriate message
  - Ensure both mutations (create and publish) show loading states

### 3.4 Additional Implementation Details
- Import AlertDialog components at the top of listing-form.tsx
- Add state variables for dialog open/close and dialog type (anonymous vs authenticated)
- Update the `createListing` mutation `onSuccess` callback to handle the publish flow if needed
- For authenticated users who choose "Publish Now", chain the publish mutation after create succeeds
- Ensure proper error handling for both create and publish mutations
- Add loading states to prevent double submissions
- Use existing toast notifications from sonner for user feedback

## *verification
Test the following scenarios:
- Anonymous user clicks Submit on review step: Should see confirmation dialog with message about saving reference number
- Anonymous user confirms submission: Should create DRAFT listing and show reference number display UI
- Anonymous user cancels dialog: Should close dialog and return to review step
- Authenticated user clicks Submit on review step: Should see dialog with "Publish or Save as Draft" options
- Authenticated user selects "Save as Draft": Should create DRAFT listing and redirect to listings page
- Authenticated user selects "Publish Now": Should create listing, immediately publish it, show success toast, and redirect to listings page
- Authenticated user cancels dialog: Should close dialog and return to review step
- Loading states work correctly: Submit button shows loading state during create/publish mutations
- Error handling: Errors from mutations are properly displayed to user via toast notifications
- Reference number display: Anonymous users see proper UI with copy functionality and management links

## *preferences
- Use Shadcn AlertDialog component from `@/components/ui/alert-dialog`
- Use existing toast system from `sonner` for notifications
- Maintain existing form validation and error handling patterns
- Use React state for dialog management
- Follow existing code style and patterns in the listing-form.tsx file
- Chain tRPC mutations using `mutateAsync` for the publish flow
- Ensure all dialogs are accessible and properly styled
- Keep the existing reference number display logic if it's already working correctly

