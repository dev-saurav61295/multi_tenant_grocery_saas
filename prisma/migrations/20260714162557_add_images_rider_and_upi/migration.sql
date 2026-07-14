-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "paymentProofUrl" TEXT,
ADD COLUMN     "riderId" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "upiId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "onBreak" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "orders_riderId_idx" ON "orders"("riderId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
