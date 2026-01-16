# Implementation Prompts - Listing System with Dual Storage

Each prompt below is self-contained and can be used independently. Use the format: `/en` followed by the prompt content.

---

## PHASE 1: Prisma Schema Models

**Use this prompt when:** You need to create the database models for the listing system.

```
*objective*: Create comprehensive Prisma schema models to store all listing data including contact information, listing details, media attachments, and availability tracking for single-unit equipment listings.

*context*:
- Working in a T3 stack project with Next.js 15, tRPC, Prisma, PostgreSQL, and Better Auth
- Current schema has User, Post, Session, Account, and Verification models
- Need to store equipment listing data from a multi-step form with: contact info, listing info (price, manufacturer, model, etc.), listing details (descriptions), and media attachments (images/videos)
- Each listing represents a single piece of equipment that can be bought (only 1 unit available)
- Project structure: prisma/schema.prisma for schema, src/server/db.ts for Prisma client

*instructions*:
- Create the following Prisma models in prisma/schema.prisma:
  1. **Listing Model**:
     - id (String, cuid), status (Enum: DRAFT, PENDING_REVIEW, PUBLISHED, RESERVED, SOLD, ARCHIVED), availabilityStatus (Enum: AVAILABLE, RESERVED, SOLD, UNAVAILABLE)
     - Pricing: askingPrice (Decimal), currency (String), soldPrice (Decimal, optional)
     - Equipment: year (String), manufacturer (String), model (String), condition (String), serialNumber (String), hours (String, optional), miles (String, optional), repossessed (Boolean, default false)
     - Location: equipmentCity (String, optional), equipmentStateProvince (String, optional), equipmentPostalCode (String, optional), equipmentCountry (String, optional)
     - Availability: soldAt (DateTime, optional), reservedAt (DateTime, optional), reservedUntil (DateTime, optional), soldTo (String, optional), soldNotes (String, optional)
     - Timestamps: createdAt, updatedAt
     - Relations: userId (User), contactInfoId (ContactInfo), listingDetailsId (ListingDetails, optional, one-to-one)
     - Indexes: [status, availabilityStatus], [availabilityStatus], [status], [soldAt], [createdAt], [manufacturer], [model], [year]

  2. **ContactInfo Model**:
     - id (String, cuid), contactName (String), companyName (String, optional)
     - Address: addressLine1 (String), addressLine2 (String, optional), city (String), stateProvince (String), postalCode (String, optional), country (String)
     - Contact: phone (String), email (String), website (String, optional)
     - Marketing: hearAboutUs (String array), hearAboutUsOther (String, optional)
     - Legal: acceptTerms (Boolean)
     - Timestamps: createdAt, updatedAt
     - Relation: listings (one-to-many with Listing)
     - Index: [email]

  3. **ListingDetails Model**:
     - id (String, cuid)
     - All optional text fields: generalDescription, locatingSystems, mixingSystems, accessories, trailers, recentWorkModifications, additionalInformation, pipe
     - Timestamps: createdAt, updatedAt
     - Relation: listing (one-to-one with Listing, optional)

  4. **MediaAttachment Model**:
     - id (String, cuid), listingId (String), fileName (String), fileType (Enum: IMAGE, VIDEO, DOCUMENT), mimeType (String), fileSize (Int, in bytes)
     - Storage: storageProvider (Enum: FIREBASE, AWS), storagePath (String - URL or path), thumbnailUrl (String, optional)
     - Display: displayOrder (Int, default 0)
     - Timestamps: uploadedAt, createdAt, updatedAt
     - Relation: listing (many-to-one with Listing)
     - Indexes: [listingId], [storageProvider], [listingId, displayOrder]

  5. **Update User Model**:
     - Add relation: listings (one-to-many with Listing)

  6. **Create Enums**:
     - ListingStatus: DRAFT, PENDING_REVIEW, PUBLISHED, RESERVED, SOLD, ARCHIVED
     - AvailabilityStatus: AVAILABLE, RESERVED, SOLD, UNAVAILABLE
     - MediaFileType: IMAGE, VIDEO, DOCUMENT
     - StorageProvider: FIREBASE, AWS

- Use PostgreSQL-compatible types (String, Decimal, DateTime, Boolean, Int)
- Add appropriate @default() values where needed
- Use @map() to match existing naming conventions if needed
- Ensure all foreign keys have proper cascade delete behavior
- Add comments to complex fields for documentation

*verification*:
- Run `bun run db:generate` to ensure schema compiles
- Check that all relations are properly defined
- Verify indexes are created for performance-critical queries
- Ensure enum values match the status flow requirements
- Test that User model relation doesn't break existing Better Auth setup

*preferences*:
- Follow existing Prisma schema style and conventions
- Use cuid() for all id fields
- Keep field names camelCase
- Add helpful comments for complex models
- Ensure backward compatibility with existing models
```

---

## PHASE 1 (ENHANCED): Prisma Schema Models

**Use this prompt when:** You need to create the database models for the listing system with codebase-specific details and exact field mappings from the form.

```
*objective*: Create comprehensive Prisma schema models to store all listing data including contact information, listing details, media attachments, and availability tracking for single-unit equipment listings, matching the exact form structure from src/app/sell/list/_components/listing-form.tsx.

*context*:
- Working in a T3 stack project with Next.js 15, tRPC, Prisma, PostgreSQL, and Better Auth
- Current schema at prisma/schema.prisma has User, Post, Session, Account, and Verification models using cuid() for IDs and @map() for table names
- Existing User model uses String @id (not cuid) and has relations: sessions, accounts, posts
- Listing form exists at src/app/sell/list/_components/listing-form.tsx with 5 steps collecting:
  - Step 1 (Contact Info): contactName, companyName, addressLine1, addressLine2, city, stateProvince, postalCode, country, phone, email, website, hearAboutUs (array), hearAboutUsOther, acceptTerms
  - Step 2 (Listing Info): askingPrice, currency, year, manufacturer, model, condition, serialNumber, hours, miles, repossessed, sameAsContactAddress, equipmentCity, equipmentStateProvince, equipmentPostalCode, equipmentCountry
  - Step 3 (Listing Details): generalDescription, locatingSystems, mixingSystems, accessories, trailers, recentWorkModifications, additionalInformation, pipe (all optional)
  - Step 4 (Attachments): attachments (array of File objects)
- Form uses zod schema (listingFormSchema) with exact field names that must match Prisma model fields
- Each listing represents a single piece of equipment (only 1 unit available)
- Project structure: prisma/schema.prisma for schema, src/server/db.ts for Prisma client, src/server/api/routers/ for tRPC routers
- Existing tRPC router pattern: src/server/api/routers/post.ts shows protectedProcedure and publicProcedure usage
- Environment config at src/env.js uses @t3-oss/env-nextjs with zod validation

*instructions*:
- Create the following Prisma models in prisma/schema.prisma (add after existing models, before the closing of the file):

  1. **Create Enums** (add before models, after datasource):
     - enum ListingStatus: DRAFT, PENDING_REVIEW, PUBLISHED, RESERVED, SOLD, ARCHIVED
     - enum AvailabilityStatus: AVAILABLE, RESERVED, SOLD, UNAVAILABLE
     - enum MediaFileType: IMAGE, VIDEO, DOCUMENT
     - enum StorageProvider: FIREBASE, AWS

  2. **ContactInfo Model**:
     - id: String @id @default(cuid())
     - contactName: String (required, matches form field exactly)
     - companyName: String? (optional, matches form field)
     - addressLine1: String (required)
     - addressLine2: String? (optional)
     - city: String (required)
     - stateProvince: String (required)
     - postalCode: String? (optional)
     - country: String (required)
     - phone: String (required)
     - email: String (required, indexed for lookups)
     - website: String? (optional)
     - hearAboutUs: String[] (array, matches form field - PostgreSQL array type)
     - hearAboutUsOther: String? (optional)
     - acceptTerms: Boolean @default(false) (required, matches form field)
     - createdAt: DateTime @default(now())
     - updatedAt: DateTime @updatedAt
     - listings: Listing[] (one-to-many relation)
     - @@index([email])
     - @@map("contact_info") (snake_case for table name, matching existing pattern like "user", "session", "account")

  3. **ListingDetails Model**:
     - id: String @id @default(cuid())
     - generalDescription: String? (optional, matches form field)
     - locatingSystems: String? (optional)
     - mixingSystems: String? (optional)
     - accessories: String? (optional)
     - trailers: String? (optional)
     - recentWorkModifications: String? (optional)
     - additionalInformation: String? (optional)
     - pipe: String? (optional, matches form field)
     - createdAt: DateTime @default(now())
     - updatedAt: DateTime @updatedAt
     - listing: Listing? (one-to-one optional relation, back-reference)
     - @@map("listing_details")

  4. **Listing Model**:
     - id: String @id @default(cuid())
     - status: ListingStatus @default(DRAFT) (matches workflow: draft → published → sold)
     - availabilityStatus: AvailabilityStatus @default(UNAVAILABLE) (separate from status for filtering)
     - Pricing fields (match form exactly):
       - askingPrice: Decimal @db.Decimal(10, 2) (required, use Decimal for precision)
       - currency: String (required, matches form: USD, GBP, EUR, CAD)
       - soldPrice: Decimal? @db.Decimal(10, 2) (optional, set when marked as sold)
     - Equipment fields (match form exactly):
       - year: String (required, matches form - stored as string for flexibility, not Int)
       - manufacturer: String (required, indexed for search)
       - model: String (required, indexed for search)
       - condition: String (required, matches form: Excellent, Good, Fair, Poor)
       - serialNumber: String (required)
       - hours: String? (optional, stored as string, not Int)
       - miles: String? (optional, stored as string, not Int)
       - repossessed: Boolean @default(false) (matches form field)
     - Location fields (match form):
       - equipmentCity: String? (optional)
       - equipmentStateProvince: String? (optional)
       - equipmentPostalCode: String? (optional)
       - equipmentCountry: String? (optional)
     - Availability tracking:
       - soldAt: DateTime? (set when marked as sold)
       - reservedAt: DateTime? (set when reserved)
       - reservedUntil: DateTime? (expiry for reservations)
       - soldTo: String? (buyer information)
       - soldNotes: String? (notes about sale)
     - Timestamps:
       - createdAt: DateTime @default(now())
       - updatedAt: DateTime @updatedAt
     - Relations:
       - userId: String (foreign key to User)
       - user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
       - contactInfoId: String (foreign key to ContactInfo)
       - contactInfo: ContactInfo @relation(fields: [contactInfoId], references: [id], onDelete: Cascade)
       - listingDetailsId: String? (optional foreign key to ListingDetails)
       - listingDetails: ListingDetails? @relation(fields: [listingDetailsId], references: [id], onDelete: Cascade)
       - mediaAttachments: MediaAttachment[] (one-to-many)
     - Indexes for performance:
       - @@index([status, availabilityStatus]) (compound for filtering)
       - @@index([availabilityStatus]) (for public browse queries)
       - @@index([status]) (for user dashboard filtering)
       - @@index([soldAt]) (for sold listings queries)
       - @@index([createdAt]) (for sorting by newest)
       - @@index([manufacturer]) (for search/filter)
       - @@index([model]) (for search/filter)
       - @@index([year]) (for search/filter)
     - @@map("listing")

  5. **MediaAttachment Model**:
     - id: String @id @default(cuid())
     - listingId: String (foreign key, required)
     - fileName: String (original filename)
     - fileType: MediaFileType (IMAGE, VIDEO, or DOCUMENT)
     - mimeType: String (e.g., "image/jpeg", "video/mp4")
     - fileSize: Int (size in bytes)
     - storageProvider: StorageProvider @default(FIREBASE)
     - storagePath: String (URL or storage path)
     - thumbnailUrl: String? (optional, for images/videos)
     - displayOrder: Int @default(0) (for ordering attachments)
     - uploadedAt: DateTime @default(now())
     - createdAt: DateTime @default(now())
     - updatedAt: DateTime @updatedAt
     - listing: Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
     - Indexes:
       - @@index([listingId]) (for fetching listing attachments)
       - @@index([storageProvider]) (for provider-specific queries)
       - @@index([listingId, displayOrder]) (compound for ordered queries)
     - @@map("media_attachment")

  6. **Update User Model** (modify existing model):
     - Add relation: listings: Listing[] (one-to-many)
     - Keep all existing fields and relations unchanged (sessions, accounts, posts)
     - Do NOT change the id field (it uses String @id, not cuid)

- Follow existing schema patterns exactly:
  - Use String @id @default(cuid()) for new models (except User which uses String @id)
  - Use @map() with snake_case for table names (e.g., @@map("contact_info")) matching existing pattern
  - Use onDelete: Cascade for foreign keys to maintain data integrity
  - Use @db.Decimal(10, 2) for price fields to ensure precision
  - Add @@index() for fields used in WHERE clauses, ORDER BY, or JOINs
  - Use DateTime @default(now()) and @updatedAt for timestamps
  - Keep field names camelCase to match TypeScript conventions
  - Use String? for optional fields (nullable)
  - Use String[] for array fields (PostgreSQL array type)
  - Match the exact field names from listing-form.tsx zod schema

- Ensure data integrity:
  - All foreign keys must reference existing records
  - Cascade deletes: deleting a Listing deletes its MediaAttachments and ListingDetails
  - Deleting a User deletes their Listings (and cascades to related data)
  - ContactInfo can be shared across listings (no cascade from ContactInfo to Listing)

*verification*:
- Run `bun run db:generate` (or `bunx prisma generate`) to ensure schema compiles without errors
- Verify Prisma Client types are generated correctly in generated/prisma/ directory
- Check that all relations are properly defined using `bunx prisma validate`
- Verify indexes are created for performance-critical queries (status, availabilityStatus, manufacturer, model, year)
- Ensure enum values match the status flow requirements (DRAFT → PUBLISHED → RESERVED/SOLD → ARCHIVED)
- Test that User model relation doesn't break existing Better Auth setup (sessions, accounts still work)
- Verify field names match exactly with form schema in listing-form.tsx (contactName, askingPrice, generalDescription, etc.)
- Check that optional fields are properly nullable (String? not String)
- Ensure Decimal fields use proper precision (@db.Decimal(10, 2))
- Verify cascade delete behavior is correct (test with Prisma Studio or migration)
- Compare generated types with form types to ensure compatibility

*preferences*:
- Follow existing Prisma schema style exactly (see User, Post models as reference)
- Use cuid() for all new model IDs (String @id @default(cuid()))
- Keep field names camelCase to match TypeScript/JavaScript conventions
- Use snake_case for table names via @map() (matching existing pattern: "user", "session", "account")
- Add helpful comments above complex models explaining relationships
- Ensure backward compatibility with existing models (don't modify User, Post, Session, Account, Verification)
- Match form field names exactly (contactName, askingPrice, generalDescription, etc.)
- Use String for year, hours, miles (not Int) to match form flexibility
- Use String[] for hearAboutUs array field (PostgreSQL array type)
- Keep all timestamps consistent (createdAt, updatedAt pattern matching existing models)
- Use proper PostgreSQL types (Decimal for money, String[] for arrays, DateTime for dates)
- Follow the exact structure of existing models (generator, datasource, model order)
```

