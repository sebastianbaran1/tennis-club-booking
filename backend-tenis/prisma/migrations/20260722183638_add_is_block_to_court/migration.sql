-- AlterTable
ALTER TABLE "Court" ADD COLUMN     "blockReason" TEXT,
ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false;
