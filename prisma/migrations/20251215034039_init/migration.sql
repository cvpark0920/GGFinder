-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('super_admin', 'platform_admin', 'agency_member');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('pending', 'active', 'suspended');

-- CreateEnum
CREATE TYPE "AgencyRole" AS ENUM ('groom', 'bride');

-- CreateEnum
CREATE TYPE "AgencyStatus" AS ENUM ('active', 'suspended');

-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('groom', 'bride');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('registered', 'matching', 'meeting_scheduled', 'document_prep', 'waiting', 'in_progress');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('in_progress', 'waiting', 'completed', 'on_hold', 'cancelled');

-- CreateEnum
CREATE TYPE "StageStatus" AS ENUM ('pending', 'in_progress', 'completed');

-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('active', 'inactive');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'agency_member',
    "agencyId" INTEGER,
    "status" "UserStatus" NOT NULL DEFAULT 'pending',
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AgencyRole" NOT NULL,
    "contact" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AgencyStatus" NOT NULL DEFAULT 'active',
    "memo" TEXT,

    CONSTRAINT "agencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "loc" TEXT NOT NULL,
    "status" "ClientStatus" NOT NULL DEFAULT 'registered',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "ClientType" NOT NULL,
    "education" TEXT,
    "height" TEXT,
    "weight" TEXT,
    "family" TEXT,
    "marriage" TEXT,
    "job" TEXT,
    "tattoo" TEXT,
    "income" TEXT,
    "smoking" TEXT,
    "drinking" TEXT,
    "idealType" TEXT,
    "birthDate" TEXT,
    "hasMarriedBefore" BOOLEAN DEFAULT false,
    "exHusbandNationality" TEXT,
    "children" TEXT,
    "addressRegistration" TEXT,
    "currentAddress" TEXT,
    "monthlyIncome" TEXT,
    "siblings" TEXT,
    "relativesOverseas" TEXT,
    "parentsAge" TEXT,
    "parentsPhone" TEXT,
    "phone" TEXT,
    "healthIssues" TEXT,
    "desiredDestination" TEXT,
    "guarantee" BOOLEAN DEFAULT false,
    "birthYear" INTEGER,
    "residence" TEXT,
    "transportation" TEXT,
    "housing" TEXT,
    "hobbies" TEXT,
    "parentalSupport" TEXT,
    "features" TEXT,
    "religion" TEXT,
    "memo" TEXT,
    "agencyId" INTEGER,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_images" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_videos" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" SERIAL NOT NULL,
    "groomId" INTEGER NOT NULL,
    "brideId" INTEGER NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'in_progress',
    "stage" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "nextStep" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startDate" TIMESTAMP(3),
    "memo" TEXT,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_stages" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" "StageStatus" NOT NULL DEFAULT 'pending',
    "completedDate" TIMESTAMP(3),
    "memo" TEXT,
    "duration" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youtube_videos" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "VideoStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "youtube_videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_agencyId_idx" ON "users"("agencyId");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "agencies_role_idx" ON "agencies"("role");

-- CreateIndex
CREATE INDEX "agencies_status_idx" ON "agencies"("status");

-- CreateIndex
CREATE INDEX "clients_type_idx" ON "clients"("type");

-- CreateIndex
CREATE INDEX "clients_status_idx" ON "clients"("status");

-- CreateIndex
CREATE INDEX "clients_agencyId_idx" ON "clients"("agencyId");

-- CreateIndex
CREATE INDEX "clients_loc_idx" ON "clients"("loc");

-- CreateIndex
CREATE INDEX "client_images_clientId_idx" ON "client_images"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "client_videos_clientId_key" ON "client_videos"("clientId");

-- CreateIndex
CREATE INDEX "matches_groomId_idx" ON "matches"("groomId");

-- CreateIndex
CREATE INDEX "matches_brideId_idx" ON "matches"("brideId");

-- CreateIndex
CREATE INDEX "matches_status_idx" ON "matches"("status");

-- CreateIndex
CREATE INDEX "match_stages_matchId_idx" ON "match_stages"("matchId");

-- CreateIndex
CREATE INDEX "match_stages_status_idx" ON "match_stages"("status");

-- CreateIndex
CREATE UNIQUE INDEX "youtube_videos_videoId_key" ON "youtube_videos"("videoId");

-- CreateIndex
CREATE INDEX "youtube_videos_status_idx" ON "youtube_videos"("status");

-- CreateIndex
CREATE INDEX "youtube_videos_videoId_idx" ON "youtube_videos"("videoId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_images" ADD CONSTRAINT "client_images_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_videos" ADD CONSTRAINT "client_videos_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_groomId_fkey" FOREIGN KEY ("groomId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_brideId_fkey" FOREIGN KEY ("brideId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_stages" ADD CONSTRAINT "match_stages_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
