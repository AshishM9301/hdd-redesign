# UPLOAD PHOTOS & DOCUMENTS Feature - Implementation Prompt

## Overview
Implement a feature that allows any user (logged in or anonymous) to upload photos and documents to request adding them to a listing. The system should match uploads to listings via reference number or email, notify admins and users via email, and provide request management capabilities.


/enSave the promt below my original promt,Read the whole code,Execute the new enhanced promt

---

## Phase 1: Database Schema & Backend API

### Objective
Create the database model for upload requests and implement the backend API endpoint.

### Context
- Current database schema is in `prisma/schema.prisma`
- Backend APIs use tRPC and are located in `src/server/api/routers/`
- Public procedures are available in `src/server/api/trpc.ts`
- File storage utilities exist in `src/lib/storage/`

### Instructions

#### 1.1 Database Schema
- Add a new model `MediaUploadRequest` to `prisma/schema.prisma` with:
  - `id`: String (cuid)
  - `listingId`: String? (nullable, relation to Listing)
  - `listing`: Listing? (optional relation)
  - `userId`: String? (nullable, relation to User if logged in)
  - `user`: User? (optional relation)
  - `contactName`: String (required)
  - `email`: String (required, indexed)
  - `phone`: String? (optional)
  - `message`: String? (optional)
  - `status`: String (default "PENDING") - "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
  - `referenceNumber`: String? (optional, for matching)
  - `mediaFiles`: Json (array of file metadata: fileName, storagePath, fileType, fileSize)
  - `cancellationToken`: String (unique, for anonymous cancellation links)
  - `reviewedById`: String? (nullable, admin who reviewed)
  - `reviewedBy`: User? (optional relation)
  - `reviewedAt`: DateTime? (nullable)
  - `rejectionReason`: String? (optional)
  - `createdAt`: DateTime (default now)
  - `updatedAt`: DateTime (updatedAt)
  - Indexes: `[email]`, `[status]`, `[userId]`, `[listingId]`, `[cancellationToken]`
- Add relation to User model: `mediaUploadRequests MediaUploadRequest[]`
- Add relation to Listing model: `mediaUploadRequests MediaUploadRequest[]`
- Create and run migration

#### 1.2 Backend API Router
- Create `src/server/api/routers/media-upload.ts`
- Export `mediaUploadRouter` using `createTRPCRouter`
- Implement procedures:

**`submitUploadRequest`** (publicProcedure):
- Input schema (Zod):
  - `contactName`: string (required, min 1)
  - `email`: string (email, required)
  - `phone`: string (optional)
  - `message`: string (optional)
  - `referenceNumber`: string (optional)
  - `files`: array of objects with `fileName`, `storagePath`, `fileType`, `fileSize` (required)
- Logic:
  - If `referenceNumber` provided, find listing by reference number
  - If no `referenceNumber` but `email` provided, find listings by email (from ContactInfo)
    - If exactly one listing found, use it
    - If multiple listings found, don't auto-match (leave listingId null)
    - If no listings found, leave listingId null
  - Get current user from session (if logged in)
  - Generate unique `cancellationToken` (cuid or random string)
  - Create `MediaUploadRequest` record
  - Return request ID and cancellation token
- Error handling: Validate inputs, handle storage errors

**`getMyUploadRequests`** (protectedProcedure):
- Return all upload requests for the logged-in user
- Include listing info if available
- Order by createdAt DESC

**`cancelUploadRequest`** (publicProcedure):
- Input: `requestId` (string) OR `cancellationToken` (string)
- Logic:
  - Find request by ID (if user is logged in) OR by cancellationToken (for anonymous)
  - Verify user owns the request OR cancellationToken matches
  - Update status to "CANCELLED"
  - Return success

**`getUploadRequest`** (protectedProcedure):
- Input: `requestId` (string)
- Return single request with full details
- Verify user owns the request or is admin

- Add router to `src/server/api/root.ts`

#### 1.3 File Upload Handler
- Create `src/server/api/routers/media-upload.ts` with file upload handling
- Use existing storage utilities from `src/lib/storage/`
- Accept multipart/form-data for file uploads
- Validate file types (images, videos, documents)
- Upload files to **Railway.com bucket** (use provided Railway credentials). Keep AWS pathing/hooks in code as future-ready fallback, but default to Railway for all current uploads.
- Return file metadata (fileName, storagePath, fileType, fileSize)
- Handle file size limits and type restrictions

#### 1.4 Switch Existing Image Upload API to Railway
- Identify the current upload implementation that points to Firebase and refactor it to default to Railway bucket.
- Update storage client/config to use Railway credentials (bucket, region/endpoint, access keys); keep AWS hooks intact for future use.
- Keep Firebase configuration present but disabled/non-default as a fallback reference.
- Verify upload/list/delete flows work against Railway; add a short smoke-test checklist.

