-- CreateEnum
CREATE TYPE "Section" AS ENUM ('Kindergarten', 'Nursery', 'Primary', 'Secondary');

-- CreateTable
CREATE TABLE "class_levels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "section" "Section" NOT NULL,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_arms" (
    "id" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "classLevelId" TEXT NOT NULL,
    "armId" TEXT NOT NULL,

    CONSTRAINT "class_arms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "class_levels_name_key" ON "class_levels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "arms_name_key" ON "arms"("name");

-- CreateIndex
CREATE UNIQUE INDEX "class_arms_classLevelId_armId_key" ON "class_arms"("classLevelId", "armId");

-- AddForeignKey
ALTER TABLE "class_arms" ADD CONSTRAINT "class_arms_classLevelId_fkey" FOREIGN KEY ("classLevelId") REFERENCES "class_levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_arms" ADD CONSTRAINT "class_arms_armId_fkey" FOREIGN KEY ("armId") REFERENCES "arms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
