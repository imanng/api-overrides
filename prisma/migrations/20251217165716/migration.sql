-- AlterTable
ALTER TABLE "Override" ADD COLUMN     "baseApiId" TEXT;

-- CreateIndex
CREATE INDEX "Override_baseApiId_idx" ON "Override"("baseApiId");
