-- CreateEnum
CREATE TYPE "TradeInStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'OFFER_SENT', 'CLOSED');

-- CreateEnum
CREATE TYPE "ValueRequestStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'VALUED', 'CLOSED');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- AlterEnum
ALTER TYPE "ListingStatus" ADD VALUE 'SAMPLE';

-- CreateTable
CREATE TABLE "trade_in_request" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "preferredLanguage" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "manufacturer" TEXT,
    "model" TEXT,
    "year" TEXT,
    "hours" TEXT,
    "condition" TEXT,
    "country" TEXT,
    "stateProvince" TEXT,
    "message" TEXT NOT NULL,
    "status" "TradeInStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trade_in_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "value_request" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "preferredLanguage" TEXT NOT NULL,
    "manufacturer" TEXT,
    "model" TEXT,
    "year" TEXT,
    "hours" TEXT,
    "description" TEXT NOT NULL,
    "files" JSONB,
    "status" "ValueRequestStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "value_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "userId" TEXT,
    "offerAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trade_in_request_referenceNumber_key" ON "trade_in_request"("referenceNumber");

-- CreateIndex
CREATE INDEX "trade_in_request_email_idx" ON "trade_in_request"("email");

-- CreateIndex
CREATE INDEX "trade_in_request_status_idx" ON "trade_in_request"("status");

-- CreateIndex
CREATE INDEX "trade_in_request_referenceNumber_idx" ON "trade_in_request"("referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "value_request_referenceNumber_key" ON "value_request"("referenceNumber");

-- CreateIndex
CREATE INDEX "value_request_email_idx" ON "value_request"("email");

-- CreateIndex
CREATE INDEX "value_request_status_idx" ON "value_request"("status");

-- CreateIndex
CREATE INDEX "value_request_referenceNumber_idx" ON "value_request"("referenceNumber");

-- CreateIndex
CREATE INDEX "offer_listingId_idx" ON "offer"("listingId");

-- CreateIndex
CREATE INDEX "offer_userId_idx" ON "offer"("userId");

-- CreateIndex
CREATE INDEX "offer_status_idx" ON "offer"("status");

-- CreateIndex
CREATE INDEX "offer_createdAt_idx" ON "offer"("createdAt");

-- AddForeignKey
ALTER TABLE "trade_in_request" ADD CONSTRAINT "trade_in_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "value_request" ADD CONSTRAINT "value_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer" ADD CONSTRAINT "offer_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer" ADD CONSTRAINT "offer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