---

## PHASE 2.1: Storage Abstraction Layer

**Use this prompt when:** You need to create the storage interface and factory pattern before implementing specific storage providers.

```
*objective*: Create a storage abstraction layer with interface and factory pattern to support multiple storage providers (Firebase primary, AWS future) for file uploads in the listing system.

*context*:
- Working in a T3 stack with Next.js 15, tRPC, TypeScript
- Need to upload images, videos, and documents for equipment listings
- Must support Firebase Storage (primary) and AWS S3 (future) with ability to switch providers
- Project structure: src/lib/ for utility functions, src/server/ for server-side code
- Files will be uploaded from tRPC procedures and need to return URLs for database storage

*instructions*:
- Create storage interface at src/lib/storage/interface.ts:
  - Define IStorageProvider interface with methods:
    - upload(file: File, path: string, metadata?: Record<string, any>): Promise<{ url: string, path: string, thumbnailUrl?: string }>
    - delete(path: string): Promise<void>
    - getUrl(path: string, expiresIn?: number): Promise<string>
    - generateThumbnail?(path: string): Promise<string> (optional)
  - Define StorageMetadata type for file metadata
  - Define UploadResult type for upload responses

- Create storage factory at src/lib/storage/index.ts:
  - Export StorageFactory class with static method getProvider(): IStorageProvider
  - Read STORAGE_PROVIDER env variable (default: "firebase")
  - Return appropriate provider instance (FirebaseStorageProvider or AWSStorageProvider)
  - Handle invalid provider errors gracefully

- Create provider stubs at:
  - src/lib/storage/firebase.ts: Export FirebaseStorageProvider class implementing IStorageProvider (placeholder for Phase 2.2)
  - src/lib/storage/aws.ts: Export AWSStorageProvider class implementing IStorageProvider (placeholder for Phase 2.3)

- Create types file at src/lib/storage/types.ts:
  - Define all shared types: StorageMetadata, UploadResult, StorageProviderType, etc.

- Add error handling:
  - Create StorageError class extending Error
  - Handle file size limits, invalid file types, network errors
  - Provide meaningful error messages

*verification*:
- TypeScript compiles without errors
- StorageFactory.getProvider() returns correct provider based on env
- Interface is properly typed and all methods are defined
- Error handling is comprehensive
- Can import and use in tRPC procedures

*preferences*:
- Use TypeScript strict mode
- Follow existing code style and conventions
- Export types and interfaces for external use
- Keep code DRY and well-documented
- Use async/await patterns consistently
```

---

## PHASE 2.1: Storage Abstraction Layer (ENHANCED)

**Use this prompt when:** You need to create the storage interface and factory pattern before implementing specific storage providers.

```
*objective*: Create a comprehensive storage abstraction layer with interface and factory pattern to support multiple storage providers (Firebase primary, AWS future) for file uploads in the equipment listing system. The layer must handle images, videos, and documents with proper validation, error handling, and type safety.

*context*:
- Working in a T3 stack with Next.js 15 App Router, tRPC, TypeScript, Bun runtime
- Project structure: src/lib/ for utility functions, src/server/api/routers/ for tRPC routes
- Prisma schema already defines MediaAttachment model with StorageProvider enum (FIREBASE, AWS) and MediaFileType enum (IMAGE, VIDEO, DOCUMENT)
- Environment variables managed through src/env.js using @t3-oss/env-nextjs with zod validation
- Files will be uploaded from tRPC procedures in src/server/api/routers/ and need to return URLs for database storage
- Existing ImageUploadDialog component at src/components/image-upload-dialog.tsx handles UI but needs backend storage integration
- MediaAttachment model expects: storagePath, storageProvider, thumbnailUrl (optional), fileSize, mimeType, fileName
- Must support file validation (size limits, MIME types), thumbnail generation for images, and signed URL generation for private files

*instructions*:
- Create storage directory structure at src/lib/storage/:
  - interface.ts: Define IStorageProvider interface with methods:
    - upload(file: File | Buffer, path: string, metadata?: StorageMetadata): Promise<UploadResult>
    - delete(path: string): Promise<void>
    - getUrl(path: string, expiresIn?: number): Promise<string>
    - generateThumbnail?(file: File | Buffer, path: string): Promise<string> (optional, for images)
    - validateFile?(file: File | Buffer): Promise<{ valid: boolean; error?: string }> (optional)
  - types.ts: Define all shared types:
    - StorageMetadata: { contentType?: string; customMetadata?: Record<string, string>; cacheControl?: string }
    - UploadResult: { url: string; path: string; thumbnailUrl?: string; size: number; mimeType: string }
    - StorageProviderType: "firebase" | "aws"
    - FileValidationResult: { valid: boolean; error?: string }
    - StorageConfig: { maxFileSize: number; allowedMimeTypes: string[]; generateThumbnails: boolean }
  - errors.ts: Create custom error classes:
    - StorageError (base class extending Error)
    - FileSizeExceededError extends StorageError
    - InvalidFileTypeError extends StorageError
    - UploadFailedError extends StorageError
    - DeleteFailedError extends StorageError
    - NetworkError extends StorageError
  - index.ts: Export StorageFactory class:
    - Static method getProvider(): IStorageProvider
    - Read STORAGE_PROVIDER env variable from env.js (add to server schema with default: "firebase")
    - Return singleton instance of appropriate provider (FirebaseStorageProvider or AWSStorageProvider)
    - Handle invalid provider errors with meaningful messages
    - Implement lazy initialization pattern
  - firebase.ts: Export FirebaseStorageProvider class implementing IStorageProvider:
    - Placeholder implementation that throws "Not implemented" errors
    - Proper TypeScript types and method signatures
    - Comment indicating this will be implemented in Phase 2.2
  - aws.ts: Export AWSStorageProvider class implementing IStorageProvider:
    - Placeholder implementation that throws "Not implemented" errors
    - Proper TypeScript types and method signatures
    - Comment indicating this will be implemented in Phase 2.3

- Update src/env.js:
  - Add STORAGE_PROVIDER to server schema: z.enum(["firebase", "aws"]).default("firebase")
  - Add to runtimeEnv object
  - Add validation for Firebase and AWS credentials (optional for now, required in later phases)

- Create utility functions at src/lib/storage/utils.ts:
  - validateFileSize(file: File | Buffer, maxSize: number): boolean
  - validateMimeType(mimeType: string, allowedTypes: string[]): boolean
  - generateStoragePath(prefix: string, fileName: string, userId?: string): string
  - extractMimeType(file: File | Buffer, fileName?: string): string
  - getFileExtension(fileName: string): string

- Add comprehensive JSDoc comments to all public interfaces and methods
- Export all types and interfaces for use in tRPC procedures
- Ensure all code follows existing project conventions (async/await, error handling patterns)

*verification*:
- TypeScript compiles without errors (run: bun run typecheck)
- StorageFactory.getProvider() returns correct provider instance based on STORAGE_PROVIDER env
- All interface methods are properly typed and return correct Promise types
- Error classes extend StorageError and provide meaningful error messages
- Can import and use StorageFactory in tRPC procedures: import { StorageFactory } from "@/lib/storage"
- Environment variable validation works correctly in env.js
- Utility functions handle edge cases (empty files, missing extensions, etc.)
- Code passes Biome linting (if configured)
- All exports are properly typed and documented

*preferences*:
- Use TypeScript strict mode with proper type annotations
- Follow existing code style (check src/lib/utils.ts and src/server/api/routers/post.ts for patterns)
- Use async/await consistently, avoid mixing with .then() chains
- Keep code DRY - extract common logic to utility functions
- Add JSDoc comments for all public APIs
- Use descriptive variable and function names
- Handle edge cases gracefully with proper error messages
- Export types separately for better tree-shaking
- Use const assertions where appropriate for type safety
- Prefer functional programming patterns where it improves readability
```

