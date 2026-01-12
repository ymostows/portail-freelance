/*
  Warnings:

  - A unique constraint covering the columns `[inviteToken]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Project_inviteToken_key" ON "Project"("inviteToken");
