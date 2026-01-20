# Sample Listing Page Implementation - Phased Prompts

This document contains independent, non-overlapping prompts for implementing the sample listing page feature. Each phase can be executed independently without dependencies on other phases.

---

## Phase 1: Sample Listing Page (Hardcoded Data)

**Objective:**  
Create a hardcoded sample listing page at `/sell/listing-sample` that demonstrates how a real listing will look, including all sections: INFO CHECK, Features, Documents, Quick Links, and Disclaimer.

**Context:**  
- We're using Next.js 15 App Router, T3 stack, Tailwind CSS, and shadcn/ui components
- Existing listing detail page: `src/app/listings/[id]/page.tsx`
- Existing components: `InfoCheckSection` and `VideosSection` in `src/app/sell/_components/`
- Sample listing link exists in `src/app/sell/_components/listing-boxes.tsx` but currently points to `#`
- Media preview dialog exists at `src/components/media-preview-dialog.tsx` (will be enhanced in Phase 2)

**Instructions:**

1. **Update Sample Listing Link**
   - File: `src/app/sell/_components/listing-boxes.tsx`
   - Change the SAMPLE LISTING item's `href` from `"#"` to `"/sell/listing-sample"`

2. **Create Sample Listing Page Structure**
   - Create new file: `src/app/sell/listing-sample/page.tsx`
   - Make it a client component (`"use client"`)
   - Import necessary components: Button, Card, Badge, Image from Next.js, etc.
   - Import icons from lucide-react: ArrowLeft, CheckCircle2, Camera, etc.

3. **Create Hardcoded Sample Data**
   - Define a `sampleListing` constant object inside the page component with:
     - `referenceNumber: "12345"`
     - `manufacturer: "Vermeer"`
     - `model: "D330X500"`
     - `year: "2008"`
     - `condition: "Machine Only!"`
     - `hours: "9,762 hours"`
     - `serialNumber: "VD123456789"`
     - `askingPrice: 479000`
     - `currency: "USD"`
     - `status: "SOLD"`
     - `city: "Fort Myers"`
     - `stateProvince: "Florida"`
     - `country: "United States"`
     - `contactName: "John Doe"`
     - `phone: "+1.239.237.3744"`
     - `email: "sales@hddbroker.com"`
     - `companyName: "HDD Broker LLC"`
     - `generalDescription`: Multi-line description about the machine's condition
     - `locatingSystems`: "DCI DigiTrak F5 locating system"
     - `mixingSystems`: "Vacuum mixing system with 300-gallon tank"
     - `accessories`: "Includes drill pipe, drill bits, and various tooling"
     - `trailers`: "Gooseneck trailer included"
     - `recentWorkModifications`: "Recently serviced by local Vermeer dealer"
     - `additionalInformation`: Additional details
     - `pipe`: "3-inch drill pipe, 20 pieces"
     - `features`: Array of feature strings like:
       - "Caterpillar C7.1 Engine"
       - "Pullback Capacity: 100,000 lbs"
       - "Torque: 12,000 ft-lbs"
       - "Carriage Speed: 0-120 fpm"
       - "Spindle Speed: 0-200 rpm"
       - "Ground Drive Speed: 0-2.5 mph"
       - "On-board Crane: 8,000 lb capacity"
       - "Track Size: 24 inches"
     - `images`: Array of at least 20-48 image objects with:
       - `id`, `fileName`, `storagePath` (use placeholder URLs like `https://picsum.photos/800/600?random={id}`)
       - `thumbnailUrl` (use `https://picsum.photos/200/200?random={id}`)
     - `videos`: Array of 2-3 video objects with similar structure
     - `documents`: Array with:
       - `{ id: "1", name: "Condition Report", sizeLabel: "376KB", url: "#" }`
       - `{ id: "2", name: "Service History", sizeLabel: "873KB", url: "#" }`

4. **Page Layout Structure**
   - Create a container with padding
   - Add "Back" button using ArrowLeft icon that navigates to `/sell`
   - Add full-width banner at top: "THIS IS A SAMPLE LISTING ONLY" (light gray background, centered, padding)
   - Create main grid layout: `lg:grid-cols-2` (two columns on large screens)