### Enhanced Prompt (Phase 1)
*objective*: Implement database schema, tRPC backend router, and storage integration for media upload requests (photos/documents) supporting logged-in and anonymous users.
**context*: Stack is T3 with Bun, Next.js 15 App Router, tRPC, Prisma, Shadcn UI, Tailwind, firebase auth. Key files: `prisma/schema.prisma`, `src/server/api/routers/media-upload.ts`, `src/server/api/root.ts`, storage utilities in `src/lib/storage/`, existing upload implementation currently points to Firebase.
**instructions*:
- Extend `prisma/schema.prisma` with `MediaUploadRequest` model (fields: id cuid, optional listingId relation, optional userId relation, contactName, email indexed, optional phone/message/referenceNumber, status default "PENDING" enum of PENDING/APPROVED/REJECTED/CANCELLED, mediaFiles Json metadata, unique cancellationToken, optional reviewedById relation, reviewedAt, rejectionReason, timestamps, indexes on email/status/userId/listingId/cancellationToken). Add `mediaUploadRequests` relation arrays on `User` and `Listing`. Create and run migration.
- Create `src/server/api/routers/media-upload.ts` exporting `mediaUploadRouter` via `createTRPCRouter`. Procedures: `submitUploadRequest` (publicProcedure) with Zod inputs contactName/email/phone/message/referenceNumber plus files array (fileName/storagePath/fileType/fileSize); match listing by referenceNumber or unique email match; attach session user if present; generate cancellationToken (cuid/random); persist record; return request id + cancellationToken; validate inputs and handle storage errors. `getMyUploadRequests` (protectedProcedure) returns user’s requests with listing info ordered by createdAt desc. `cancelUploadRequest` (publicProcedure) takes requestId or cancellationToken, verifies ownership/token, sets status to CANCELLED. `getUploadRequest` (protectedProcedure) fetches request details, ensures owner or admin access. Register router in `src/server/api/root.ts`.
- Implement file upload handling in `media-upload.ts` using `src/lib/storage/` utilities; accept multipart/form-data; validate allowed file types (images, videos, documents) and size limits; upload to Railway bucket by default while keeping AWS hooks ready; return metadata {fileName, storagePath, fileType, fileSize}; handle storage failures gracefully.
- Refactor existing image upload API to default to Railway bucket; update storage client/config with Railway credentials (bucket/region/endpoint/access keys) while keeping Firebase config disabled as fallback; ensure list/delete flows align; maintain AWS pathing hooks for future use.
*verfication*: Run Prisma migration; submit upload request via tRPC covering: with referenceNumber match, with single email match, with no match; verify cancellation via requestId (logged-in) and cancellationToken (anonymous); confirm files land in Railway bucket and metadata is stored; ensure status transitions and protected access checks work; smoke-test upload/list/delete flows on Railway.
*prefrences*: Keep changes in the specified files; use tRPC (no Next.js actions), Bun tooling, Prisma best practices; prioritize readability and robust validation; leave existing Firebase setup intact but non-default; add minimal necessary comments; follow repo conventions.
---

## Phase 1.5: Railway Storage Setup + Listing Image/Video Upload (Full Setup)

### Objective
Ensure **all listing media uploads (images/videos)** and upload-request media uploads **default to Railway S3-compatible storage**, with consistent validation across client + server.

### Context
- **Storage provider selection** is controlled via `STORAGE_PROVIDER` in `src/env.js` (defaults to `"railway"`).
- Railway bucket integration is implemented in `src/lib/storage/railway.ts` and selected through `src/lib/storage/index.ts`.
- Listing media upload uses tRPC `listing.uploadMedia` and stores `MediaAttachment` records in DB.
- Client file picking is via `src/components/image-upload-dialog.tsx` used by `src/app/sell/list/_components/steps/attachments-step.tsx` and `src/app/sell/list/_components/listing-form.tsx`.

### Instructions
#### 1.5.1 Environment Variables (Railway)
Add these to your `.env` (or Railway/hosting env vars). They are **required when `STORAGE_PROVIDER="railway"`**:
- `STORAGE_PROVIDER=railway`
- `RAILWAY_S3_ENDPOINT` (S3-compatible endpoint URL)
- `RAILWAY_S3_REGION` (use provider region or `"auto"` if applicable)
- `RAILWAY_S3_BUCKET` (bucket name)
- `RAILWAY_S3_ACCESS_KEY_ID`
- `RAILWAY_S3_SECRET_ACCESS_KEY`

#### 1.5.2 Allowed Types + Size Limits (Images/Videos)
Keep validation consistent between client and server:
- **Images**: `image/jpeg`, `image/png`, `image/webp` (max 10MB)
- **Videos**: `video/mp4`, `video/webm`, `video/quicktime` (max 100MB)
- **Documents** (upload-request feature): `application/pdf` (max 5MB)

#### 1.5.3 Listing Upload Flow (Sell Form)
- `src/app/sell/list/_components/listing-form.tsx` submits the listing first, then uploads attachments via tRPC `listing.uploadMedia`.
- On the server, `listing.uploadMedia` uploads to the provider returned by `StorageFactory.getProvider()` → with `STORAGE_PROVIDER=railway` this uses Railway bucket.
- Uploaded files become `MediaAttachment` rows (with `storageProvider=RAILWAY`, `storagePath`, `fileType`, `mimeType`, `fileSize`).
- Note: this flow currently transfers files as **base64** via tRPC, which increases payload size; keep videos reasonably small, or upgrade later to a presigned-URL direct-to-Railway upload flow for large videos.

#### 1.5.4 Upload Requests Flow (Anonymous + Logged-in)
- `src/server/api/routers/media-upload.ts` includes `uploadFiles` and stores metadata in `MediaUploadRequest.mediaFiles`.
- Uses `StorageFactory.getProvider()` as well → Railway by default.

### Verification Checklist
- **Env**: App boots with `STORAGE_PROVIDER=railway` and all `RAILWAY_S3_*` vars set.
- **Sell listing**: Upload an image + an MP4 in the sell flow; confirm `MediaAttachment.storageProvider=RAILWAY` and `storagePath` exists in the Railway bucket.
- **Validation**: Try uploading an unsupported type (e.g. `video/avi`) and confirm it’s rejected client-side and/or server-side.
- **Upload requests**: Submit an anonymous upload request with files; confirm files land in Railway and metadata is stored.

## Phase 2: Frontend Upload Dialog & Form

### Objective
Create the upload dialog component and form matching the design from the image.

### Context
- Existing dialog component: `src/components/ui/dialog.tsx`
- Existing image upload dialog: `src/components/image-upload-dialog.tsx`
- Form components in `src/components/ui/`
- Listing boxes component: `src/app/sell/_components/listing-boxes.tsx`

### Instructions

#### 2.1 Upload Dialog Component
- Create `src/app/sell/_components/upload-photos-dialog.tsx`
- Use Dialog component from `@/components/ui/dialog`
- Form fields matching image design:
  - **From**: Text input for "Your name" (required)
  - **Email**: Email input (required)
  - **Phone**: Phone input (optional)
  - **To**: Select dropdown with "Listings Department" (default, can be extended later)
  - **Message**: Textarea for user message (optional)
  - **Listing**: Text input for "Reference # (Optional)"
  - **Files**: File upload area with drag-and-drop
    - Large dashed border box
    - "Drop files here" text
    - "or" text
    - "Select Files" button
    - Show selected files with previews
    - Allow removing individual files
