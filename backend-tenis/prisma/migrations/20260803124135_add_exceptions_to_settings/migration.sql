-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "exceptions" JSONB NOT NULL DEFAULT '[]',
ALTER COLUMN "schedule" SET DEFAULT '{}';
