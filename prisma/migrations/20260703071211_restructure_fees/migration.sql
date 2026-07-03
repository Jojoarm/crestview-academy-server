/*
  Warnings:

  - You are about to drop the `fee_structure_items` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `amount` to the `fee_structures` table without a default value. This is not possible if the table is not empty.
  - Added the required column `feeTypeId` to the `fee_structures` table without a default value. This is not possible if the table is not empty.
  - Added the required column `frequency` to the `fee_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scope` to the `fee_types` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FeeFrequency" AS ENUM ('OneTime', 'Annual', 'PerTerm');

-- CreateEnum
CREATE TYPE "FeeScope" AS ENUM ('SchoolWide', 'PerClass');

-- DropForeignKey
ALTER TABLE "fee_structure_items" DROP CONSTRAINT "fee_structure_items_feeStructureId_fkey";

-- DropForeignKey
ALTER TABLE "fee_structure_items" DROP CONSTRAINT "fee_structure_items_feeTypeId_fkey";

-- DropIndex
DROP INDEX "fee_structures_classLevelId_termId_sessionId_key";

-- AlterTable
ALTER TABLE "fee_structures" ADD COLUMN     "amount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "feeTypeId" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "classLevelId" DROP NOT NULL,
ALTER COLUMN "termId" DROP NOT NULL,
ALTER COLUMN "sessionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "fee_types" ADD COLUMN     "frequency" "FeeFrequency" NOT NULL,
ADD COLUMN     "scope" "FeeScope" NOT NULL;

-- DropTable
DROP TABLE "fee_structure_items";

-- AddForeignKey
ALTER TABLE "fee_structures" ADD CONSTRAINT "fee_structures_feeTypeId_fkey" FOREIGN KEY ("feeTypeId") REFERENCES "fee_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
