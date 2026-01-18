-- CreateTable
CREATE TABLE "listing_connection_request" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "proofDocument" TEXT,
    "proofNotes" TEXT,
    "rejectionReason" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listing_connection_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "listing_connection_request_status_idx" ON "listing_connection_request"("status");

-- CreateIndex
CREATE INDEX "listing_connection_request_userId_idx" ON "listing_connection_request"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "listing_connection_request_listingId_userId_key" ON "listing_connection_request"("listingId", "userId");

-- AddForeignKey
ALTER TABLE "listing_connection_request" ADD CONSTRAINT "listing_connection_request_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_connection_request" ADD CONSTRAINT "listing_connection_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_connection_request" ADD CONSTRAINT "listing_connection_request_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
