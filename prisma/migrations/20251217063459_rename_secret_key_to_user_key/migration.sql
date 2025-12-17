/*
  Warnings:

  - You are about to drop the column `secretKey` on the `ApiConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ApiConfig" DROP COLUMN "secretKey",
ADD COLUMN     "userKey" TEXT;