---

## PHASE 2.2: Firebase Storage Provider Implementation

**Use this prompt when:** You need to implement Firebase Storage as the primary storage provider.

```
*objective*: Implement Firebase Storage provider for uploading and managing media files (images, videos, documents) for equipment listings with proper error handling, URL generation, and thumbnail support.

*context*:
- Working in a T3 stack with Next.js 15, tRPC, TypeScript
- Storage abstraction layer already exists (Phase 2.1)
- Need to integrate Firebase Admin SDK for server-side file operations
- Files should be organized in listings/{listingId}/{type}/{filename} structure
- Must generate signed URLs for secure file access
- Project structure: src/lib/storage/ for storage code, src/server/ for server-side operations

*instructions*:
- Install dependencies: `firebase-admin` package
- Create Firebase configuration at src/lib/storage/firebase/config.ts:
  - Initialize Firebase Admin with service account credentials
  - Get storage bucket from environment variable
  - Export initialized admin and bucket instances
  - Handle initialization errors gracefully

- Implement FirebaseStorageProvider at src/lib/storage/firebase.ts:
  - Implement IStorageProvider interface from Phase 2.1
  - upload() method:
    - Accept File object, path string, and optional metadata
    - Validate file size (max 10MB images, 100MB videos)
    - Validate file type (images: jpg, png, webp; videos: mp4, webm; documents: pdf)
    - Upload to Firebase Storage at path: listings/{listingId}/{type}/{timestamp}-{sanitized-filename}
    - Set metadata (contentType, customMetadata with listingId, fileType, etc.)
    - Generate download URL (signed URL with 1 year expiry)
    - For images, optionally generate thumbnail (resize to 300x300, store at thumbnails/ path)
    - Return { url, path, thumbnailUrl? }
  - delete() method:
    - Delete file from Firebase Storage by path
    - Also delete thumbnail if exists
    - Handle file not found errors gracefully
  - getUrl() method:
    - Generate signed URL for existing file
    - Accept optional expiresIn parameter (default 1 year)
    - Return downloadable URL
  - generateThumbnail() method (optional):
    - Resize image to 300x300px
    - Upload to thumbnails/ subdirectory
    - Return thumbnail URL

- Update environment configuration (src/env.js):
  - Add FIREBASE_PROJECT_ID (string)
  - Add FIREBASE_STORAGE_BUCKET (string)
  - Add FIREBASE_SERVICE_ACCOUNT_KEY (string, JSON stringified)
  - Add STORAGE_PROVIDER (enum: "firebase" | "aws", default: "firebase")

- Create utility functions at src/lib/storage/firebase/utils.ts:
  - sanitizeFilename(): Clean filename for storage
  - validateFileType(): Check if file type is allowed
  - validateFileSize(): Check if file size is within limits
  - generateStoragePath(): Create organized path structure

*verification*:
- Can upload image file and receive URL
- Can upload video file and receive URL
- Can delete uploaded file
- Can generate signed URL for existing file
- File size validation works correctly
- File type validation rejects invalid types
- Thumbnail generation works for images (if implemented)
- Error handling works for network failures, invalid credentials, etc.
- Files are organized correctly in Firebase Storage console

*preferences*:
- Use Firebase Admin SDK (server-side only)
- Generate signed URLs with appropriate expiry
- Implement proper error handling and logging
- Follow Firebase Storage best practices
- Keep file paths organized and predictable
- Use TypeScript strict mode
- Add JSDoc comments for complex methods
```

---

## PHASE 2.2: Firebase Storage Provider Implementation (Enhanced)

**Use this prompt when:** You need to implement Firebase Storage as the primary storage provider with complete functionality.

```
*objective*: Implement a complete Firebase Storage provider for uploading and managing media files (images, videos, documents) for equipment listings with comprehensive error handling, signed URL generation, thumbnail support, and proper file validation. The implementation must integrate seamlessly with the existing storage abstraction layer (Phase 2.1) and support both File and Buffer inputs.

*context*:
- Working in a T3 stack with Next.js 15 App Router, tRPC, TypeScript, Bun runtime
- Storage abstraction layer already exists at src/lib/storage/ with IStorageProvider interface
- Firebase Storage provider placeholder exists at src/lib/storage/firebase.ts (currently throws errors)
- Environment configuration exists at src/env.js with STORAGE_PROVIDER enum already defined
- Storage utilities exist at src/lib/storage/utils.ts for file validation and path generation
- Storage error classes exist at src/lib/storage/errors.ts
- Files should be organized in listings/{listingId}/{type}/{timestamp}-{sanitized-filename} structure
- Must generate signed URLs for secure file access (1 year expiry default)
- Project structure: src/lib/storage/ for storage code, src/server/ for server-side operations
- Need to support both browser File objects and Node.js Buffer objects
- Must validate file sizes: max 10MB for images, 100MB for videos, 10MB for documents
- Must validate file types: images (jpg, png, webp), videos (mp4, webm), documents (pdf)

*instructions*:
- Install firebase-admin package using Bun: `bun add firebase-admin`
- Create Firebase configuration at src/lib/storage/firebase/config.ts:
  - Import initializeApp and cert from firebase-admin/app
  - Import getStorage from firebase-admin/storage
  - Parse FIREBASE_SERVICE_ACCOUNT_KEY from environment (JSON stringified)
  - Initialize Firebase Admin app with service account credentials
  - Get storage bucket instance from FIREBASE_STORAGE_BUCKET environment variable
  - Export initialized admin app and bucket instances
  - Handle initialization errors gracefully with try-catch
  - Add proper TypeScript types for service account credentials
  - Validate that required environment variables are present

- Implement complete FirebaseStorageProvider at src/lib/storage/firebase.ts:
  - Import IStorageProvider interface, StorageFile type, StorageMetadata, UploadResult types
  - Import error classes: UploadFailedError, DeleteFailedError, NetworkError, FileSizeExceededError, InvalidFileTypeError
  - Import utility functions: validateFileSize, validateMimeType, extractMimeType, getFileSize, generateStoragePath
  - Import Firebase config (bucket instance)
  - Implement IStorageProvider interface completely

  - upload() method implementation:
    - Accept file (File | Buffer), path string, and optional StorageMetadata
    - Convert File to Buffer if needed (use arrayBuffer() for File objects)
    - Extract MIME type using extractMimeType utility
    - Validate file size based on MIME type (10MB images/docs, 100MB videos)
    - Validate file type using validateMimeType with allowed types from DEFAULT_STORAGE_CONFIG
    - Throw FileSizeExceededError or InvalidFileTypeError if validation fails
    - Create file reference in Firebase Storage bucket at the provided path
    - Upload buffer with metadata: contentType, customMetadata (listingId, fileType, uploadedAt timestamp)
    - Set cacheControl metadata for images/videos
    - Generate signed download URL with 1 year expiry (31536000 seconds)
    - For images, optionally generate thumbnail using generateThumbnail method
    - Return UploadResult with url, path, thumbnailUrl (if generated), size, mimeType
    - Wrap Firebase errors in appropriate StorageError subclasses
    - Handle network errors and retry logic if needed

  - delete() method implementation:
    - Accept path string
    - Get file reference from bucket
    - Check if file exists before attempting deletion
    - Delete file from Firebase Storage
    - Also delete thumbnail if exists (check thumbnails/ subdirectory)
    - Handle file not found errors gracefully (don't throw if file doesn't exist)
    - Throw DeleteFailedError for actual deletion failures
    - Wrap Firebase errors appropriately

  - getUrl() method implementation:
    - Accept path string and optional expiresIn number (default: 31536000 = 1 year)
    - Get file reference from bucket
    - Check if file exists
    - Generate signed URL with specified expiry
    - Return downloadable URL string
    - Handle file not found errors
    - Wrap Firebase errors in NetworkError

  - generateThumbnail() method implementation (optional but recommended):
    - Accept file (File | Buffer) and path string
    - Check if file is an image (MIME type starts with "image/")
    - Use sharp library for image processing (install: bun add sharp)
    - Resize image to 300x300px maintaining aspect ratio
    - Convert to Buffer
    - Generate thumbnail path: replace filename with thumbnails/{filename}
    - Upload thumbnail to Firebase Storage
    - Generate signed URL for thumbnail
    - Return thumbnail URL string
    - Handle errors gracefully (return empty string or throw if critical)

- Update environment configuration (src/env.js):
  - Add FIREBASE_PROJECT_ID: z.string().min(1) in server schema
  - Add FIREBASE_STORAGE_BUCKET: z.string().min(1) in server schema
  - Add FIREBASE_SERVICE_ACCOUNT_KEY: z.string().min(1) in server schema (JSON stringified service account)
  - STORAGE_PROVIDER already exists with enum ["firebase", "aws"] and default "firebase"
  - Add all three to runtimeEnv object with process.env references

- Create utility functions at src/lib/storage/firebase/utils.ts (if needed for Firebase-specific operations):
  - sanitizeFilename(): Clean filename for Firebase Storage (remove special chars, ensure valid)
  - validateFileType(): Firebase-specific file type validation (can reuse existing validateMimeType)
  - validateFileSize(): Firebase-specific size validation (can reuse existing validateFileSize)
  - generateStoragePath(): Create organized path structure listings/{listingId}/{type}/{filename}
  - convertFileToBuffer(): Helper to convert File to Buffer for Firebase operations

- Update StorageFactory at src/lib/storage/index.ts:
  - Ensure FirebaseStorageProvider import works correctly
  - Verify factory pattern returns FirebaseStorageProvider instance when STORAGE_PROVIDER="firebase"

*verification*:
- Can upload image file (jpg, png, webp) and receive signed URL
- Can upload video file (mp4, webm) and receive signed URL
- Can upload document file (pdf) and receive signed URL
- Can delete uploaded file by path
- Can generate signed URL for existing file with custom expiry
- File size validation works correctly (rejects files > 10MB for images, > 100MB for videos)
- File type validation rejects invalid types (e.g., .exe, .zip)
- Thumbnail generation works for images (creates 300x300 thumbnail)
- Error handling works for network failures, invalid credentials, missing files
- Files are organized correctly in Firebase Storage console (listings/{listingId}/{type}/ structure)
- Both File and Buffer inputs work correctly
- Custom metadata (listingId, fileType) is stored correctly
- Signed URLs are accessible and expire after specified time
- Thumbnail deletion works when main file is deleted

*preferences*:
- Use Firebase Admin SDK exclusively (server-side only, never client-side)
- Generate signed URLs with 1 year expiry by default (configurable)
- Implement comprehensive error handling with custom error classes
- Follow Firebase Storage best practices (organized paths, metadata, cache control)
- Keep file paths organized and predictable (listings/{listingId}/{type}/{timestamp}-{filename})
- Use TypeScript strict mode with proper type annotations
- Add JSDoc comments for all public methods
- Use existing utility functions from src/lib/storage/utils.ts where possible
- Handle both File and Buffer types seamlessly
- Use sharp for image processing (thumbnail generation)
- Implement proper logging for debugging (console.error for errors)
- Validate all inputs before Firebase operations
- Use async/await pattern consistently
- Export FirebaseStorageProvider class for direct use if needed
```

