/*
  Warnings:

  - You are about to drop the column `responseHeaders` on the `Override` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Override" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "headers" TEXT,
    "body" TEXT,
    "status" INTEGER NOT NULL DEFAULT 200,
    "responseBody" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Override" ("body", "createdAt", "headers", "id", "method", "path", "responseBody", "status", "updatedAt") SELECT "body", "createdAt", "headers", "id", "method", "path", "responseBody", "status", "updatedAt" FROM "Override";
DROP TABLE "Override";
ALTER TABLE "new_Override" RENAME TO "Override";
CREATE INDEX "Override_method_path_idx" ON "Override"("method", "path");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
