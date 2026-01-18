-- AlterTable
ALTER TABLE "listing" ADD COLUMN     "assured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "assuredAt" TIMESTAMP(3),
ADD COLUMN     "assuredById" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';

-- CreateIndex
CREATE INDEX "listing_assured_idx" ON "listing"("assured");

-- AddForeignKey
ALTER TABLE "listing" ADD CONSTRAINT "listing_assuredById_fkey" FOREIGN KEY ("assuredById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