---

## PHASE 3: tRPC Listing Router with Availability Management

**Use this prompt when:** You need to create the tRPC router for listing CRUD operations, file uploads, and availability status management.

_context_:

- Working in a T3 stack with Next.js 15, tRPC, Prisma, TypeScript
- Prisma models already created (Phase 1)
- Storage abstraction layer exists (Phase 2.1)
- Firebase storage implemented (Phase 2.2)
- Project structure: src/server/api/routers/ for routers, src/server/api/root.ts for router registration
- Using protectedProcedure for authenticated routes, publicProcedure for public routes
- Better Auth is used for authentication

_instructions_:

- Create listing router at src/server/api/routers/listing.ts:
  1. **Import dependencies**:
     - tRPC procedures, zod for validation, Prisma client, storage factory
     - Create input schemas using zod for all procedures
  2. **Create listing procedures**:
     - create: protectedProcedure
       - Input: contactInfo, listingInfo, listingDetails (all form data)
       - Create ContactInfo record
       - Create ListingDetails record (if provided)
       - Create Listing record with status DRAFT, availabilityStatus UNAVAILABLE
       - Link all relations
       - Return created listing with relations
     - update: protectedProcedure
       - Input: listingId, updated data (partial)
       - Verify user owns the listing
       - Update listing and related records
       - Return updated listing
     - publish: protectedProcedure
       - Input: listingId
       - Verify user owns listing
       - Validate all required fields are present
       - Update: status to PUBLISHED, availabilityStatus to AVAILABLE
       - Return updated listing
     - reserve: protectedProcedure
       - Input: listingId, reservedUntil (optional DateTime)
       - Verify listing is PUBLISHED and AVAILABLE
       - Update: status to RESERVED, availabilityStatus to RESERVED, reservedAt to now, reservedUntil
       - Return updated listing
     - markAsSold: protectedProcedure
       - Input: listingId, soldPrice (optional), soldTo (optional), soldNotes (optional)
       - Verify listing is PUBLISHED or RESERVED
       - Update: status to SOLD, availabilityStatus to SOLD, soldAt to now, soldPrice, soldTo, soldNotes
       - Return updated listing
     - releaseReservation: protectedProcedure
       - Input: listingId
       - Verify listing is RESERVED and user owns it
       - Update: status to PUBLISHED, availabilityStatus to AVAILABLE, clear reservedAt and reservedUntil
       - Return updated listing
     - archive: protectedProcedure
       - Input: listingId
       - Verify user owns listing
       - Update: status to ARCHIVED, availabilityStatus to UNAVAILABLE
       - Return updated listing

  3. **Query procedures**:
     - getById: publicProcedure
       - Input: listingId
       - Return listing with all relations (contactInfo, listingDetails, mediaAttachments, user)
       - Include availability status
     - getByUser: protectedProcedure
       - Get all listings for current user
       - Filter by status (optional input)
       - Return array of listings with relations
     - getAvailable: publicProcedure
       - Input: filters (manufacturer, model, year, condition, price range, etc.), pagination
       - Filter: status = PUBLISHED AND availabilityStatus = AVAILABLE
       - Apply search filters
       - Return paginated results
     - getSold: protectedProcedure (admin or owner only)
       - Get all SOLD listings
       - Optional: filter by userId
       - Return array with sale information

  4. **Media upload procedures**:
     - uploadMedia: protectedProcedure
       - Input: listingId, files (FormData or array of files)
       - Verify user owns listing
       - Validate: max 5 files, file size limits, file types
       - For each file:
         - Upload to storage using StorageFactory.getProvider()
         - Create MediaAttachment record in database
         - Set displayOrder based on upload order
       - Return array of created MediaAttachment records with URLs
     - deleteMedia: protectedProcedure
       - Input: listingId, mediaId
       - Verify user owns listing
       - Get MediaAttachment record
       - Delete file from storage
       - Delete MediaAttachment record from database
       - Return success

  5. **Validation schemas**:
     - Create comprehensive zod schemas for all inputs
     - Validate file types, sizes, counts
     - Validate status transitions
     - Validate required fields for publishing

- Register router in src/server/api/root.ts:
  - Import listing router
  - Add to root router: listing: listingRouter

- Create types file at src/types/listing.ts:
  - Export TypeScript types matching Prisma models
  - Export input/output types for tRPC procedures

_verification_:

- All procedures compile without TypeScript errors
- Can create a listing with all data
- Can upload media files and see URLs in database
- Status transitions work correctly (draft → published → sold)
- Availability filtering works (only AVAILABLE listings show in getAvailable)
- User ownership verification works
- File validation works (rejects invalid files)
- Pagination works for getAvailable
- Error messages are clear and helpful

_preferences_:

- Use zod for all input validation
- Follow existing tRPC router patterns
- Use protectedProcedure for authenticated operations
- Return proper error messages with tRPC error handling
- Keep procedures focused and single-purpose
- Add JSDoc comments for complex procedures
- Use TypeScript strict mode
- Follow existing code style

