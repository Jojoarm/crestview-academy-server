/*
  Warnings:

  - You are about to drop the `admins` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "admins" DROP CONSTRAINT "admins_userId_fkey";

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "impersonatedBy" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "banExpires" TIMESTAMP(3),
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banned" BOOLEAN,
ADD COLUMN     "forcePasswordChange" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" TEXT;

-- DropTable
DROP TABLE "admins";

-- DropEnum
DROP TYPE "AdminRole";
