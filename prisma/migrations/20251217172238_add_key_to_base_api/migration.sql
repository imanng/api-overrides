-- AlterTable
ALTER TABLE "BaseApi" ADD COLUMN     "key" TEXT;

-- CreateIndex
CREATE INDEX "BaseApi_key_idx" ON "BaseApi"("key");
