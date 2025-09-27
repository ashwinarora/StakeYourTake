/*
  Warnings:

  - Changed the type of `chainId` on the `Debate` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Debate" DROP COLUMN "chainId",
ADD COLUMN     "chainId" INTEGER NOT NULL;
