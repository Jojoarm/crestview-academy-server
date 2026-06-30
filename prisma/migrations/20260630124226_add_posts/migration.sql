-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('Announcement', 'News', 'Event');

-- CreateEnum
CREATE TYPE "PostAudience" AS ENUM ('Everyone', 'Teachers', 'Parents', 'Students', 'Admins');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('Draft', 'Published');

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "PostType" NOT NULL,
    "audience" "PostAudience" NOT NULL DEFAULT 'Everyone',
    "status" "PostStatus" NOT NULL DEFAULT 'Draft',
    "bannerImageUrl" TEXT,
    "eventStartDate" TIMESTAMP(3),
    "eventEndDate" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