```

---

## PHASE 3 ENHANCED: tRPC Listing Router with Availability Management

**Use this prompt when:** You need to create the tRPC router for listing CRUD operations, file uploads, and availability status management with comprehensive type safety and error handling.

*objective*: Create a complete tRPC router at `src/server/api/routers/listing.ts` that handles all listing operations including CRUD, status management, media uploads, and availability tracking. The router must integrate with the existing Prisma schema, storage abstraction layer, and Better Auth authentication system.

*context*:
- Working in `e:\projects\endev\hdd-redesign` with T3 stack (Next.js 15, tRPC, Prisma, TypeScript, Better Auth)
- Prisma models exist: `Listing`, `ContactInfo`, `ListingDetails`, `MediaAttachment` with enums `ListingStatus`, `AvailabilityStatus`, `MediaFileType`, `StorageProvider`
- Storage abstraction layer exists at `src/lib/storage/` with `StorageFactory.getProvider()` method
- Firebase storage provider is implemented and working
- tRPC setup at `src/server/api/trpc.ts` with `protectedProcedure` and `publicProcedure` available
- Session context available via `ctx.session.user.id` in protected procedures
- Existing router pattern: `src/server/api/routers/post.ts` shows the structure
- Router registration in `src/server/api/root.ts` needs listing router added
- Database client available via `ctx.db` in procedures
- Project uses Bun runtime, Biome lint, Shadcn UI components

*instructions*:
- Create `src/server/api/routers/listing.ts`:
  1. **Imports and Setup**:
     - Import `createTRPCRouter`, `protectedProcedure`, `publicProcedure` from `@/server/api/trpc`
     - Import `z` from `zod` for validation schemas
     - Import `TRPCError` from `@trpc/server` for error handling
     - Import Prisma client types: `ListingStatus`, `AvailabilityStatus`, `MediaFileType`, `StorageProvider` from `@/generated/prisma`
     - Import `StorageFactory` from `@/lib/storage`
     - Import `DEFAULT_STORAGE_CONFIG` from `@/lib/storage/types`
     - Import `generateStoragePath`, `validateFileSize`, `validateMimeType`, `extractMimeType`, `getFileSize` from `@/lib/storage/utils`

  2. **Zod Validation Schemas**:
     - `contactInfoSchema`: contactName, companyName (optional), addressLine1, addressLine2 (optional), city, stateProvince, postalCode (optional), country, phone, email, website (optional), hearAboutUs (array), hearAboutUsOther (optional), acceptTerms (boolean)
     - `listingDetailsSchema`: All fields optional (generalDescription, locatingSystems, mixingSystems, accessories, trailers, recentWorkModifications, additionalInformation, pipe)
     - `listingInfoSchema`: year, manufacturer, model, condition, serialNumber, askingPrice (decimal), currency, hours (optional), miles (optional), repossessed (boolean), equipmentCity (optional), equipmentStateProvince (optional), equipmentPostalCode (optional), equipmentCountry (optional)
     - `createListingSchema`: contactInfo (contactInfoSchema), listingInfo (listingInfoSchema), listingDetails (listingDetailsSchema, optional)
     - `updateListingSchema`: listingId, contactInfo (partial, optional), listingInfo (partial, optional), listingDetails (partial, optional)
     - `publishListingSchema`: listingId
     - `reserveListingSchema`: listingId, reservedUntil (optional DateTime)
     - `markAsSoldSchema`: listingId, soldPrice (optional decimal), soldTo (optional string), soldNotes (optional string)
     - `releaseReservationSchema`: listingId
     - `archiveListingSchema`: listingId
     - `getByUserSchema`: status (optional ListingStatus enum)
     - `getAvailableSchema`: manufacturer (optional), model (optional), year (optional), condition (optional), minPrice (optional decimal), maxPrice (optional decimal), page (optional, default 1), limit (optional, default 20)
     - `getSoldSchema`: userId (optional string)
     - `uploadMediaSchema`: listingId, files (array of base64 strings or file objects - handle both browser File and server Buffer)
     - `deleteMediaSchema`: listingId, mediaId

  3. **Helper Functions**:
     - `verifyListingOwnership(listingId, userId)`: Check if listing exists and user owns it, throw TRPCError if not
     - `validateListingForPublish(listing)`: Check all required fields are present, throw TRPCError with details if missing
     - `validateStatusTransition(currentStatus, newStatus)`: Validate allowed transitions (DRAFT→PUBLISHED, PUBLISHED→RESERVED/SOLD/ARCHIVED, RESERVED→PUBLISHED/SOLD/ARCHIVED, etc.)
     - `determineMediaFileType(mimeType)`: Map MIME type to MediaFileType enum (IMAGE, VIDEO, DOCUMENT)
     - `processFileUpload(file, listingId, displayOrder)`: Upload file using StorageFactory, return MediaAttachment data

  4. **Mutation Procedures** (all use protectedProcedure):
     - `create`:
       - Input: createListingSchema
       - Create ContactInfo record
       - Create ListingDetails record if provided
       - Create Listing with status DRAFT, availabilityStatus UNAVAILABLE, link relations
       - Return created listing with all relations (contactInfo, listingDetails, user)
     - `update`:
       - Input: updateListingSchema
       - Verify ownership using verifyListingOwnership
       - Update ContactInfo if provided
       - Update ListingDetails if provided (create if doesn't exist)
       - Update Listing fields if provided
       - Return updated listing with relations
     - `publish`:
       - Input: publishListingSchema
       - Verify ownership
       - Validate listing for publish using validateListingForPublish
       - Update: status to PUBLISHED, availabilityStatus to AVAILABLE
       - Return updated listing
     - `reserve`:
       - Input: reserveListingSchema
       - Verify listing exists and is PUBLISHED with availabilityStatus AVAILABLE
       - Update: status to RESERVED, availabilityStatus to RESERVED, reservedAt to now, reservedUntil if provided
       - Return updated listing
     - `markAsSold`:
       - Input: markAsSoldSchema
       - Verify listing is PUBLISHED or RESERVED
       - Update: status to SOLD, availabilityStatus to SOLD, soldAt to now, soldPrice, soldTo, soldNotes
       - Return updated listing
     - `releaseReservation`:
       - Input: releaseReservationSchema
       - Verify listing is RESERVED and user owns it
       - Update: status to PUBLISHED, availabilityStatus to AVAILABLE, clear reservedAt and reservedUntil
       - Return updated listing
     - `archive`:
       - Input: archiveListingSchema
       - Verify ownership
       - Update: status to ARCHIVED, availabilityStatus to UNAVAILABLE
       - Return updated listing

  5. **Query Procedures**:
     - `getById`: publicProcedure
       - Input: z.object({ listingId: z.string() })
       - Find listing by ID with all relations (contactInfo, listingDetails, mediaAttachments, user)
       - Include availability status
       - Return listing or throw NOT_FOUND error
     - `getByUser`: protectedProcedure
       - Input: getByUserSchema
       - Find all listings for ctx.session.user.id
       - Filter by status if provided
       - Order by createdAt desc
       - Return array with relations
     - `getAvailable`: publicProcedure
       - Input: getAvailableSchema
       - Filter: status = PUBLISHED AND availabilityStatus = AVAILABLE
       - Apply filters (manufacturer, model, year, condition, price range)
       - Implement pagination (page, limit)
       - Order by createdAt desc
       - Return: { listings: array, total: number, page: number, limit: number, totalPages: number }
     - `getSold`: protectedProcedure
       - Input: getSoldSchema
       - Filter: status = SOLD
       - Filter by userId if provided (only if requesting user is admin or owns the listings)
       - Return array with sale information and relations

  6. **Media Upload Procedures**:
     - `uploadMedia`: protectedProcedure
       - Input: uploadMediaSchema
       - Verify ownership
       - Validate: max 5 files total per listing, file size limits (use DEFAULT_STORAGE_CONFIG.maxFileSize), file types (use DEFAULT_STORAGE_CONFIG.allowedMimeTypes)
       - Get current media count for listing
       - For each file:
         - Validate file size and MIME type
         - Generate storage path using generateStoragePath with listingId
         - Upload to storage using StorageFactory.getProvider().upload()
         - Determine MediaFileType from MIME type
         - Create MediaAttachment record with: fileName, fileType, mimeType, fileSize, storageProvider (from env), storagePath, displayOrder (current count + index), listingId
         - Handle thumbnail generation if provider supports it
       - Return array of created MediaAttachment records with URLs
     - `deleteMedia`: protectedProcedure
       - Input: deleteMediaSchema
       - Verify ownership
       - Find MediaAttachment record
       - Delete file from storage using StorageFactory.getProvider().delete(storagePath)
       - Delete MediaAttachment record from database
       - Return { success: true, message: "Media deleted successfully" }

  7. **Error Handling**:
     - Use TRPCError with appropriate codes: UNAUTHORIZED, NOT_FOUND, BAD_REQUEST, FORBIDDEN, INTERNAL_SERVER_ERROR
     - Provide clear error messages
     - Log errors for debugging (console.error in development)
     - Handle storage errors gracefully with try-catch

  8. **Type Safety**:
     - Use Prisma types for database operations
     - Use zod inferred types for inputs
     - Export router output types for frontend use

- Register router in `src/server/api/root.ts`:
  - Import: `import { listingRouter } from "@/server/api/routers/listing";`
  - Add to appRouter: `listing: listingRouter,`
  - Maintain existing post router

- Create types file at `src/types/listing.ts`:
  - Export Prisma types: `import type { Listing, ContactInfo, ListingDetails, MediaAttachment, ListingStatus, AvailabilityStatus, MediaFileType } from "@prisma/client";`
  - Re-export these types
  - Create utility types: `ListingWithRelations`, `ContactInfoWithListings`, etc.
  - Export input types from router using tRPC inference utilities

*verification*:
- All procedures compile without TypeScript errors
- Can create a listing with contactInfo, listingInfo, and optional listingDetails
- Can update listing fields individually
- Can publish a listing (validates required fields)
- Can reserve a published listing
- Can mark listing as sold with optional sale details
- Can release reservation (returns to PUBLISHED/AVAILABLE)
- Can archive a listing
- Can upload up to 5 media files per listing
- File validation works (rejects files > 50MB, invalid MIME types)
- Can delete media files (removes from storage and database)
- getById returns listing with all relations
- getByUser returns only current user's listings
- getAvailable only returns PUBLISHED + AVAILABLE listings
- getAvailable pagination works correctly
- getAvailable filters work (manufacturer, model, year, condition, price range)
- User ownership verification prevents unauthorized access
- Status transitions are validated (can't go from DRAFT to SOLD directly)
- Error messages are clear and helpful
- Storage integration works (files upload to Firebase, URLs stored correctly)
- MediaAttachment records created with correct displayOrder

*preferences*:
- Use zod for all input validation with descriptive error messages
- Follow existing tRPC router patterns from `post.ts`
- Use protectedProcedure for authenticated operations, publicProcedure only for getById and getAvailable
- Return proper error messages with tRPC error handling (TRPCError)
- Keep procedures focused and single-purpose
- Add JSDoc comments for complex procedures explaining business logic
- Use TypeScript strict mode
- Follow existing code style (Biome formatting)
- Use async/await consistently
- Handle Prisma errors gracefully (unique constraints, foreign keys, etc.)
- Use transactions for multi-step operations (create listing with relations)
- Validate decimal precision for price fields
- Use Prisma enums directly (don't create separate TypeScript enums)
- Export router type for frontend inference: `export type ListingRouter = typeof listingRouter;`

---

## PHASE 4: Environment Configuration

**Use this prompt when:** You need to update environment variables for storage providers and listing system.

```

_objective_: Update environment configuration to support Firebase Storage and future AWS S3 storage providers with proper validation and type safety.

_context_:

- Working in a T3 stack with Next.js 15, using @t3-oss/env-nextjs for env validation
- Current env.js has: BETTER_AUTH_SECRET, BETTER_AUTH_GITHUB_CLIENT_ID, BETTER_AUTH_GITHUB_CLIENT_SECRET, DATABASE_URL, NODE_ENV
- Need to add Firebase and AWS storage configuration
- Project structure: src/env.js for environment validation

_instructions_:

- Update src/env.js:
  1. **Add Firebase environment variables** (server-side):
     - FIREBASE_PROJECT_ID: z.string().min(1)
     - FIREBASE_STORAGE_BUCKET: z.string().min(1)
     - FIREBASE_SERVICE_ACCOUNT_KEY: z.string() (JSON stringified service account key)
     - Make Firebase vars optional in development if not using Firebase yet
  2. **Add AWS environment variables** (server-side, optional for now):
     - AWS_ACCESS_KEY_ID: z.string().optional()
     - AWS_SECRET_ACCESS_KEY: z.string().optional()
     - AWS_REGION: z.string().optional()
     - AWS_S3_BUCKET_NAME: z.string().optional()
  3. **Add storage provider configuration** (server-side):
     - STORAGE_PROVIDER: z.enum(["firebase", "aws"]).default("firebase")
  4. **Update runtimeEnv object**:
     - Add all new environment variables
     - Handle optional variables appropriately
  5. **Add validation logic** (optional):
     - If STORAGE_PROVIDER is "firebase", require Firebase vars
     - If STORAGE_PROVIDER is "aws", require AWS vars
     - Add helpful error messages for missing required vars

