-- Safe migration to handle name -> key transition
-- Check if name column exists and key doesn't, or if both exist

-- Step 1: If key column doesn't exist but name does, add key column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'BaseApi' AND column_name = 'key') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'BaseApi' AND column_name = 'name') THEN
    ALTER TABLE "BaseApi" ADD COLUMN "key" TEXT;
    UPDATE "BaseApi" SET "key" = "name" WHERE "key" IS NULL;
  END IF;
END $$;

-- Step 2: Ensure key is populated from name if key is null
UPDATE "BaseApi" SET "key" = "name" WHERE "key" IS NULL AND "name" IS NOT NULL;

-- Step 3: Drop index on key if it exists (will recreate with unique constraint)
DROP INDEX IF EXISTS "BaseApi_key_idx";

-- Step 4: Make key required and unique (only if key column exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'BaseApi' AND column_name = 'key') THEN
    ALTER TABLE "BaseApi" ALTER COLUMN "key" SET NOT NULL;
    -- Drop existing unique constraint if it exists
    ALTER TABLE "BaseApi" DROP CONSTRAINT IF EXISTS "BaseApi_key_key";
    ALTER TABLE "BaseApi" ADD CONSTRAINT "BaseApi_key_key" UNIQUE ("key");
  END IF;
END $$;

-- Step 5: Drop name column if it exists and key exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'BaseApi' AND column_name = 'name')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'BaseApi' AND column_name = 'key') THEN
    ALTER TABLE "BaseApi" DROP COLUMN "name";
  END IF;
END $$;
