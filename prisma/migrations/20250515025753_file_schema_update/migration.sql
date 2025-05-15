/*
  Warnings:

  - The values [DELETED] on the enum `FileState` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FileState_new" AS ENUM ('ACTIVE', 'EXPIRED');
ALTER TABLE "File" ALTER COLUMN "currentStatus" DROP DEFAULT;
ALTER TABLE "File" ALTER COLUMN "currentStatus" TYPE "FileState_new" USING ("currentStatus"::text::"FileState_new");
ALTER TYPE "FileState" RENAME TO "FileState_old";
ALTER TYPE "FileState_new" RENAME TO "FileState";
DROP TYPE "FileState_old";
ALTER TABLE "File" ALTER COLUMN "currentStatus" SET DEFAULT 'ACTIVE';
COMMIT;
