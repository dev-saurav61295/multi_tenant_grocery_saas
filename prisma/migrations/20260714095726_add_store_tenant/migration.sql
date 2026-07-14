/*
  Warnings:

  - You are about to drop the `store_settings` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[storeId,username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `storeId` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "codePrefix" TEXT NOT NULL,
    "openingTime" TEXT NOT NULL DEFAULT '09:00',
    "closingTime" TEXT NOT NULL DEFAULT '20:00',
    "hourlyCapacity" INTEGER NOT NULL DEFAULT 40,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- Backfill the existing single store before constraining tenant-owned tables.
INSERT INTO "stores" ("id", "name", "slug", "codePrefix", "openingTime", "closingTime", "hourlyCapacity", "createdAt", "updatedAt")
SELECT
  'store_bhagwandas_traders',
  'Bhagwandas Traders',
  'bhagwandas-traders',
  'BGD',
  "openingTime",
  "closingTime",
  "hourlyCapacity",
  NOW(),
  NOW()
FROM "store_settings"
WHERE "id" = 'singleton';

-- DropIndex
DROP INDEX "users_username_key";

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "storeId" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "storeId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "storeId" TEXT;

UPDATE "users" SET "storeId" = 'store_bhagwandas_traders';
UPDATE "products" SET "storeId" = 'store_bhagwandas_traders';
UPDATE "orders" SET "storeId" = 'store_bhagwandas_traders';

ALTER TABLE "orders" ALTER COLUMN "storeId" SET NOT NULL;
ALTER TABLE "products" ALTER COLUMN "storeId" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "storeId" SET NOT NULL;

-- DropTable
DROP TABLE "store_settings";

-- CreateIndex
CREATE UNIQUE INDEX "stores_slug_key" ON "stores"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "stores_codePrefix_key" ON "stores"("codePrefix");

-- CreateIndex
CREATE INDEX "orders_storeId_idx" ON "orders"("storeId");

-- CreateIndex
CREATE INDEX "products_storeId_idx" ON "products"("storeId");

-- CreateIndex
CREATE INDEX "users_storeId_idx" ON "users"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "users_storeId_username_key" ON "users"("storeId", "username");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
