/*
  Warnings:

  - A unique constraint covering the columns `[referenceNumber]` on the table `listing` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "listing" ADD COLUMN     "referenceNumber" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "listing_referenceNumber_key" ON "listing"("referenceNumber");

-- CreateIndex
CREATE INDEX "listing_referenceNumber_idx" ON "listing"("referenceNumber");