- Use react-hook-form with Zod validation
- Use existing `ImageUploadDialog` component logic for file handling
- Integrate with tRPC `mediaUpload.submitUploadRequest` mutation
- Show loading state during upload
- Show success toast with cancellation link (if not logged in)
- Show error toast on failure
- Reset form after successful submission

#### 2.2 Update Listing Boxes
- Update `src/app/sell/_components/listing-boxes.tsx`
- Change "UPLOAD PHOTOS & DOCUMENTS" href from "#" to trigger dialog
- Replace Link with button that opens the upload dialog
- Pass dialog component as trigger

#### 2.3 File Upload Integration
- Handle file uploads before submitting request
- Upload files to storage using tRPC endpoint or direct API
- Get file metadata (storagePath, fileName, fileType, fileSize)
- Pass file metadata to `submitUploadRequest` mutation
- Show upload progress for multiple files

---

### Enhanced Prompt (Phase 2)
*objective*: Build the “Upload Photos & Documents” dialog UI and wire it into the Sell page boxes so users (logged-in or anonymous) can upload files, submit a `MediaUploadRequest`, see progress, and get clear success/error feedback.
**context*: Project is T3 Stack (Bun, Next.js 15 App Router, tRPC, Prisma, Shadcn UI, Tailwind). Backend already exists: `src/server/api/routers/media-upload.ts` exposes `mediaUpload.uploadFiles` (base64 upload → Railway storage by default) and `mediaUpload.submitUploadRequest` (metadata → DB). Reusable upload UI exists at `src/components/image-upload-dialog.tsx` (drag/drop, previews). Sell boxes live in `src/app/sell/_components/listing-boxes.tsx`. Use Sonner toasts (`toast` from `sonner`).
**instructions*:
- Create `src/app/sell/_components/upload-photos-dialog.tsx` as a client component using Shadcn `Dialog` and `react-hook-form` + Zod.
- UI must match the design intent:
  - From: required text input (“Your name”)
  - Email: required email input
  - Phone: optional input
  - To: select dropdown with default “Listings Department” (future extensible)
  - Message: optional textarea
  - Listing: optional text input (“Reference # (Optional)”)
  - Files: large dashed drag/drop area with “Drop files here”, “or”, and “Select Files” button; show selected files with previews; allow removing individual files.
- File handling:
  - Reuse logic/patterns from `src/components/image-upload-dialog.tsx` for drag/drop + previews.
  - Validate file types and sizes using `src/types/media.ts` constraints (images/videos + pdf).
  - Before submitting the request, upload selected files via `api.mediaUpload.uploadFiles` (send base64 strings).
  - Track progress per-file and overall; disable submit while uploading; show clear loading state.
  - After uploads succeed, call `api.mediaUpload.submitUploadRequest` with form fields + returned file metadata.
- UX:
  - Show error toast on validation/upload/submit failure.
  - Show success toast on completion; include cancellation token/link when user is anonymous (token returned from `submitUploadRequest`).
  - Reset form + clear previews after success.
- Update `src/app/sell/_components/listing-boxes.tsx`:
  - Replace the “UPLOAD PHOTOS & DOCUMENTS” Link (`href="#"`) with a button that opens the dialog.
  - Keep other tiles as links.
*verfication*:
- Open Sell page and click “UPLOAD PHOTOS & DOCUMENTS” → dialog opens.
- Add multiple files (image/video/pdf), see previews, remove files, and see progress during upload.
- Submit with valid inputs → `mediaUpload.uploadFiles` then `submitUploadRequest` succeed, toast shows success, and form resets.
- Submit with invalid email/missing name/no files → client-side errors + toast.
*prefrences*: Use tRPC hooks from `src/trpc/react.tsx` (no Next actions), Shadcn components, Tailwind classes, accessible labels, and minimal duplication.

## Phase 3: Email Notifications

### Objective
Send email notifications to admin and user when upload request is submitted.

### Context
- Email service needs to be set up (check if email service exists in codebase)
- Environment variables for email configuration
- Email templates needed

### Instructions

#### 3.1 Email Service Setup
- Check if email service exists in `src/lib/` or `src/server/`
- If not, set up email service (using nodemailer, resend, or similar)
- Add email configuration to `src/env.js`
- Create email utility functions in `src/lib/email.ts` or `src/server/email.ts`

#### 3.2 Admin Notification Email
- Trigger after successful `submitUploadRequest`
- Send to admin email (from env or config)
- Include:
  - Request ID
  - Contact name, email, phone
  - Listing reference number (if provided)
  - Listing details (if matched)
  - Number of files uploaded
  - Message (if provided)
  - Link to admin panel to review request
- Subject: "New Media Upload Request - [Request ID]"

#### 3.3 User Confirmation Email
- Trigger after successful `submitUploadRequest`
- Send to user's email
- Include:
  - Confirmation message
  - Request ID
  - Listing reference number (if provided)
  - Number of files uploaded
  - Preview of uploaded files (thumbnails or file names)
  - **Cancellation link** (if user is not logged in): `[site-url]/upload-requests/cancel?token=[cancellationToken]`
  - Link to view request (if logged in)
- Subject: "Upload Request Received - [Request ID]"

#### 3.4 Email Templates
- Create email templates (HTML/text)
- Use consistent branding
- Include HDD Broker logo/header
- Make cancellation link prominent and clear
 
### Enhanced Prompt (Phase 3)
*objective*: Implement admin and user email notifications after `submitUploadRequest`, including service setup, configuration, and branded templates with anonymous cancellation support.
**context*: Stack: Bun, Next.js 15 App Router, tRPC, Prisma, Shadcn, Tailwind, firebase auth. Email support may be absent—check `src/lib/` and `src/server/`. Env definitions are in `src/env.js`. Upload flow returns `requestId` and `cancellationToken` for anonymous users; logic lives in `src/server/api/routers/media-upload.ts`.
**instructions*:
- If missing, add an email service (e.g., Nodemailer/Resend) with helpers in `src/lib/email.ts` (or `src/server/email.ts`); configure SMTP/API keys and sender in `src/env.js`.
- Create branded HTML/text templates for admin and user; include HDD Broker logo/header and a prominent cancellation link for anonymous users.
- Admin email: send post-successful `submitUploadRequest` to admin address from env/config; include requestId, contact name/email/phone, listing reference, matched listing details (if any), file count, optional message, and an admin-panel review link; subject `New Media Upload Request - [Request ID]`.
- User email: send post-successful `submitUploadRequest` to the requester; include confirmation, requestId, listing reference (if any), file count, file name/thumbnail summary, cancellation link when anonymous (`[site-url]/upload-requests/cancel?token=[cancellationToken]`), and a view-request link when logged in; subject `Upload Request Received - [Request ID]`.
- Invoke send functions after persistence in `submitUploadRequest`; handle failures gracefully (log and continue, avoid blocking response).
*verfication*: With env set, submit an upload request and confirm admin and user emails arrive with correct data/links/branding; verify anonymous cancellation link works; ensure API response succeeds even if email send fails while logging the issue.
*prefrences*: Keep secrets in env; keep templates under `src/lib/email/` (or similar); use shared helpers; favor readability and maintainability.

## Phase 4: Admin Panel - Request Management

### Objective
Add upload request management to the admin panel.

### Context
- Admin panel: `src/app/admin/listings/page.tsx`
- Admin router: `src/server/api/routers/admin.ts`
- Admin procedures use `adminProcedure` from `src/server/api/trpc.ts`

### Instructions

#### 4.1 Admin API Procedures
- Add to `src/server/api/routers/admin.ts`:

**`getAllUploadRequests`** (adminProcedure):
- Input: `page` (number), `limit` (number), `status` (optional string), `search` (optional string)
- Return paginated list of upload requests
- Include: request details, listing info, user info, file count
- Filter by status if provided
- Search by email, contact name, reference number
- Order by createdAt DESC

**`approveUploadRequest`** (adminProcedure):
- Input: `requestId` (string), `notes` (optional string)
- Logic:
  - Find request
  - Verify status is "PENDING"
  - If listingId exists, add media files to listing's MediaAttachment records
  - Update request status to "APPROVED"
  - Set reviewedById and reviewedAt
  - Send approval email to user
  - Return success

**`rejectUploadRequest`** (adminProcedure):
- Input: `requestId` (string), `rejectionReason` (string, required)
- Logic:
  - Find request
  - Verify status is "PENDING"
  - Update status to "REJECTED"
  - Set rejectionReason, reviewedById, reviewedAt
  - Send rejection email to user with reason
  - Return success

**`getUploadRequestDetails`** (adminProcedure):
- Input: `requestId` (string)
- Return full request details including:
  - All form fields
  - Listing information (if matched)
  - User information (if logged in)
  - All uploaded files with previews/download links
  - Status history

#### 4.2 Admin UI Page
- Create `src/app/admin/upload-requests/page.tsx`
- Similar structure to `src/app/admin/listings/page.tsx`
- Table columns:
  - Request ID
  - Contact Name
  - Email
  - Listing Reference #
  - Status Badge
  - Files Count
  - Created Date
  - Actions (View, Approve, Reject)
- Filters:
  - Status dropdown (All, Pending, Approved, Rejected, Cancelled)
  - Search by email, name, reference number
- Pagination
- Status badges with colors:
  - Pending: Yellow/Orange
  - Approved: Green
  - Rejected: Red
  - Cancelled: Gray

#### 4.3 Request Detail View
- Create `src/app/admin/upload-requests/[id]/page.tsx`
- Show full request details:
  - Contact information
  - Listing information (if matched)
  - Message
  - Uploaded files with previews/download links
  - Status and review history
- Action buttons:
  - Approve (opens dialog for notes)
  - Reject (opens dialog for rejection reason)
  - View Listing (if matched)
- Show file previews (images) or download links (documents)

#### 4.4 Admin Navigation
- Add "Upload Requests" link to admin navigation/sidebar
- Show badge with pending count if available

---

## Phase 5: User Request Management

### Objective
Allow logged-in users to view and manage their upload requests.

### Context
- User dashboard/profile area
- Protected routes for authenticated users

### Instructions

#### 5.1 User Request List Page
- Create `src/app/my-upload-requests/page.tsx` or add to user dashboard
- Use `mediaUpload.getMyUploadRequests` query
- Display table/list of user's requests:
  - Request ID
  - Listing Reference # (if matched)
  - Status Badge
  - Files Count
  - Created Date
  - Actions (View, Cancel if pending)
- Show empty state if no requests
- Loading skeletons

#### 5.2 Request Detail View (User)
- Create `src/app/my-upload-requests/[id]/page.tsx`
- Show request details:
  - Contact information (read-only)
  - Listing information (if matched)
  - Message
  - Uploaded files with previews
  - Status
- Cancel button (if status is PENDING)
- Show cancellation confirmation dialog

#### 5.3 Cancellation Flow
- Implement cancel functionality using `mediaUpload.cancelUploadRequest`
- Show confirmation dialog before cancelling
- Show success toast after cancellation
- Refresh request list after cancellation

#### 5.4 Anonymous Cancellation Page
- Create `src/app/upload-requests/cancel/page.tsx`
- Accept `token` query parameter
- Use `mediaUpload.cancelUploadRequest` with cancellationToken
- Show confirmation form
- Show success message after cancellation
- Handle invalid/expired tokens

### Enhanced Prompt - Phase 5 (User Request Management)
**objective:** Implement full user-facing upload request management with list, detail, and cancellation (auth and anonymous) using tRPC, RSC, and Shadcn UI.
**context:** Next.js 15 App Router with Bun + T3 stack; authenticated user dashboard/profile area; protected routes; data via `mediaUpload` tRPC router.
**instructions:**
- Build `src/app/my-upload-requests/page.tsx` (or dashboard section) using the `mediaUpload.getMyUploadRequests` query to render a responsive list/table showing request id, listing ref, status badge, files count, created date, and actions (view, cancel when pending). Add empty state and loading skeletons; integrate top loading bar.
- Build `src/app/my-upload-requests/[id]/page.tsx` to show read-only contact info, listing info (if matched), message, uploaded file previews, status, and a cancel button when status is PENDING. Include confirmation dialog, success toast, and refresh after cancel.
- Implement cancellation through `mediaUpload.cancelUploadRequest` for both authenticated and anonymous flows; ensure error handling and disabled states during mutations.
- Add anonymous cancellation page `src/app/upload-requests/cancel/page.tsx` that reads `token` query param, confirms cancellation via `mediaUpload.cancelUploadRequest` with the token, and shows success/invalid-token states.
- Use Shadcn components and Tailwind for layout; prefer RSC+tRPC over Next actions; ensure accessibility and responsive design.
**verification:** List shows correct data with skeletons on load; detail view loads data and cancels pending requests with confirmation and toast; list refreshes after cancel; anonymous page handles valid token success and invalid/expired token errors gracefully; protected routes enforce auth.
**preferences:** Keep types in `src/types`; routes in `src/server/api/routers`; reusable UI in `src/components`, page-only UI in `_components`; use top loading bar and toasts for user feedback; no placeholders/TODOs.

---

## Phase 6: Polish & Enhancements

### Objective
Add final touches, error handling, and UX improvements.

### Instructions

#### 6.1 Error Handling
- Handle all error cases gracefully
- Show user-friendly error messages
- Handle file upload failures
- Handle network errors
- Handle invalid reference numbers
- Handle email sending failures (log but don't fail request)

#### 6.2 Loading States
- Add loading skeletons for all data fetching
- Show upload progress for file uploads
- Disable buttons during mutations
- Show loading spinners

#### 6.3 Validation
- Client-side validation for all forms
- Server-side validation for all inputs
- File type validation
- File size limits
- Email format validation
- Reference number format validation

#### 6.4 UX Improvements
- Auto-fill email if user is logged in
- Show listing match preview before submission
- Show file upload progress
- Allow retry on failed uploads
- Show helpful hints/instructions
- Add tooltips for form fields
- Responsive design for mobile

#### 6.5 Testing
- Test anonymous user flow
- Test logged-in user flow
- Test admin approval/rejection flow
- Test cancellation flow (both logged in and anonymous)
- Test email notifications
- Test file uploads (various types and sizes)
- Test listing matching logic

---

### Enhanced Prompt (Phase 6 - Polish & Enhancements)
*objective*: Implement Phase 6 polish for the upload photos/documents flow so that all error cases, loading states, validations, UX, and testing paths are fully handled and production-ready.

**context**: You are working in a T3-stack Next.js 15 (App Router) project using Bun, tRPC, Prisma, Shadcn UI, Tailwind CSS, Biome, and Firebase-based auth. The upload photos/documents feature is already wired through `src/server/api/routers/media-upload.ts`, storage utilities under `src/lib/storage/`, validation helpers (e.g. `src/lib/validation/validateFile.ts`), types in `src/types/`, and related UI flows in `src/app/*` pages and `_components`. The goal is to finalize this upload-request subsystem so that both anonymous and logged-in users can reliably upload media, admins can manage these requests, and the UX is smooth and resilient.

**instructions**:
- **Error handling**
  - Audit all upload-request-related tRPC procedures (especially in `media-upload` router and any related routers) and ensure they:
    - Properly validate inputs (zod schemas) and throw typed errors with clear, user-facing messages (mapped on the client).
    - Gracefully handle storage failures (Railway/Firebase/AWS) and Prisma failures, ensuring no partial/invalid DB records are left behind.
    - Log internal errors (e.g. email send failures, storage errors) using the existing logging strategy but avoid leaking sensitive details to the client.
  - On the client side (pages and components tied to upload requests), catch and surface errors via Shadcn toasts/dialogs with clear copy:
    - File upload failures (per-file and overall).
    - Network errors/timeouts.
    - Invalid or non-existent reference numbers/listings.
    - Email sending failures (surfaced as a non-blocking warning if the core operation succeeded).
  - Ensure cancellation and admin actions fail gracefully (with specific messaging) if:
    - The upload request no longer exists or has already been processed.
    - The current user is unauthorized or not the owner (for user-side cancellation).
    - Any backend validation fails.

- **Loading states**
  - Add consistent loading states across all upload-request flows:
    - Use the existing `top-loading-bar` component on every relevant page/view and tie it to route transitions and tRPC query/mutation promises.
    - For long-running operations (file uploads, matching listings, sending emails), show:
      - Button-level loading states (disabled + spinner + “Processing…” label).
      - Progress indicators for file uploads (per-file and/or aggregate where possible, using events from the storage layer if available).
      - Skeletons for initial page loads and list/detail views (Shadcn skeletons) for:
        - Upload request list pages.
        - Individual upload request detail / status pages.
        - Admin listing of upload requests.
  - Ensure all action buttons are disabled while the associated mutation is in-flight, avoiding double submission and race conditions.

- **Validation**
  - Implement and/or refine client-side validation for all forms in the upload-request flow:
    - Required fields, email format, reference number format, request type/category, and any description fields.
    - File input validation (type, size, number of files) prior to issue of upload calls, surfacing helpful inline errors and hints.
  - Mirror and centralize server-side validation using zod schemas in the tRPC routers:
    - Enforce strict file extension/ MIME type allow-lists and size limits (reusing `validateFile` where appropriate).
    - Validate that reference numbers conform to the expected pattern and correspond to an existing listing when required.
    - Validate that emails are well-formed and normalized (lowercased, trimmed) before storage.
  - Ensure client and server validations have aligned rules and error codes so that errors can be mapped to user-friendly field-level messages where possible.

- **UX improvements**
  - For logged-in users, auto-populate the email field with the authenticated user’s email from the auth hook, while still allowing edits where business rules permit.
  - Before final submission, show a “listing match preview”:
    - Display the key listing information determined by the reference number or matching logic (title, key specs, thumbnail).
    - Provide a clear confirmation step so users can verify they’re submitting documents for the correct listing.
  - Enhance the file upload section:
    - Show visual upload progress (percentage, file counters, and status: waiting, uploading, completed, failed).
    - Allow retry of individual failed files and/or the whole upload operation without forcing the user to re-fill unrelated form fields.
    - Use Shadcn components (dialogs, tooltips, badges, alerts) to provide:
      - Short instructions/hints about acceptable file types, size limits, and expected processing time.
      - Tooltips for important fields (reference number, email, listing relationship).
  - Ensure the entire flow is responsive and accessible:
    - Works well on mobile (layout, touch targets, responsive dialogs).
    - Proper focus management on dialogs, errors, and successful submission states.
    - Clear empty states and success states:
      - Confirmations after a successful upload request with key details (reference, email, next steps).
      - Dedicated status indicators (badges/chips) for upload request state (pending, approved, rejected, cancelled).

- **Security & authorization**
  - Validate all file uploads server-side for type and size, rejecting anything unsafe or disallowed, and preventing scriptable content (XSS) from being served un-sanitized.
  - Enforce authorization:
    - Only admins can approve/reject requests and see certain sensitive metadata.
    - Logged-in users can only view/cancel their own upload requests.
    - Anonymous cancellation must be gated by secure tokens embedded in emailed links (no guessable IDs or predictable parameters).
  - Implement or integrate rate limiting for upload-request creation endpoints to avoid abuse.
  - Ensure no sensitive information is leaked in error messages, URLs, or client-visible payloads.

- **File storage & performance**
  - Use the existing storage abstraction in `src/lib/storage/` to handle file uploads, supporting configured providers (Firebase/AWS/Railway) without duplicating logic.
  - Persist clean metadata for each uploaded file in the database (file name, type, size, storage path/URL, associated request/listing IDs, timestamps).
  - Where applicable, generate and store thumbnails for images, and use lazy-loading for previews to keep pages performant.
  - Add pagination and/or infinite scroll for lists of upload requests (user and admin-facing), ensuring queries are optimized with Prisma (indexes, `take/skip`).
  - Cache or memoize listing lookups where possible (e.g., per reference number) to reduce redundant DB lookups in tight loops.

- **Testing & verification**
  - Verify all flows end-to-end:
    - Anonymous user upload request:
      - Successful creation with file uploads.
      - Confirmation email with a valid, secure cancellation link.
      - Successful cancellation via that link, with correct status changes.
    - Logged-in user flow:
      - Upload request creation (with auto-filled email and existing account data).
      - Viewing and cancelling own requests from the appropriate page.
    - Admin flow:
      - Viewing upload requests (with filters/search if present).
      - Approving and rejecting requests, with accurate status transitions and appropriate notifications.
    - Error-path flows:
      - Simulated file upload failure, network error, and email send error, confirming that:
        - The UI shows clear error states.
        - No inconsistent DB or storage state remains.
        - Partial successes are handled (e.g., uploads succeed but email fails → logged but not fatal).
  - Optionally add unit/integration tests where the project already uses a testing framework, focusing on:
    - Validation schemas for upload-request inputs.
    - Core tRPC procedures for creation, update/approval/rejection, and cancellation.

*verfication*: Confirm the implementation by manually testing all flows in a local environment (anonymous, logged-in user, admin) and verifying that:
- Every user-facing screen shows appropriate loading indicators and skeletons during data fetching or long-running operations.
- All validation errors (client and server) are surfaced as user-friendly messages and do not crash the UI.
- File uploads enforce type and size limits, and upload failures are recoverable via retries.
- Reference-number and email-based matching behave correctly, including listing preview before submission.
- Admin actions and user cancellations work only when authorized, with proper status updates and no data leaks.
- Emails are sent where expected; failures are logged and surfaced as warnings but do not break successful core operations.

*prefrences*:
- Implement changes directly in the existing project using the current structure:
  - Use `src/server/api/routers` for tRPC routes, `src/lib` for shared logic and storage/email utilities, `src/types` for shared types, and `src/app` pages plus `_components`/`src/components` for UI.
  - Prefer React Server Components + tRPC over Next.js server actions for new data fetching/mutations.
  - Use Shadcn UI, Tailwind, and the existing `top-loading-bar` and toast solution for UX work.
  - Keep code readable, type-safe (TypeScript-first), and consistent with existing patterns; avoid TODOs and placeholders.
  - Ensure all new code passes Biome linting and fits into the established project conventions.

---

## Technical Notes

### File Storage
- Use existing storage utilities from `src/lib/storage/`
- Support both Firebase and AWS storage providers
- Store file metadata in database
- Generate thumbnails for images if needed

### Security
- Validate all file uploads (type, size)
- Sanitize user inputs
- Rate limit upload requests
- Verify user ownership for cancellations
- Admin-only access for approval/rejection

### Performance
- Optimize file uploads (chunking for large files if needed)
- Paginate request lists
- Lazy load file previews
- Cache listing lookups

### Accessibility
- Proper form labels
- ARIA attributes
- Keyboard navigation
- Screen reader support
- Focus management

---

## Success Criteria

- ✅ Users can upload files and submit requests (logged in or anonymous)
- ✅ System matches requests to listings via reference number or email
- ✅ Admin receives email notification for new requests
- ✅ User receives confirmation email with cancellation link (if anonymous)
- ✅ Admin can view, approve, and reject requests in admin panel
- ✅ Logged-in users can view and cancel their requests
- ✅ Anonymous users can cancel via email link
- ✅ All file uploads are validated and stored securely
- ✅ UI matches the design from the provided image
- ✅ All error cases are handled gracefully

---

### Enhanced Prompt (Phase 4 Admin Upload Requests)
*objective*: Implement a full admin-facing workflow to review, approve, reject, and inspect media upload requests created via `mediaUploadRouter`, including paginated listing, filters, detail view, and actions that attach approved media to listings.

**context:**  
I’m working in a T3 stack app (Next.js 15 App Router + tRPC + Prisma + Shadcn + Tailwind). Upload requests are created via `src/server/api/routers/media-upload.ts` (`submitUploadRequest`, `getUploadRequest`, etc.) and stored in Prisma’s `MediaUploadRequest` model in `prisma/schema.prisma`. I already have an admin router and UI patterns: `src/server/api/routers/admin.ts` (e.g. `getAllListings`, `getConnectionRequests`, `approveConnectionRequest`, `rejectConnectionRequest`) and `src/app/admin/listings/page.tsx` (filters, pagination, actions). Media files live in `MediaAttachment` records and are uploaded through `StorageFactory` and `DEFAULT_STORAGE_CONFIG` in `src/lib/storage`. Emails for upload requests are sent via `sendUploadRequestEmails` in `src/lib/email/index.ts`. I need to extend the admin router and admin UI to manage `MediaUploadRequest` records (list, filter, inspect, approve, reject) while reusing existing admin patterns and respecting role-based access via `adminProcedure` from `src/server/api/trpc.ts`.

**instructions*:  
- **Server: Admin upload request procedures (`src/server/api/routers/admin.ts`)**  
  - Add a new `getAllUploadRequests` procedure using `adminProcedure.input(z.object({ page: z.number().min(1).default(1), limit: z.number().min(1).max(100).default(20), status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]).optional(), search: z.string().optional() }))`.  
  - Implement `getAllUploadRequests` to query `ctx.db.mediaUploadRequest.findMany` with:  
    - Pagination via `skip = (page - 1) * limit` and `take = limit`.  
    - `orderBy: { createdAt: "desc" }`.  
    - `include`:  
      - `listing: { select: { id, referenceNumber, manufacturer, model } }`.  
      - `user: { select: { id, name, email } }`.  
      - `reviewedBy: { select: { id, name, email } }`.  
    - `where` filters:  
      - If `status` is provided, filter by `status`.  
      - If `search` is provided, filter with an `OR` over: `email`, `contactName`, `referenceNumber`, and the related `listing.referenceNumber` (case-insensitive contains).  
  - Return `{ requests, total, page, limit, totalPages }`, where `total = ctx.db.mediaUploadRequest.count({ where })` and `totalPages = Math.ceil(total / limit)`.  
  - Add `approveUploadRequest` as `adminProcedure.input(z.object({ requestId: z.string().min(1), notes: z.string().optional() }))`.  
  - In `approveUploadRequest`:  
    - `findUnique` the `MediaUploadRequest` by `id`, including `listing`, `user`, and `reviewedBy`.  
    - If not found, throw a `TRPCError` `"NOT_FOUND"`.  
    - If `status !== "PENDING"`, throw a `TRPCError` `"BAD_REQUEST"` with a clear message that only pending requests can be approved.  
    - If `listingId` is present, parse `mediaFiles` JSON as an array of objects with `{ fileName, storagePath, fileType, fileSize }` (matching `fileMetadataSchema` from `media-upload.ts`).  
      - For each file:  
        - Derive `mimeType` from `fileType` (in `mediaFiles` we stored a MIME string).  
        - Classify `MediaFileType` (IMAGE, VIDEO, DOCUMENT) using the same logic as `classifyFileType` in `media-upload.ts` (either by importing/extracting a shared helper or duplicating the small mapping).  
        - Determine the `storageProvider` enum value (default to `StorageProvider.RAILWAY` if that’s the main provider, or map from `env.STORAGE_PROVIDER` to the `StorageProvider` Prisma enum).  
        - Create `MediaAttachment` records via `ctx.db.mediaAttachment.createMany` or a `Promise.all` over `create`, with fields: `listingId`, `fileName`, `fileType` (Prisma enum), `mimeType`, `fileSize`, `storageProvider`, `storagePath`, `displayOrder` (use the index or append after existing attachments).  
    - Update the `mediaUploadRequest` to `status = "APPROVED"`, set `reviewedById = ctx.session.user.id`, `reviewedAt = new Date()`, and optionally persist `notes` in a new or existing text field (if no field exists, skip storing notes and just use it for the email body).  
    - Return the updated request including `listing`, `user`, and `reviewedBy` so the UI has current data.  
    - Trigger an approval email to the user using a new helper (e.g. `sendUploadRequestStatusEmail`) or by extending `sendUploadRequestEmails` to handle status-change notifications, making sure failures are logged but non-fatal (similar to `submitUploadRequest`).  
  - Add `rejectUploadRequest` as `adminProcedure.input(z.object({ requestId: z.string().min(1), rejectionReason: z.string().min(1) }))`.  
  - In `rejectUploadRequest`:  
    - `findUnique` the `MediaUploadRequest` by `id`.  
    - Enforce `status === "PENDING"` as in approval; otherwise throw `"BAD_REQUEST"`.  
    - Update to `status = "REJECTED"`, set `rejectionReason`, `reviewedById`, and `reviewedAt`.  
    - Return the updated request (with `listing`, `user`, `reviewedBy` included for UI).  
    - Send a rejection email to the user including the reason, using the same email client/pattern as other upload emails.  
  - Add `getUploadRequestDetails` as `adminProcedure.input(z.object({ requestId: z.string().min(1) }))`.  
  - In `getUploadRequestDetails`:  
    - Query `ctx.db.mediaUploadRequest.findUnique` with `include`:  
      - `listing: { include: { contactInfo: true, listingDetails: true, mediaAttachments: { orderBy: { displayOrder: "asc" } } } }`.  
      - `user: { select: { id, name, email } }`.  
      - `reviewedBy: { select: { id, name, email } }`.  
    - If not found, throw `"NOT_FOUND"`.  
    - Return a shape that exposes:  
      - All primary fields (`contactName`, `email`, `phone`, `message`, `referenceNumber`, `status`, `rejectionReason`, `createdAt`, `updatedAt`, `reviewedAt`).  
      - Raw `mediaFiles` JSON parsed into a typed array for the UI (easy mapping to previews/download links).  
      - `listing` and `user` details when present.  
      - A lightweight `statusHistory` array derived from `createdAt` and `reviewedAt` (e.g. `[{ status: "PENDING", at: createdAt }, { status, at: reviewedAt }]`) to satisfy the “status history” requirement without adding new tables.  

- **Client: Admin list page (`src/app/admin/upload-requests/page.tsx`)**  
  - Create a client component similar to `AdminListingsPage`, using `api.admin.getAllUploadRequests.useQuery` and rendering a Shadcn `Table` with:  
    - Columns: Request ID (mono, truncated), Contact Name, Email, Listing Reference # (from request and/or related listing), Status, Files Count (derived from `mediaFiles.length`), Created Date, and Actions.  
    - A status badge component for upload requests (inline or shared), mapping:  
      - `"PENDING"` → yellow/orange `Badge`.  
      - `"APPROVED"` → green `Badge`.  
      - `"REJECTED"` → red `Badge`.  
      - `"CANCELLED"` → gray `Badge`.  
    - Filters section above the table:  
      - Status `Select` (All, Pending, Approved, Rejected, Cancelled) that maps to `status` in the query input (or `undefined` for “All”).  
      - Search `Input` that updates `search` state and resets `page` to 1; debouncing is nice-to-have but not required.  
    - Pagination controls using `page`, `data.totalPages`, and `data.total` (same UX as listings admin page).  
  - Implement loading and empty states:  
    - While `isLoading`, render a vertical stack of `Skeleton` rows matching the table width.  
    - If `data` is loaded but `data.requests.length === 0`, show a dashed border “No upload requests found” message.  
  - For the Actions column:  
    - A `View` button that routes to `/admin/upload-requests/${request.id}` via `useRouter().push`.  
    - Optional inline quick actions (Approve/Reject) for `PENDING` requests using Shadcn `Button`s and icons (e.g. check and X), wired to `api.admin.approveUploadRequest.useMutation` and `api.admin.rejectUploadRequest.useMutation`.  
    - Ensure buttons show loading spinners (`Loader2` icon) while mutations are pending and are disabled accordingly.  
    - On success/failure, show `toast.success` / `toast.error` messages with clear copy.  

- **Client: Request detail page (`src/app/admin/upload-requests/[id]/page.tsx`)**  
  - Create a `use client` page component that:  
    - Reads the `id` param from the segment and calls `api.admin.getUploadRequestDetails.useQuery({ requestId: id })`.  
    - Shows a top-level layout similar to the listings admin detail style (if any) or a simple two-column layout: left side for textual information, right side for media previews.  
  - In the detail view, display:  
    - Contact information (name, email, phone) with copyable email and clickable `mailto:` link.  
    - Listing information (if `listing` exists) including reference number, manufacturer, model, and a “View Listing” button linking to `/listings/${listing.id}`.  
    - The original message text in a readable card.  
    - A status section that shows the current status badge, created/updated timestamps, reviewer details (name + email) when available, and a simple chronological status history built from `createdAt` and `reviewedAt`.  
    - A media section that parses the returned `mediaFiles` array and:  
      - For image MIME types, show responsive `img` previews or `next/image` components with clickable thumbnails that open in a Shadcn `Dialog` or `media-preview-dialog`-style component.  
      - For non-image files (documents/videos), show file name, type, size (formatted), and a “Download” / “Open” link using the public URL derived from `storagePath` and your storage provider conventions (if not directly available, at minimum show file metadata and storage path).  
  - Add Approve / Reject buttons pinned near the top-right of the page for `PENDING` requests:  
    - Approve button opens a Shadcn `Dialog` (or `AlertDialog`) including an optional notes `Textarea`; on confirm, calls `api.admin.approveUploadRequest.useMutation({ requestId, notes })`.  
    - Reject button opens a similar dialog with a required rejection reason `Textarea`; on confirm, calls `api.admin.rejectUploadRequest.useMutation({ requestId, rejectionReason })`.  
    - Show loading indicators on these buttons, disable while pending, and display success/error toasts.  
    - On success, refetch the detail query (`void refetch()`) so the page reflects the new status and reviewer fields.  

- **Admin navigation and UX polish**  
  - In `src/app/admin/layout.tsx` (or the admin navigation component used there), add a new “Upload Requests” navigation link that routes to `/admin/upload-requests`.  
  - Optionally show a small badge with the count of pending upload requests; if you implement this, expose a lightweight `getPendingUploadRequestsCount` admin procedure that returns just `{ count }` and call it in the layout, caching the result and handling loading/empty gracefully.  
  - Ensure the new pages use the global top loading bar setup already in the app (e.g. navigating between list and detail should trigger the bar).  
  - Keep all UI fully responsive (stack filters vertically on small screens, ensure tables scroll horizontally on narrow viewports, constrain image preview sizes).  
  - Follow existing accessibility patterns: use semantic headings, label dialog inputs, provide `aria-label`s for icon-only buttons, and ensure focus handling for dialogs is correct.

*verfication*:  
- Seed or create several `MediaUploadRequest` records via the existing public flow, with various combinations: with and without `referenceNumber`, with and without `listingId`, and with different numbers/types of files.  
- In the admin list page, verify:  
  - Pagination works correctly and `totalPages` and `total` match the database.  
  - Status filter shows only requests with the selected status; “All” shows everything.  
  - Search finds requests by email, contact name, and listing reference number (both from the request and from related listing where applicable).  
- On the detail page, check that:  
  - All request fields, listing info, and user info are displayed correctly, including status and reviewer data after actions.  
  - Media files render with appropriate icons/previews based on MIME type and show correct size and file names.  
  - Approving a request with a `listingId` creates `MediaAttachment` records linked to that listing with correct `mimeType`, `fileSize`, `storagePath`, and `fileType` enum.  
  - Approve/reject mutations correctly update `status`, `reviewedById`, `reviewedAt`, and `rejectionReason`, and they are no-ops with clear errors when called on non-PENDING requests.  
  - Approval and rejection emails are sent (verify via Resend dashboard or logs when `RESEND_API_KEY`/`RESEND_FROM` are configured).  
- Confirm access control:  
  - Non-admin users cannot call `getAllUploadRequests`, `approveUploadRequest`, `rejectUploadRequest`, or `getUploadRequestDetails` (they should receive a tRPC `UNAUTHORIZED`/`FORBIDDEN` error via `adminProcedure`).  

*prefrences*:  
- Use latest stable TypeScript and modern React patterns with tRPC; do **not** use Next.js Server Actions for these operations—stick to tRPC procedures and React Server Components + client components as already established.  
- Follow the existing coding style and folder conventions: types in `src/types`, routers in `src/server/api/routers`, shared utilities in `src/lib`, reusable UI in `src/components`, and route-specific components under `src/app/admin/upload-requests`.  
- Use Shadcn UI components and Tailwind CSS to match the current admin look and feel; keep components small and readable, favoring clarity over micro-optimizations.  
- Implement clear loading states (skeleton rows, button spinners, top loading bar) and toast notifications for all admin actions that mutate state.  
- Keep input validation at the API layer with `zod` schemas, and ensure all string inputs (`search`, `rejectionReason`, `notes`) are trimmed and reasonably bounded in length to avoid abuse and UI overflow.
