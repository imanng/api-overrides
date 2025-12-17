/*
  Warnings:

  - You are about to drop the column `allowedIPs` on the `ApiConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ApiConfig" DROP COLUMN "allowedIPs";

-- AlterTable
ALTER TABLE "Override" ADD COLUMN     "ipAddress" TEXT;