- Create .env.example file (if doesn't exist) or update it:
  - Add all new environment variables with example values
  - Add comments explaining each variable
  - Mark optional variables clearly

- Update README.md (if exists):
  - Document new environment variables
  - Add setup instructions for Firebase
  - Add setup instructions for AWS (future)

_verification_:

- Environment validation works correctly
- Missing required vars show helpful error messages
- Optional vars don't cause errors when undefined
- TypeScript types are generated correctly
- Can access env variables in code with type safety
- .env.example is up to date

_preferences_:

- Use @t3-oss/env-nextjs patterns
- Keep server/client separation clear
- Provide helpful error messages
- Document all environment variables
- Follow existing env.js structure and style

```

---

## PHASE 4: Environment Configuration (ENHANCED)

**Use this prompt when:** You need to update environment variables for storage providers and listing system with complete validation and documentation.

```

_objective_: Update environment configuration to support Firebase Storage and AWS S3 storage providers with proper validation, type safety, conditional requirements based on storage provider selection, and comprehensive documentation.

**context**:

- Working in a T3 stack with Next.js 15, using @t3-oss/env-nextjs for env validation
- Current env.js has: BETTER_AUTH_SECRET, BETTER_AUTH_GITHUB_CLIENT_ID, BETTER_AUTH_GITHUB_CLIENT_SECRET, DATABASE_URL, NODE_ENV, STORAGE_PROVIDER, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET, FIREBASE_SERVICE_ACCOUNT_KEY
- Firebase variables are currently required but should be optional in development when not using Firebase
- Need to add AWS S3 storage configuration variables (optional for now)
- Need conditional validation: require Firebase vars only when STORAGE_PROVIDER is "firebase", require AWS vars only when STORAGE_PROVIDER is "aws"
- Project structure: src/env.js for environment validation, src/lib/storage/ for storage implementations
- Firebase storage is already implemented in src/lib/storage/firebase/config.ts
- No .env.example file exists yet
- README.md needs environment variable documentation

\*_instructions_:

- Update src/env.js:
  1. **Make Firebase variables conditionally required**:
     - FIREBASE_PROJECT_ID: Required only when STORAGE_PROVIDER is "firebase" or in production, optional in development
     - FIREBASE_STORAGE_BUCKET: Required only when STORAGE_PROVIDER is "firebase" or in production, optional in development
     - FIREBASE_SERVICE_ACCOUNT_KEY: Required only when STORAGE_PROVIDER is "firebase" or in production, optional in development
     - Use z.string().min(1).optional() for development, z.string().min(1) for production or when provider is firebase
  2. **Add AWS environment variables** (server-side, optional):
     - AWS_ACCESS_KEY_ID: z.string().optional()
     - AWS_SECRET_ACCESS_KEY: z.string().optional()
     - AWS_REGION: z.string().optional() (e.g., "us-east-1")
     - AWS_S3_BUCKET_NAME: z.string().optional()
  3. **Update STORAGE_PROVIDER validation**:
     - Keep: STORAGE_PROVIDER: z.enum(["firebase", "aws"]).default("firebase")
     - Ensure it's properly typed
  4. **Update runtimeEnv object**:
     - Add all AWS environment variables
     - Ensure all Firebase variables are included
     - Handle optional variables appropriately (use undefined if not set)
  5. **Add conditional validation logic using refine or superRefine**:
     - If STORAGE_PROVIDER is "firebase", validate that FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET, and FIREBASE_SERVICE_ACCOUNT_KEY are present
     - If STORAGE_PROVIDER is "aws", validate that AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and AWS_S3_BUCKET_NAME are present
     - Add helpful error messages: "FIREBASE_PROJECT_ID is required when STORAGE_PROVIDER is 'firebase'" etc.
     - Use z.refine() or z.superRefine() on the server schema object
  6. **Maintain existing structure**:
     - Keep server/client separation
     - Keep skipValidation and emptyStringAsUndefined settings
     - Follow existing code style and comments

- Create .env.example file:
  1. **Add all existing environment variables**:
     - BETTER_AUTH_SECRET (with comment explaining it's optional in development)
     - BETTER_AUTH_GITHUB_CLIENT_ID
     - BETTER_AUTH_GITHUB_CLIENT_SECRET
     - DATABASE_URL
     - NODE_ENV
  2. **Add storage provider section with comments**:
     - STORAGE_PROVIDER=firebase (with comment: "Storage provider: 'firebase' or 'aws'")
  3. **Add Firebase section with comments**:
     - FIREBASE_PROJECT_ID=your-project-id (with comment: "Required when STORAGE_PROVIDER is 'firebase'")
     - FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com (with comment: "Required when STORAGE_PROVIDER is 'firebase'")
     - FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...} (with comment: "JSON stringified service account key. Required when STORAGE_PROVIDER is 'firebase'")
  4. **Add AWS section with comments**:
     - AWS_ACCESS_KEY_ID=your-access-key (with comment: "Required when STORAGE_PROVIDER is 'aws'")
     - AWS_SECRET_ACCESS_KEY=your-secret-key (with comment: "Required when STORAGE_PROVIDER is 'aws'")
     - AWS_REGION=us-east-1 (with comment: "Required when STORAGE_PROVIDER is 'aws'")
     - AWS_S3_BUCKET_NAME=your-bucket-name (with comment: "Required when STORAGE_PROVIDER is 'aws'")
  5. **Format**:
     - Use clear section headers with comments
     - Group related variables together
     - Add blank lines between sections for readability
     - Mark optional vs required clearly

- Update README.md:
  1. **Add Environment Variables section**:
     - Explain the environment setup process
     - Reference .env.example file
     - Explain the use of @t3-oss/env-nextjs for validation
  2. **Add Firebase Setup subsection**:
     - Steps to get Firebase project ID
     - Steps to get Firebase storage bucket name
     - Steps to generate and configure service account key
     - How to stringify the JSON service account key for FIREBASE_SERVICE_ACCOUNT_KEY
     - Link to Firebase documentation
  3. **Add AWS Setup subsection** (mark as future/optional):
     - Steps to create AWS account
     - Steps to create IAM user with S3 permissions
     - Steps to get access key ID and secret access key
     - Steps to create S3 bucket
     - How to set AWS_REGION
     - Link to AWS documentation
     - Mark as "Future implementation" or "Optional"
  4. **Add Storage Provider Configuration subsection**:
     - Explain STORAGE_PROVIDER variable
     - Explain conditional requirements based on provider
     - Show examples for both providers
  5. **Maintain existing README content**:
     - Keep T3 stack information
     - Keep deployment guides references
     - Add new section before or after deployment section

_verification_:

- Environment validation works correctly with all combinations:
  - STORAGE_PROVIDER=firebase requires Firebase vars (test with missing vars to see error)
  - STORAGE_PROVIDER=aws requires AWS vars (test with missing vars to see error)
  - Missing required vars show helpful, specific error messages
  - Optional vars don't cause errors when undefined
  - TypeScript types are generated correctly (check autocomplete in IDE)
  - Can access env variables in code with type safety (e.g., env.STORAGE_PROVIDER, env.FIREBASE_PROJECT_ID)
  - .env.example file exists and is complete with all variables
  - README.md documents all environment variables and setup steps
  - Firebase config in src/lib/storage/firebase/config.ts still works with updated env variables
  - Development mode allows optional Firebase vars when STORAGE_PROVIDER is not "firebase"
  - Production mode or when STORAGE_PROVIDER is "firebase" requires Firebase vars

_preferences_:

- Use @t3-oss/env-nextjs patterns and best practices
- Keep server/client separation clear and consistent
- Provide helpful, specific error messages that guide users to fix issues
- Document all environment variables with clear explanations
- Follow existing env.js structure, style, and formatting
- Use z.refine() or z.superRefine() for conditional validation (prefer superRefine for multiple conditions)
- Make .env.example user-friendly with clear comments and sections
- Keep README.md professional and well-organized
- Ensure backward compatibility with existing Firebase implementation

```

---

## PHASE 5: Frontend Integration

**Use this prompt when:** You need to integrate the listing form with tRPC mutations and update the UI to handle file uploads and availability status.

```

_objective_: Integrate the multi-step listing form with tRPC mutations, implement file upload functionality, and add availability status management UI.

_context_:

- Working in a T3 stack with Next.js 15, tRPC, React Hook Form, TypeScript
- Listing form exists at src/app/sell/list/\_components/listing-form.tsx with 5 steps
- Form uses react-hook-form with zod validation
- Storage and tRPC router are implemented (Phases 2.2 and 3)
- Project structure: src/app/sell/list/ for listing pages, src/components/ for reusable components

_instructions_:

- Update listing-form.tsx:
  1. **Import tRPC hooks**:
     - Import useTRPC from src/trpc/react
     - Get listing router mutations: create, update, uploadMedia
  2. **Update onSubmit handler**:
     - Use tRPC create mutation
     - Split form data into: contactInfo, listingInfo, listingDetails
     - Handle file uploads separately (or as part of create)
     - Show loading state during submission
     - Show success toast and redirect on success
     - Show error toast on failure
     - Handle validation errors from server
  3. **Add file upload integration**:
     - Update attachments-step.tsx to use tRPC uploadMedia mutation
     - Upload files when user selects them (or on step completion)
     - Show upload progress for each file
     - Display uploaded file URLs from storage
     - Handle upload errors gracefully
     - Update form state with uploaded file metadata
  4. **Add draft saving** (optional):
     - Auto-save form data to localStorage
     - Restore draft on component mount
     - Save draft on form changes (debounced)
  5. **Add availability status UI**:
     - Create status badge component showing: DRAFT, PUBLISHED, RESERVED, SOLD
     - Show status in listing cards and detail pages
     - Add status management buttons for sellers (Mark as Sold, Reserve, etc.)
     - Only show available listings in public browse/search pages

- Create listing management page at src/app/sell/listings/page.tsx:
  - Show user's listings in a table/card grid
  - Display status, availability, created date
  - Add actions: Edit, Publish, Mark as Sold, Archive
  - Filter by status
  - Use tRPC getByUser query

- Update buy page (src/app/buy/page.tsx):
  - Use tRPC getAvailable query
  - Filter by availabilityStatus = AVAILABLE
  - Add filters for manufacturer, model, year, price range
  - Show loading states and pagination
  - Hide sold/reserved listings

- Create listing detail page at src/app/listings/[id]/page.tsx:
  - Use tRPC getById query
  - Display all listing information
  - Show media attachments with preview
  - Show availability status
  - Show contact info (if user is owner or admin)
  - Add "Mark as Sold" button for owner

- Add toast notifications:
  - Use sonner or similar toast library
  - Show success/error messages for all mutations
  - Show upload progress for file uploads

- Add loading states:
  - Use top loading bar (react-top-loading-bar) for page loads
  - Show skeleton loaders for listings
  - Disable buttons during mutations
  - Show spinner on submit buttons

_verification_:

- Can submit listing form and create listing in database
- File uploads work and show in UI
- Availability status displays correctly
- Status management buttons work (publish, mark as sold, etc.)
- Public browse page only shows available listings
- User's listings page shows all statuses
- Loading states work correctly
- Error handling shows helpful messages
- Form validation works on client and server

_preferences_:

- Use tRPC React hooks for all API calls
- Follow existing component patterns
- Use Shadcn UI components
- Implement proper loading states
- Add toast notifications for user feedback
- Keep form state management clean
- Use TypeScript strict mode
- Follow existing code style

```

---

## PHASE 5: Frontend Integration (ENHANCED)

**Use this prompt when:** You need to integrate the listing form with tRPC mutations and update the UI to handle file uploads and availability status.

```

_objective_: Integrate the multi-step listing form with tRPC mutations, implement file upload functionality with progress tracking, add availability status management UI, create listing management pages, and implement comprehensive loading states and error handling throughout the application.

**context**:

- Working in a T3 stack with Next.js 15 App Router, tRPC, React Hook Form, TypeScript, Shadcn UI
- Listing form exists at src/app/sell/list/\_components/listing-form.tsx with 5 steps (Contact Info, Listing Info, Listing Details, Attachments, Review)
- Form uses react-hook-form with zod validation schema matching tRPC input schemas
- tRPC listing router is fully implemented at src/server/api/routers/listing.ts with procedures: create, update, publish, reserve, markAsSold, releaseReservation, archive, getById, getByUser, getAvailable, uploadMedia, deleteMedia
- Storage providers are implemented (Firebase/AWS) at src/lib/storage/
- tRPC React hooks are available via api from src/trpc/react.tsx (use api.listing.create.useMutation(), etc.)
- Sonner toast library is available at src/components/ui/sonner.tsx
- Project structure: src/app/sell/list/ for listing form pages, src/app/sell/listings/ for user's listings management, src/app/listings/[id]/ for detail pages, src/components/ for reusable components, \_components/ for page-specific components

\*_instructions_:

- **Update listing-form.tsx** (src/app/sell/list/\_components/listing-form.tsx):
  1. Import tRPC hooks:
     - Import api from "@/trpc/react"
     - Get listing.create.useMutation() hook
     - Get listing.uploadMedia.useMutation() hook for file uploads
  2. Update onSubmit handler:
     - Transform form data to match tRPC createListingSchema structure:
       - Split into contactInfo, listingInfo, listingDetails objects
       - Convert File objects to base64 strings for uploadMedia (or handle separately)
     - Call listing.create.mutate() with transformed data
     - Show loading state: disable submit button, show spinner, set isSubmitting
     - On success: show success toast with sonner, redirect to /sell/listings or listing detail page
     - On error: show error toast with error message, handle TRPCError with proper error messages
     - Handle validation errors: map tRPC field errors to form.setError() for react-hook-form
  3. Add file upload integration:
     - Update attachments-step.tsx to convert File to base64 and call uploadMedia mutation
     - Upload files when user completes attachments step (or on form submit)
     - Show upload progress: track upload state per file, display progress indicator
     - Display uploaded file URLs from uploadMedia response (returns {id, fileName, url, thumbnailUrl}[])
     - Handle upload errors: show error toast, allow retry
     - Update form state with uploaded media attachment IDs
     - Note: uploadMedia requires listingId, so either:
       a) Create listing first (without media), then upload media, then update listing
       b) Upload media after listing creation in onSubmit
  4. Add draft saving (optional enhancement):
     - Auto-save form data to localStorage on form changes (debounced, 2 second delay)
     - Use key: "listing-form-draft"
     - Restore draft on component mount if exists
     - Clear draft on successful submission
     - Show "Restore draft" button if draft exists
  5. Add loading states:
     - Disable Next/Submit buttons during mutations (use mutation.isPending)
     - Show Spinner component on submit button during submission
     - Use form.formState.isSubmitting for form-level loading state

