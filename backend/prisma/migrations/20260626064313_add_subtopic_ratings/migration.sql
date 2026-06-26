/*
  Warnings:

  - You are about to drop the `self_assessments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "self_assessments" DROP CONSTRAINT "self_assessments_user_id_fkey";

-- DropTable
DROP TABLE "self_assessments";

-- CreateTable
CREATE TABLE "SelfAssessment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "overallPercentage" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SelfAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubtopicRating" (
    "id" TEXT NOT NULL,
    "selfAssessmentId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "subtopicId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,

    CONSTRAINT "SubtopicRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SelfAssessment_userId_key" ON "SelfAssessment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SubtopicRating_selfAssessmentId_subtopicId_key" ON "SubtopicRating"("selfAssessmentId", "subtopicId");

-- AddForeignKey
ALTER TABLE "SelfAssessment" ADD CONSTRAINT "SelfAssessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubtopicRating" ADD CONSTRAINT "SubtopicRating_selfAssessmentId_fkey" FOREIGN KEY ("selfAssessmentId") REFERENCES "SelfAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
