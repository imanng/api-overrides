-- CreateTable
CREATE TABLE "Override" (
    "id" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "headers" TEXT,
    "body" TEXT,
    "status" INTEGER NOT NULL DEFAULT 200,
    "responseBody" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Override_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiConfig" (
    "id" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "authHeaders" TEXT,
    "timeout" INTEGER NOT NULL DEFAULT 30000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Override_method_path_idx" ON "Override"("method", "path");

-- CreateIndex
CREATE UNIQUE INDEX "ApiConfig_id_key" ON "ApiConfig"("id");