- **Create listing status badge component** (src/components/listing-status-badge.tsx):
  - Create reusable badge component showing listing status
  - Statuses: DRAFT (gray), PUBLISHED (green), RESERVED (yellow), SOLD (red), ARCHIVED (muted)
  - Use Shadcn Badge component with appropriate variants
  - Accept status prop of type ListingStatus enum
  - Display status text with proper styling

- **Create listing management page** (src/app/sell/listings/page.tsx):
  - Use api.listing.getByUser.useQuery() to fetch user's listings
  - Display listings in a responsive grid or table layout
  - Show: status badge, manufacturer, model, year, asking price, created date, availability status
  - Add actions column with buttons: Edit, Publish (if DRAFT), Mark as Sold (if PUBLISHED/RESERVED), Archive
  - Filter by status: Add dropdown/select to filter by ListingStatus
  - Use tRPC mutations for actions: publish.useMutation(), markAsSold.useMutation(), archive.useMutation()
  - Show loading skeleton while fetching
  - Show empty state if no listings
  - Add toast notifications for all mutations (success/error)
  - Handle errors gracefully with user-friendly messages

- **Update buy page** (src/app/buy/page.tsx):
  - Convert to client component or use server component with tRPC server-side calls
  - Use api.listing.getAvailable.useQuery() with filters
  - Filter by availabilityStatus = AVAILABLE and status = PUBLISHED
  - Add filter UI in buy-filters.tsx:
    - Manufacturer (text input or select)
    - Model (text input)
    - Year (select or text input)
    - Price range (min/max inputs)
    - Condition (select)
  - Pass filters as query input to getAvailable
  - Show loading skeleton for listings grid
  - Show pagination controls (use getAvailable response: {listings, total, page, limit, totalPages})
  - Display listing cards with: image (first mediaAttachment), manufacturer, model, year, price, status badge
  - Hide sold/reserved listings (already filtered by getAvailable)
  - Add empty state when no listings match filters

- **Create listing detail page** (src/app/listings/[id]/page.tsx):
  - Use dynamic route parameter [id]
  - Use api.listing.getById.useQuery({ listingId: id }) to fetch listing
  - Display all listing information in organized sections:
    - Header: manufacturer, model, year, status badge, price
    - Media gallery: display all mediaAttachments with preview (use MediaPreviewDialog)
    - Contact info section: show contactInfo (only if user is owner or admin - check session)
    - Listing details: show listingDetails fields
    - Equipment info: year, condition, serial number, hours, miles, etc.
  - Show availability status badge
  - Add action buttons for owner:
    - "Mark as Sold" button (if PUBLISHED or RESERVED) - opens dialog with soldPrice, soldTo, soldNotes inputs
    - "Edit" button - links to /sell/list/[id]/edit (future)
    - "Archive" button (if not SOLD)
  - Use tRPC markAsSold.useMutation() for mark as sold action
  - Show loading skeleton while fetching
  - Handle 404 if listing not found
  - Show error state with retry button

- **Add toast notifications**:
  - Ensure Toaster component is in root layout (src/app/layout.tsx)
  - Import toast from "sonner" in components
  - Show success toasts: "Listing created successfully", "Listing published", "Listing marked as sold", etc.
  - Show error toasts: "Failed to create listing", display error.message from tRPC
  - Show upload progress: "Uploading files...", "Files uploaded successfully"
  - Use appropriate toast types: success, error, loading, info

- **Add loading states**:
  - Install and configure react-top-loading-bar if not already installed
  - Add LoadingBar component to root layout
  - Show loading bar on page navigation and tRPC queries
  - Use tRPC query/mutation isLoading/isPending states
  - Show skeleton loaders for listing cards/grids (use Shadcn Skeleton component)
  - Disable buttons during mutations (use mutation.isPending)
  - Show Spinner component on submit buttons during submission

- **Error handling**:
  - Wrap tRPC calls in try-catch where needed
  - Handle TRPCError with proper error codes (NOT_FOUND, FORBIDDEN, BAD_REQUEST, etc.)
  - Display user-friendly error messages
  - Show error boundaries for React errors
  - Handle network errors gracefully

_verification_:

- Can submit listing form and create listing in database with all fields
- File uploads work: files are uploaded to storage, MediaAttachment records created, URLs displayed in UI
- Upload progress is shown during file uploads
- Availability status displays correctly in listing cards and detail pages
- Status management buttons work: publish, mark as sold, archive mutations execute successfully
- Public browse page (buy page) only shows available listings (status=PUBLISHED, availabilityStatus=AVAILABLE)
- User's listings page shows all statuses with proper filtering
- Listing detail page displays all information correctly
- Loading states work: skeletons show during queries, buttons disabled during mutations, loading bar on navigation
- Error handling shows helpful messages via toasts
- Form validation works on client (react-hook-form) and server (tRPC zod schemas)
- Toast notifications appear for all user actions
- Draft saving works (if implemented): saves to localStorage, restores on mount

_preferences_:

- Use tRPC React hooks (api.listing._.useMutation(), api.listing._.useQuery()) for all API calls
- Follow existing component patterns from codebase
- Use Shadcn UI components (Button, Badge, Skeleton, Dialog, etc.)
- Implement proper loading states with skeletons and spinners
- Add toast notifications using sonner for all user feedback
- Keep form state management clean with react-hook-form
- Use TypeScript strict mode with proper types
- Follow existing code style and formatting
- Use Next.js 15 App Router patterns (server/client components appropriately)
- Handle errors gracefully with user-friendly messages
- Ensure responsive design for all new pages

```

---

## PHASE 7: Security, Validation & Reservation Expiry

**Use this prompt when:** You need to add security measures, comprehensive validation, and automatic reservation expiry functionality.

```

_objective_: Implement comprehensive security measures, input validation, file upload security, and automatic reservation expiry system for the listing platform.

_context_:

- Working in a T3 stack with Next.js 15, tRPC, Prisma, TypeScript
- Listing router exists (Phase 3)
- Storage providers implemented (Phase 2.2)
- Frontend integrated (Phase 5)
- Need to secure file uploads, validate all inputs, and handle reservation expiry
- Project structure: src/server/api/routers/ for routers, src/server/jobs/ for background jobs

_instructions_:

- **File Upload Security** (in listing router uploadMedia procedure):
  1. File type validation:
     - Whitelist allowed MIME types: image/jpeg, image/png, image/webp, video/mp4, video/webm, application/pdf
     - Reject files with executable extensions
     - Validate file extension matches MIME type
  2. File size limits:
     - Images: max 10MB
     - Videos: max 100MB
     - Documents: max 5MB
  3. File count limits:
     - Max 5 files per listing
  4. File content validation (optional):
     - Use file-type library to verify actual file type (not just extension)
     - Reject files that don't match declared type
  5. Rate limiting:
     - Limit uploads per user (e.g., 10 uploads per hour)
     - Use tRPC rate limiting or middleware

- **Input Validation** (enhance existing zod schemas):
  1. Contact info validation:
     - Email format validation
     - Phone number format validation
     - URL validation for website
     - Sanitize all text inputs (remove XSS attempts)
  2. Listing info validation:
     - Price must be positive number
     - Year must be valid (1900-current year)
     - Serial number format validation
     - Hours/miles must be positive numbers
  3. Status transition validation:
     - Cannot mark as SOLD if already SOLD
     - Cannot reserve if already SOLD or RESERVED
     - Cannot publish without required fields
     - Add validation in tRPC procedures

- **User Authorization**:
  1. Verify ownership in all update/delete operations
  2. Only allow listing owner to change status
  3. Public queries only return PUBLISHED + AVAILABLE listings
  4. Add admin role check for getSold query (if needed)

- **Reservation Expiry System**:
  1. Create background job at src/server/jobs/reservation-expiry.ts:
     - Function to check all RESERVED listings
     - Find listings where reservedUntil < now()
     - Update: status to PUBLISHED, availabilityStatus to AVAILABLE
     - Clear reservedAt and reservedUntil
     - Log expired reservations
  2. Set up job execution:
     - Option A: Next.js API route at src/app/api/cron/reservation-expiry/route.ts
       - Use Vercel Cron or similar to call every hour
       - Verify cron secret for security
     - Option B: Use node-cron or similar library
       - Run in server startup or separate worker
  3. Add notification (optional):
     - Email seller before reservation expires (e.g., 24 hours before)
     - Use email service or notification system

- **Data Sanitization**:
  1. Sanitize all text inputs:
     - Remove HTML tags
     - Escape special characters
     - Use DOMPurify or similar library
  2. Validate URLs:
     - Ensure URLs are safe (http/https only)
     - Validate URL format

- **Error Handling**:
  1. Don't expose sensitive information in errors
  2. Log errors server-side
  3. Return user-friendly error messages
  4. Handle storage errors gracefully

- **Add validation utilities** at src/lib/validation/:
  1. sanitizeInput.ts: Text sanitization functions
  2. validateFile.ts: File validation functions
  3. validateStatusTransition.ts: Status transition validation

_verification_:

- File uploads reject invalid file types
- File uploads reject oversized files
- File uploads respect count limits
- Input validation catches invalid data
- Status transitions are properly validated
- User ownership is verified in all operations
- Reservation expiry job runs and updates listings
- Sanitized inputs don't contain XSS attempts
- Error messages are user-friendly
- Rate limiting works for uploads

