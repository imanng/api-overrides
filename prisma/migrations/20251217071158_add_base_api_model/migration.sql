-- CreateTable
CREATE TABLE "BaseApi" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "pathPrefix" TEXT,
    "authHeaders" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BaseApi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BaseApi_isDefault_idx" ON "BaseApi"("isDefault");

-- CreateIndex
CREATE INDEX "BaseApi_pathPrefix_idx" ON "BaseApi"("pathPrefix");
