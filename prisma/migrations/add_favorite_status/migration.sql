-- CreateEnum
CREATE TYPE "FavoriteStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- AlterTable
ALTER TABLE "favorites" ADD COLUMN "status" "FavoriteStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "favorites" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "favorites_status_idx" ON "favorites"("status");

