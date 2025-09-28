/*
  Warnings:

  - You are about to drop the column `asseturl` on the `Debate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Debate" DROP COLUMN "asseturl",
ADD COLUMN     "assetUrl" TEXT;