5. **Left Column - Media Gallery**
   - Main large image display (aspect-square or aspect-video)
   - Overlay "SOLD!" badge on top-left of main image (yellow background `bg-yellow-400`, text `text-yellow-900`, rounded, padding, shadow)
   - Below main image: "VIEW ALL PHOTOS" button/link with Camera icon
   - Below that: Grid of thumbnail images (4-6 columns, responsive)
   - Each thumbnail clickable (will open gallery dialog in Phase 2)
   - Show total count: "48 Photos"

6. **Right Column - Listing Info**
   - Title: Large heading with manufacturer, model, year
   - Reference number badge: Prominent display "#12345" (yellow badge style)
   - Condition text: "Machine Only! 9,762 hours"
   - Price: Large, bold "$479,000 USD"
   - Contact callout: "Call us at +1.239.237.3744"
   - Action buttons section (stacked vertically):
     - "Request More Info" button (golden-brown gradient, black text) → links to `/sell/listing-sample/request-info`
     - "Make An Offer" button (golden-brown gradient, black text) → disabled or shows toast "Login required"
     - "Watch Listing" button (dark gray gradient, white text) → disabled or shows toast "Login required"
     - "Notify Me" button (dark gray gradient, white text) → disabled or shows toast "Login required"
   - Quick links section:
     - "Request Shipping Quote »" (text link)
     - "Financing Options »" (text link)
     - "View Equipment Specs »" (text link)
   - Location card: City, State, Country
   - INFO CHECK section (small card):
     - Title: "INFO CHECK"
     - List of checkmarks:
       - Complete Description ✓
       - Detailed Photos ✓
       - Videos ✓
       - Complete Serial No. ✓
       - Inspection Reports ✓
       - Lien Disclosures ✓
       - Titles ✓
       - Service History ✓

7. **Full-Width Sections Below Grid**
   - **Description Section**: Card with title "DESCRIPTION"
     - General Description subsection
     - Locating Systems subsection
     - Mixing Systems subsection
     - Accessories subsection
     - Trailers subsection
     - Recent Work/Modifications subsection
     - Additional Information subsection
     - Pipe subsection
   - **Features Section**: Card with title "FEATURES INCLUDE"
     - Bulleted list of features from `sampleListing.features`
   - **Photos Section**: Card with title "PHOTOS"
     - Large grid of all thumbnail images (6 columns desktop, responsive)
     - "VIEW ALL PHOTOS" button that opens gallery (Phase 2)
   - **Videos Section**: Card with title "VIDEOS"
     - Grid of video thumbnails with play icon overlay
     - Each video clickable (will open in dialog)
   - **Documents Section**: Card with title "DOCUMENTS"
     - List of document links with file names and sizes
     - Download/view icons
   - **Disclaimer Section**: Small text at bottom
     - "While HDD Broker makes every effort to ensure the accuracy of the information provided by our Sellers, it is ultimately the Buyer's responsibility to confirm all details to their satisfaction prior to purchase. See our terms and conditions."

8. **Styling Notes**
   - Use Tailwind classes for all styling
   - Yellow badges: `bg-yellow-400 text-yellow-900 font-semibold rounded-lg px-3 py-1 shadow-md`
   - Golden-brown buttons: Use gradient like `bg-gradient-to-r from-amber-600 to-amber-700 text-black`
   - Dark gray buttons: `bg-gradient-to-r from-gray-700 to-gray-800 text-white`
   - Responsive: Mobile should stack columns vertically
   - Use existing shadcn Card, Button, Badge components

**Verification:**
- Visiting `/sell/listing-sample` shows complete page with all sections
- Sample banner visible at top
- "SOLD!" badge visible on main image
- Reference number prominently displayed
- All action buttons present
- All sections render: Description, Features, Photos, Videos, Documents, Disclaimer
- Page is responsive on mobile and desktop
- No TypeScript errors

**Preferences:**
- Keep all sample data hardcoded in the page component
- Reuse existing UI components where possible
- Make it visually appealing and modern while matching the reference design

---

## Phase 2: Enhanced MediaPreviewDialog (Backwards Compatible)

**Objective:**  
Enhance `MediaPreviewDialog` to support both single-file mode (existing) and multi-image gallery mode (new) with navigation, without breaking existing usage.

**Context:**
- Current file: `src/components/media-preview-dialog.tsx`
- Current API accepts single `file` prop
- Used in `src/app/listings/[id]/page.tsx` for single image preview
- Need to support gallery mode for sample listing page

