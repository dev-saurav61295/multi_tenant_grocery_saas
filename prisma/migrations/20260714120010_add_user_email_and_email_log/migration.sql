-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('registration_welcome', 'order_confirmation', 'order_out_for_delivery', 'order_delivered');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email" TEXT,
ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "emailVerifyExpires" TIMESTAMP(3),
ADD COLUMN     "emailVerifyToken" TEXT;

-- Backfill existing users with placeholder emails before making the column required.
UPDATE "users"
SET "email" = "username" || '@placeholder.local'
WHERE "email" IS NULL;

ALTER TABLE "users"
ALTER COLUMN "email" SET NOT NULL;

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "userId" TEXT,
    "orderId" TEXT,
    "type" "EmailType" NOT NULL,
    "toEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_logs_storeId_idx" ON "email_logs"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "users_storeId_email_key" ON "users"("storeId", "email");

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
