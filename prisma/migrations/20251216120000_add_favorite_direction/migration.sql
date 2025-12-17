-- CreateEnum
CREATE TYPE "FavoriteDirection" AS ENUM ('groom_to_bride', 'bride_to_groom');

-- AlterTable
ALTER TABLE "favorites" ADD COLUMN "direction" "FavoriteDirection" NOT NULL DEFAULT 'groom_to_bride';

-- DropIndex
DROP INDEX IF EXISTS "favorites_userId_clientId_key";

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_clientId_direction_key" ON "favorites"("userId", "clientId", "direction");

-- CreateIndex
CREATE INDEX "favorites_direction_status_idx" ON "favorites"("direction", "status");