**Instructions:**

1. **Extend Type Definitions (Backwards Compatible)**
   - Keep existing `MediaPreviewFile` type unchanged
   - Extend `MediaPreviewDialogProps` to support both modes:
     ```typescript
     type MediaPreviewDialogProps = {
       open: boolean;
       onOpenChange: (open: boolean) => void;
       file?: MediaPreviewFile | null; // Legacy single-file mode (optional now)
       files?: MediaPreviewFile[];     // New gallery mode
       initialIndex?: number;          // Starting index for gallery mode
     };
     ```
   - Make `file` optional (not required) to maintain backwards compatibility

2. **Mode Detection Logic**
   - Add internal state: `const [currentIndex, setCurrentIndex] = React.useState(0)`
   - Determine active mode:
     ```typescript
     const isGalleryMode = !!files && files.length > 0;
     const currentFile = isGalleryMode 
       ? files[currentIndex] 
       : file;
     ```
   - When dialog opens (`open` becomes `true`):
     - If gallery mode: set `currentIndex` to `initialIndex ?? 0`
     - If single-file mode: use `file` directly

3. **Navigation Controls (Gallery Mode Only)**
   - Add left/right arrow buttons (ChevronLeft, ChevronRight from lucide-react)
   - Position: Overlay on left and right sides of media area
   - Style: Circular buttons with semi-transparent background, hover effects
   - Navigation functions:
     ```typescript
     const goToPrevious = () => {
       setCurrentIndex((prev) => (prev === 0 ? files.length - 1 : prev - 1));
       setPlayingVideo(false); // Stop video if playing
     };
     const goToNext = () => {
       setCurrentIndex((prev) => (prev === files.length - 1 ? 0 : prev + 1));
       setPlayingVideo(false);
     };
     ```
   - Wrap around: Last image → First image, First image → Last image

4. **Index Indicator (Gallery Mode Only)**
   - Show counter in bottom bar: "Image 3 of 12" or "Video 1 of 3"
   - Update based on `currentIndex` and `files.length`
   - Display file type (Image/Video) dynamically

5. **Keyboard Navigation**
   - Add keyboard event listeners when dialog is open:
     - Left Arrow: `goToPrevious()` (gallery mode only)
     - Right Arrow: `goToNext()` (gallery mode only)
     - Escape: Already handled by Dialog component
   - Use `React.useEffect` to attach/detach listeners

6. **Video Behavior**
   - When navigating away from a video (in gallery mode), stop playback
   - Reset `playingVideo` state when `currentIndex` changes and current file is not a video
   - Preserve existing video play/pause logic

7. **UI Updates**
   - Keep existing layout structure (16:9 aspect ratio container, close button, file name bar)
   - In gallery mode:
     - Show navigation arrows (left/right)
     - Show index counter in bottom bar
     - Hide navigation arrows if only 1 file
   - In single-file mode:
     - No navigation arrows (existing behavior)
     - No index counter
   - Ensure smooth transitions when changing images

8. **Usage in Sample Listing Page**
   - In Phase 1 page, add state: `const [galleryOpen, setGalleryOpen] = React.useState(false)`
   - Add state: `const [galleryStartIndex, setGalleryStartIndex] = React.useState(0)`
   - When thumbnail clicked:
     ```typescript
     const handleThumbnailClick = (index: number) => {
       setGalleryStartIndex(index);
       setGalleryOpen(true);
     };
     ```
   - Render dialog:
     ```typescript
     <MediaPreviewDialog
       open={galleryOpen}
       onOpenChange={setGalleryOpen}
       files={sampleListing.images.map(img => ({
         preview: img.storagePath,
         name: img.fileName,
         type: "image"
       }))}
       initialIndex={galleryStartIndex}
     />
     ```

9. **Backwards Compatibility**
   - Ensure existing usage in `src/app/listings/[id]/page.tsx` still works:
     ```typescript
     <MediaPreviewDialog
       open={previewIndex !== null}
       onOpenChange={(open) => !open && setPreviewIndex(null)}
       file={{ preview: imageUrl, name: fileName, type: "image" }}
     />
     ```
   - This should work exactly as before (no changes needed to existing code)

