-- AlterTable (baselined: column was added to the dev DB via `prisma db push` when COD support landed)
ALTER TABLE "orders" ADD COLUMN "paymentMethod" TEXT NOT NULL DEFAULT 'upi';
