/**
 * Utility script to purge all operational and catalog data for a specific tenant (store slug)
 * while preserving the Store record and the "admin_user" (or admin role accounts).
 *
 * Usage:
 *   npx tsx scripts/reset-tenant-data.ts [store-slug]
 *   Example: npx tsx scripts/reset-tenant-data.ts bhagwandas-traders
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetTenantData(targetSlug: string) {
  console.log(`\n🔍 Looking up store with slug: "${targetSlug}"...`);

  const store = await prisma.store.findUnique({
    where: { slug: targetSlug },
    include: {
      _count: {
        select: {
          orders: true,
          products: true,
          categories: true,
          users: true,
          emailLogs: true,
        },
      },
    },
  });

  if (!store) {
    console.error(`❌ Store with slug "${targetSlug}" not found in database.`);
    process.exit(1);
  }

  console.log(`\n📦 Current records for "${store.name}" (${store.slug}):`);
  console.log(`   - Orders:      ${store._count.orders}`);
  console.log(`   - Products:    ${store._count.products}`);
  console.log(`   - Categories:  ${store._count.categories}`);
  console.log(`   - Users:       ${store._count.users}`);
  console.log(`   - Email Logs:  ${store._count.emailLogs}`);

  console.log(`\n⚡ Starting transaction to purge tenant data (preserving 'admin_user')...`);

  const results = await prisma.$transaction(async (tx) => {
    // 1. Delete Email Logs for this store
    const deletedEmailLogs = await tx.emailLog.deleteMany({
      where: { storeId: store.id },
    });

    // 2. Delete Order Items (must happen before products/orders to respect foreign keys)
    const deletedOrderItems = await tx.orderItem.deleteMany({
      where: {
        order: { storeId: store.id },
      },
    });

    // 3. Delete Orders
    const deletedOrders = await tx.order.deleteMany({
      where: { storeId: store.id },
    });

    // 4. Delete Products
    const deletedProducts = await tx.product.deleteMany({
      where: { storeId: store.id },
    });

    // 5. Delete Categories
    const deletedCategories = await tx.category.deleteMany({
      where: { storeId: store.id },
    });

    // 6. Delete all Users EXCEPT admin_user (and any with role 'admin')
    const deletedUsers = await tx.user.deleteMany({
      where: {
        storeId: store.id,
        NOT: {
          OR: [
            { username: "admin_user" },
            { role: "admin" },
          ],
        },
      },
    });

    return {
      deletedEmailLogs: deletedEmailLogs.count,
      deletedOrderItems: deletedOrderItems.count,
      deletedOrders: deletedOrders.count,
      deletedProducts: deletedProducts.count,
      deletedCategories: deletedCategories.count,
      deletedUsers: deletedUsers.count,
    };
  });

  // Check remaining users for verification
  const remainingUsers = await prisma.user.findMany({
    where: { storeId: store.id },
    select: { username: true, role: true, email: true },
  });

  console.log(`\n✅ Data cleanup complete for tenant "${store.name}" (${store.slug})!`);
  console.log(`-----------------------------------------------------`);
  console.log(`  🗑️  Deleted Email Logs:   ${results.deletedEmailLogs}`);
  console.log(`  🗑️  Deleted Order Items:  ${results.deletedOrderItems}`);
  console.log(`  🗑️  Deleted Orders:       ${results.deletedOrders}`);
  console.log(`  🗑️  Deleted Products:     ${results.deletedProducts}`);
  console.log(`  🗑️  Deleted Categories:   ${results.deletedCategories}`);
  console.log(`  🗑️  Deleted Users:        ${results.deletedUsers}`);
  console.log(`-----------------------------------------------------`);
  console.log(`\n👑 Preserved Accounts (${remainingUsers.length}):`);
  remainingUsers.forEach((u) => {
    console.log(`   - [${u.role.toUpperCase()}] ${u.username} (${u.email})`);
  });
  console.log("");
}

const targetSlug = process.argv[2] || "bhagwandas-traders";

resetTenantData(targetSlug)
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("\n❌ Error resetting tenant data:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
