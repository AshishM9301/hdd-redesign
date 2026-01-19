-- AlterEnum
ALTER TYPE "StorageProvider" ADD VALUE 'RAILWAY';

-- CreateTable
CREATE TABLE "MediaUploadRequest" (
    "id" TEXT NOT NULL,
    "listingId" TEXT,
    "userId" TEXT,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "referenceNumber" TEXT,
    "mediaFiles" JSONB NOT NULL,
    "cancellationToken" TEXT NOT NULL,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaUploadRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaUploadRequest_cancellationToken_key" ON "MediaUploadRequest"("cancellationToken");

-- CreateIndex
CREATE INDEX "MediaUploadRequest_email_idx" ON "MediaUploadRequest"("email");

-- CreateIndex
CREATE INDEX "MediaUploadRequest_status_idx" ON "MediaUploadRequest"("status");

-- CreateIndex
CREATE INDEX "MediaUploadRequest_userId_idx" ON "MediaUploadRequest"("userId");

-- CreateIndex
CREATE INDEX "MediaUploadRequest_listingId_idx" ON "MediaUploadRequest"("listingId");

-- CreateIndex
CREATE INDEX "MediaUploadRequest_cancellationToken_idx" ON "MediaUploadRequest"("cancellationToken");

-- AddForeignKey
ALTER TABLE "MediaUploadRequest" ADD CONSTRAINT "MediaUploadRequest_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaUploadRequest" ADD CONSTRAINT "MediaUploadRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaUploadRequest" ADD CONSTRAINT "MediaUploadRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
