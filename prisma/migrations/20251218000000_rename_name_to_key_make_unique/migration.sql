-- Copy name values to key for existing records
UPDATE "BaseApi" SET "key" = "name" WHERE "key" IS NULL;

-- Drop the index on key if it exists
DROP INDEX IF EXISTS "BaseApi_key_idx";

-- Make key required and unique
ALTER TABLE "BaseApi" ALTER COLUMN "key" SET NOT NULL;
ALTER TABLE "BaseApi" ADD CONSTRAINT "BaseApi_key_key" UNIQUE ("key");

-- Drop the name column
ALTER TABLE "BaseApi" DROP COLUMN "name";
