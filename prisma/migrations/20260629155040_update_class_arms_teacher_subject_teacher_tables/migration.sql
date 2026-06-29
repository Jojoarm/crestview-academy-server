/*
  Warnings:

  - A unique constraint covering the columns `[classArmId,teacherId,sessionId]` on the table `class_arm_teachers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[classArmId,subjectId,teacherId,sessionId]` on the table `subject_teachers` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "class_arm_teachers_classArmId_sessionId_key";

-- DropIndex
DROP INDEX "subject_teachers_classArmId_subjectId_sessionId_key";

-- CreateIndex
CREATE UNIQUE INDEX "class_arm_teachers_classArmId_teacherId_sessionId_key" ON "class_arm_teachers"("classArmId", "teacherId", "sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "subject_teachers_classArmId_subjectId_teacherId_sessionId_key" ON "subject_teachers"("classArmId", "subjectId", "teacherId", "sessionId");
