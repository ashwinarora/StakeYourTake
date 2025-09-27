/*
  Warnings:

  - You are about to drop the column `debateId` on the `Evidence` table. All the data in the column will be lost.
  - Added the required column `debateIdPg` to the `Evidence` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Evidence" DROP CONSTRAINT "Evidence_debateId_fkey";

-- AlterTable
ALTER TABLE "public"."Evidence" DROP COLUMN "debateId",
ADD COLUMN     "debateIdPg" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Evidence" ADD CONSTRAINT "Evidence_debateIdPg_fkey" FOREIGN KEY ("debateIdPg") REFERENCES "public"."Debate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
