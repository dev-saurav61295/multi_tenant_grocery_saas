import { PrismaClient, type OrderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;
const SINGLETON_ID = "singleton";

const demoUsers = [
  { username: "admin_user", password: "password123", name: "Bhagwandas Admin", role: "admin" as const },
  { username: "staff_user", password: "password123", name: "Packing Staff", role: "staff" as const },
  { username: "delivery_user", password: "password123", name: "Delivery Rider", role: "delivery" as const },
  { username: "neha_sharma", password: "password123", name: "Neha Sharma", role: "customer" as const },
  { username: "mohan_verma", password: "password123", name: "Mohan Verma", role: "customer" as const },
  { username: "aarav_jain", password: "password123", name: "Aarav Jain", role: "customer" as const },
  { username: "suhani_gupta", password: "password123", name: "Suhani Gupta", role: "customer" as const },
];

const demoProducts = [
  { id: "amul-milk", name: "Amul Gold Milk", brand: "Amul", size: "1L Pouch", price: 72, category: "Dairy", description: "Fresh toned milk for everyday delivery.", comboEligible: false, stock: 84 },
  { id: "banana-combo", name: "Robusta Banana Combo", brand: "Local Farm", size: "1 Dozen", price: 65, category: "Fruits", description: "Popular family bundle eligible for combo pricing.", comboEligible: true, stock: 24 },
  { id: "atta", name: "Aashirvaad Atta", brand: "Aashirvaad", size: "5 KG", price: 289, category: "Staples", description: "Chakki fresh whole wheat flour.", comboEligible: false, stock: 21 },
  { id: "salt", name: "Tata Salt", brand: "Tata", size: "1 KG", price: 30, category: "Staples", description: "Vacuum evaporated iodised salt.", comboEligible: false, stock: 66 },
  { id: "oil", name: "Fortune Sunlite Oil", brand: "Fortune", size: "1 Litre", price: 160, category: "Cooking", description: "Daily cooking sunflower oil.", comboEligible: false, stock: 39 },
  { id: "rice", name: "India Gate Basmati Rice", brand: "India Gate", size: "5 KG", price: 499, category: "Staples", description: "Long grain basmati for everyday meals.", comboEligible: false, stock: 18 },
  { id: "tomato", name: "Fresh Tomato", brand: "Mandi Select", size: "1 KG", price: 42, category: "Vegetables", description: "Sorted grade A tomatoes.", comboEligible: false, stock: 57 },
  { id: "biscuits", name: "Parle-G Family Pack", brand: "Parle", size: "800 G", price: 95, category: "Snacks", description: "Fast moving essentials for monthly baskets.", comboEligible: false, stock: 40 },
];

type DemoOrder = {
  username: string;
  phone: string;
  address: string;
  status: OrderStatus;
  items: { productId: string; quantity: number }[];
  distanceKm?: number;
  eta?: string;
  createdAt?: Date;
};

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const demoOrders: DemoOrder[] = [
  {
    username: "neha_sharma",
    phone: "+91 98765 21001",
    address: "12/4 Civil Lines, Near Green Park Gate",
    status: "pending_verification",
    items: [
      { productId: "amul-milk", quantity: 2 },
      { productId: "banana-combo", quantity: 3 },
      { productId: "atta", quantity: 1 },
    ],
  },
  {
    username: "mohan_verma",
    phone: "+91 98765 21002",
    address: "88 Station Road, Opposite Old Post Office",
    status: "verified",
    items: [
      { productId: "oil", quantity: 2 },
      { productId: "salt", quantity: 1 },
      { productId: "tomato", quantity: 2 },
    ],
  },
  {
    username: "aarav_jain",
    phone: "+91 98765 21003",
    address: "14 Collectorate Road, Near District Court",
    status: "packing",
    items: [
      { productId: "rice", quantity: 1 },
      { productId: "biscuits", quantity: 2 },
      { productId: "amul-milk", quantity: 1 },
    ],
  },
  {
    username: "suhani_gupta",
    phone: "+91 98765 21004",
    address: "A-17 Khandari, Near Community Hall",
    status: "out_for_delivery",
    distanceKm: 4.7,
    eta: "24 mins",
    items: [
      { productId: "banana-combo", quantity: 3 },
      { productId: "atta", quantity: 1 },
      { productId: "salt", quantity: 1 },
    ],
  },
  {
    username: "neha_sharma",
    phone: "+91 98765 21001",
    address: "12/4 Civil Lines, Near Green Park Gate",
    status: "delivered",
    createdAt: yesterday,
    items: [
      { productId: "tomato", quantity: 2 },
      { productId: "biscuits", quantity: 1 },
    ],
  },
];

function computeComboDiscount(lines: { comboEligible: boolean; quantity: number }[]) {
  return lines.filter((line) => line.comboEligible && line.quantity >= 3).length * 20;
}

function formatDateForDisplayId(date: Date) {
  const yy = String(date.getFullYear() % 100).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

async function seedUsers() {
  for (const demoUser of demoUsers) {
    const passwordHash = await bcrypt.hash(demoUser.password, SALT_ROUNDS);

    await prisma.user.upsert({
      where: { username: demoUser.username },
      update: { passwordHash, name: demoUser.name, role: demoUser.role },
      create: {
        username: demoUser.username,
        passwordHash,
        name: demoUser.name,
        role: demoUser.role,
      },
    });
  }
}

async function seedProducts() {
  for (const product of demoProducts) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product,
    });
  }
}

async function seedStoreSettings() {
  await prisma.storeSettings.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID, openingTime: "09:00", closingTime: "20:00", hourlyCapacity: 40 },
  });
}

async function seedOrders() {
  // Only seed orders once — re-running the seed shouldn't duplicate demo orders.
  const existingOrderCount = await prisma.order.count();
  if (existingOrderCount > 0) {
    return;
  }

  const products = await prisma.product.findMany();
  const productsById = new Map(products.map((product) => [product.id, product]));

  for (const demoOrder of demoOrders) {
    const user = await prisma.user.findUniqueOrThrow({ where: { username: demoOrder.username } });

    const lines = demoOrder.items.map((item) => {
      const product = productsById.get(item.productId);
      if (!product) {
        throw new Error(`Seed order references unknown product "${item.productId}"`);
      }
      return { ...item, comboEligible: product.comboEligible, unitPrice: product.price };
    });

    const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
    const comboDiscount = computeComboDiscount(lines);
    const total = subtotal - comboDiscount;

    await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: user.id,
          status: demoOrder.status,
          phone: demoOrder.phone,
          address: demoOrder.address,
          subtotal,
          comboDiscount,
          total,
          distanceKm: demoOrder.distanceKm,
          eta: demoOrder.eta,
          createdAt: demoOrder.createdAt,
          displayId: "",
          items: {
            create: lines.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
            })),
          },
        },
      });

      for (const line of lines) {
        await tx.product.update({
          where: { id: line.productId },
          data: { stock: { decrement: line.quantity } },
        });
      }

      const displayId = `BGD-${formatDateForDisplayId(created.createdAt)}-${100 + created.orderNumber}`;
      await tx.order.update({ where: { id: created.id }, data: { displayId } });
    });
  }
}

async function main() {
  await seedUsers();
  await seedProducts();
  await seedStoreSettings();
  await seedOrders();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