**Verification:**
- Existing single-file usage in `/listings/[id]` page still works unchanged
- Gallery mode works in sample listing page
- Navigation arrows appear/disappear correctly
- Index counter shows correct numbers
- Keyboard navigation works (left/right arrows)
- Video playback stops when navigating away
- No TypeScript errors
- No breaking changes to existing code

**Preferences:**
- Keep component self-contained
- Use existing Dialog component from shadcn
- Smooth transitions between images
- Accessible (keyboard navigation, ARIA labels)

---

## Phase 3: Request More Info Page

**Objective:**  
Create a "Request More Info" form page at `/sell/listing-sample/request-info` that matches the reference design with modern UI components.

**Context:**
- Route: `/sell/listing-sample/request-info`
- Should link from "Request More Info" button on sample listing page
- Form should match the reference design but use modern components
- No backend integration needed (just UI + client-side validation)

**Instructions:**

1. **Create Page Structure**
   - Create: `src/app/sell/listing-sample/request-info/page.tsx`
   - Make it a client component (`"use client"`)
   - Import form components: Field, FieldLabel, FieldContent, Input, Textarea, Select
   - Import Button, Card components
   - Import icons: ArrowLeft, Mail, Phone

2. **Page Layout**
   - Container with max-width and centered layout
   - Light gray background (`bg-gray-50` or similar)
   - White card container with padding and shadow
   - "Back" button at top (ArrowLeft icon) linking to `/sell/listing-sample`

3. **Header Section**
   - Large title: "REQUEST MORE INFO"
   - Centered, bold, large font size

4. **"You Were Looking At" Section**
   - Card or section showing:
     - "Reference Number: **12345**" (bold)
     - Equipment description: "2008 Vermeer D330X500 – Machine Only! 9,762 hours"
   - Centered "Return to Listing" button (dark gray style) linking back to `/sell/listing-sample`

5. **"Ways to Contact HDD Broker" Section**
   - Title: "WAYS TO CONTACT HDD BROKER"
   - Two-column or stacked layout:
     - Phone: "+1.866.960.3331" and "+1.239.237.3744"
     - Email: "sales@hddbroker.com"
     - Link: "Other Ways to Contact Us" (can be `href="#"` for now)

6. **Form Section**
   - Title: "SUBMIT YOUR REQUEST HERE"
   - Use `react-hook-form` with `zod` validation (following existing patterns)
   - Form fields:
     - **Reference Number**: Pre-filled, read-only input showing "12345"
     - **Name***: Required text input
     - **Company**: Optional text input
     - **Phone***: Required text input (with phone validation)
     - **Email***: Required email input (with email validation)
     - **Preferred Language**: Select dropdown with options:
       - English (default)
       - Spanish
       - French
       - Other
     - **Your Message***: Required textarea with placeholder "Please specify what additional information you would like to see..."
   - Use Field, FieldLabel, FieldContent components for consistent styling
   - Show validation errors below each field

7. **reCAPTCHA Section**
   - Simple checkbox with label "I'm not a robot"
   - Links: "Privacy" and "Terms" (can be `href="#"` for now)
   - Style to look like reCAPTCHA checkbox (no actual integration needed)

8. **Submit Button**
   - Large, prominent button: "Submit Request"
   - Orange/yellow gradient style matching the reference
   - On click:
     - Validate form
     - If valid: Show success toast "Your request has been submitted (demo only)"
     - If invalid: Show validation errors
   - No actual API call needed

9. **Styling**
   - Match reference design as closely as possible
   - Use existing Tailwind classes
   - Form should be clean and professional
   - Submit button should stand out (orange/yellow gradient)

**Verification:**
- Page renders at `/sell/listing-sample/request-info`
- All sections visible: header, "You were looking at", contact info, form
- Reference number pre-filled and read-only
- Form validation works (required fields show errors)
- Submit button shows success message
- "Return to Listing" button navigates correctly
- Page is responsive

**Preferences:**
- Use existing form patterns from signup/login forms
- Keep it simple and self-contained
- No backend integration needed

---

## Notes

- Each phase is independent and can be implemented separately
- Phase 1 creates the main sample listing page
- Phase 2 enhances the media preview dialog (used by Phase 1)
- Phase 3 creates the request info form page (linked from Phase 1)
- All phases use hardcoded sample data - no database queries needed
- Future phases can add login integration, API calls, etc.

