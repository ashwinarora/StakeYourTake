/*
  Warnings:

  - A unique constraint covering the columns `[debateId]` on the table `Debate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chainId` to the `Debate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creationTxHash` to the `Debate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `debateId` to the `Debate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Debate" ADD COLUMN     "chainId" VARCHAR(255) NOT NULL,
ADD COLUMN     "creationTxHash" VARCHAR(255) NOT NULL,
ADD COLUMN     "debateId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Debate_debateId_key" ON "public"."Debate"("debateId");