_preferences_:

- Use zod for all validation
- Keep security checks in server-side code
- Don't trust client-side validation alone
- Log security events for monitoring
- Use TypeScript strict mode
- Follow security best practices
- Keep validation utilities reusable
- Add comprehensive error handling

```

---

### Enhanced Prompt (Detailed Format)

*objective*: Implement comprehensive security measures, input validation, file upload security, and automatic reservation expiry system for the listing platform. Ensure all file uploads are validated for type, size, and content; all user inputs are sanitized to prevent XSS attacks; status transitions are properly validated; user authorization is enforced; and expired reservations are automatically released.

*context*:
- Working in a T3 stack with Next.js 15 App Router, tRPC v11, Prisma, TypeScript, and Better Auth
- Listing router exists at `src/server/api/routers/listing.ts` with uploadMedia procedure
- Storage providers implemented (Firebase and AWS) at `src/lib/storage/`
- Frontend integrated with listing forms and media uploads
- Prisma schema includes Listing model with status, availabilityStatus, reservedAt, reservedUntil fields
- Current validation exists but needs enhancement for security
- Project structure: `src/server/api/routers/` for routers, `src/server/jobs/` for background jobs, `src/lib/validation/` for validation utilities

*instructions*:

- **File Upload Security** (enhance `uploadMedia` procedure in listing router):
  1. File type validation:
     - Whitelist allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `video/mp4`, `video/webm`, `application/pdf`
     - Reject files with executable extensions (`.exe`, `.bat`, `.sh`, `.js`, `.php`, etc.)
     - Validate file extension matches declared MIME type
     - Use `file-type` library (or similar) to verify actual file content matches declared type
  2. File size limits (per file type):
     - Images: max 10MB (10 * 1024 * 1024 bytes)
     - Videos: max 100MB (100 * 1024 * 1024 bytes)
     - Documents: max 5MB (5 * 1024 * 1024 bytes)
  3. File count limits:
     - Max 5 files per listing (already implemented, verify it works)
  4. File content validation:
     - Use `file-type` library to verify actual file type from buffer content
     - Reject files where actual type doesn't match declared MIME type
     - Check file magic bytes/headers
  5. Rate limiting:
     - Limit uploads per user: 10 uploads per hour
     - Track uploads in memory or database
     - Return rate limit error with retry-after information

- **Input Validation** (enhance existing zod schemas in listing router):
  1. Contact info validation (`contactInfoSchema`):
     - Email: Use zod `.email()` with custom message
     - Phone: Validate format (allow international formats, digits, spaces, dashes, parentheses)
     - Website URL: Validate URL format, ensure http/https only, reject javascript: and data: URLs
     - Sanitize all text inputs: remove HTML tags, escape special characters
  2. Listing info validation (`listingInfoSchema`):
     - Price: Must be positive number (already implemented, verify)
     - Year: Must be valid year (1900 to current year + 1)
     - Serial number: Alphanumeric with optional dashes/underscores, min 1 char
     - Hours/miles: If provided, must be positive numbers or empty string
  3. Status transition validation (enhance `validateStatusTransition` function):
     - Cannot mark as SOLD if already SOLD
     - Cannot reserve if already SOLD or RESERVED
     - Cannot publish without required fields (already implemented)
     - Add validation in all status-changing procedures (publish, reserve, markAsSold, releaseReservation)

- **User Authorization** (enhance existing procedures):
  1. Verify ownership in all update/delete operations (already implemented, verify all procedures)
  2. Only allow listing owner to change status (add checks to reserve, markAsSold if needed)
  3. Public queries (`getAvailable`, `getById`) only return PUBLISHED + AVAILABLE listings (verify)
  4. Add admin role check for `getSold` query if filtering by other users (future enhancement)

- **Reservation Expiry System**:
  1. Create background job at `src/server/jobs/reservation-expiry.ts`:
     - Function `checkAndExpireReservations()` to check all RESERVED listings
     - Find listings where `reservedUntil < now()` and status is RESERVED
     - Update: status to PUBLISHED, availabilityStatus to AVAILABLE
     - Clear `reservedAt` and `reservedUntil` fields
     - Log expired reservations with listing ID and user ID
  2. Set up job execution:
     - Create Next.js API route at `src/app/api/cron/reservation-expiry/route.ts`
     - Use Vercel Cron format or accept cron secret in headers
     - Verify `CRON_SECRET` environment variable for security
     - Call the job function every hour
  3. Add notification (optional, for future):
     - Email seller 24 hours before reservation expires
     - Use email service integration

- **Data Sanitization**:
  1. Create `src/lib/validation/sanitizeInput.ts`:
     - Function `sanitizeText(input: string): string` to remove HTML tags
     - Function `sanitizeHtml(input: string): string` to escape HTML entities
     - Use simple regex or consider DOMPurify for server-side
  2. Validate URLs:
     - Function `validateUrl(url: string): boolean` to ensure http/https only
     - Reject javascript:, data:, file: protocols
     - Validate URL format with zod or URL constructor

- **Error Handling**:
  1. Don't expose sensitive information in errors (file paths, internal IDs, etc.)
  2. Log errors server-side with proper context
  3. Return user-friendly error messages
  4. Handle storage errors gracefully (network failures, quota exceeded, etc.)

- **Add validation utilities** at `src/lib/validation/`:
  1. `sanitizeInput.ts`: Text sanitization functions (remove HTML, escape entities)
  2. `validateFile.ts`: Enhanced file validation functions (type, size, content)
  3. `validateStatusTransition.ts`: Status transition validation logic
  4. `rateLimiter.ts`: Rate limiting utilities for uploads

*verification*:

- File uploads reject invalid file types (test with .exe, .js files)
- File uploads reject oversized files (test with 11MB image, 101MB video)
- File uploads respect count limits (test uploading 6 files)
- File content validation catches mismatched MIME types (test image with .pdf extension)
- Input validation catches invalid data (test invalid email, phone, URL)
- Status transitions are properly validated (test marking SOLD listing as SOLD again)
- User ownership is verified in all operations (test updating someone else's listing)
- Reservation expiry job runs and updates listings (test with expired reservation)
- Sanitized inputs don't contain XSS attempts (test with `<script>alert('xss')</script>`)
- Error messages are user-friendly (no internal paths or stack traces)
- Rate limiting works for uploads (test 11 uploads in an hour)

*preferences*:

- Use zod for all validation schemas
- Keep security checks in server-side code only
- Don't trust client-side validation alone (validate on server)
- Log security events for monitoring (invalid uploads, failed auth attempts)
- Use TypeScript strict mode
- Follow security best practices (OWASP guidelines)
- Keep validation utilities reusable and testable
- Add comprehensive error handling with proper error types
- Use environment variables for configuration (rate limits, file sizes)
- Install `file-type` package for file content validation
- Use tRPC error codes appropriately (BAD_REQUEST, FORBIDDEN, NOT_FOUND)

---

## PHASE 2.3: AWS S3 Storage Provider Implementation (Future)

**Use this prompt when:** You're ready to implement AWS S3 storage as an alternative or replacement for Firebase Storage.

```

_objective_: Implement AWS S3 storage provider as an alternative storage solution for media files, with presigned URLs, CDN support, and lifecycle policies.

_context_:

- Working in a T3 stack with Next.js 15, tRPC, TypeScript
- Storage abstraction layer exists (Phase 2.1)
- Firebase storage is currently implemented (Phase 2.2)
- Need to add AWS S3 as alternative storage provider
- Should support switching between providers via environment variable
- Project structure: src/lib/storage/ for storage code

_instructions_:

- Install dependencies: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
- Update environment configuration (src/env.js):
  - Add AWS_ACCESS_KEY_ID (string, required if using AWS)
  - Add AWS_SECRET_ACCESS_KEY (string, required if using AWS)
  - Add AWS_REGION (string, default: "us-east-1")
  - Add AWS_S3_BUCKET_NAME (string, required if using AWS)
  - Update STORAGE_PROVIDER to support "aws" option

- Implement AWSStorageProvider at src/lib/storage/aws.ts:
  - Implement IStorageProvider interface from Phase 2.1
  - Initialize S3 client using AWS SDK v3
  - upload() method:
    - Accept File object, path string, and optional metadata
    - Validate file size and type (same as Firebase)
    - Upload to S3 using PutObjectCommand
    - Set metadata (ContentType, Metadata with listingId, fileType, etc.)
    - Generate presigned URL for download (1 year expiry)
    - For images, generate thumbnail (resize, upload to thumbnails/ path)
    - Return { url (presigned), path, thumbnailUrl? }
  - delete() method:
    - Delete file from S3 using DeleteObjectCommand
    - Also delete thumbnail if exists
    - Handle file not found errors gracefully
  - getUrl() method:
    - Generate presigned URL using GetObjectCommand
    - Accept optional expiresIn parameter (default 1 year)
    - Return downloadable URL
  - generateThumbnail() method (optional):
    - Resize image (use sharp or similar)
    - Upload thumbnail to S3
    - Return thumbnail URL

- Create AWS configuration at src/lib/storage/aws/config.ts:
  - Initialize S3 client with credentials
  - Export client and bucket name
  - Handle credential errors gracefully

- Create utility functions at src/lib/storage/aws/utils.ts:
  - Same utilities as Firebase: sanitizeFilename, validateFileType, validateFileSize, generateStoragePath
  - Add S3-specific path formatting

- Update StorageFactory (src/lib/storage/index.ts):
  - Add AWSStorageProvider to provider selection
  - Return AWS provider when STORAGE_PROVIDER="aws"

- Optional: CloudFront CDN integration:
  - Configure CloudFront distribution for S3 bucket
  - Use CloudFront URL instead of presigned S3 URL
  - Add CLOUDFRONT_DOMAIN env variable

- Optional: S3 Lifecycle policies:
  - Configure lifecycle rules for old files
  - Archive to Glacier after 1 year
  - Delete old thumbnails

_verification_:

- Can upload files to S3 and receive presigned URLs
- Can delete files from S3
- Can generate presigned URLs for existing files
- File validation works correctly
- Thumbnail generation works (if implemented)
- Can switch between Firebase and AWS via env variable
- Error handling works for invalid credentials, network failures
- Files are organized correctly in S3 bucket
- Presigned URLs expire correctly

_preferences_:

- Use AWS SDK v3 (modular)
- Generate presigned URLs with appropriate expiry
- Follow AWS S3 best practices
- Keep implementation consistent with Firebase provider
- Use TypeScript strict mode
- Add comprehensive error handling
- Document AWS setup requirements
- Support both providers simultaneously if needed

```

---

## Usage Instructions

1. **Copy the prompt** you want to use (e.g., Phase 1)
2. **Use the `/en` command** in Cursor
3. **Paste the entire prompt** (from `*objective*` to `*preferences*`)
4. **Execute** - The AI will implement that specific phase

Each prompt is self-contained and includes all necessary context, so you can use them in any order (though following the numbered order is recommended).

```
