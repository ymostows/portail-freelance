-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN     "estimatedDuration" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;
