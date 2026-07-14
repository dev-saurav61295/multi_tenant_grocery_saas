import { PrismaClient, type OrderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

type DemoUser = {
  username: string;
  email: string;
  password: string;
  name: string;
  role: "admin" | "staff" | "delivery" | "customer";
};

type DemoProduct = {
  id: string;
  name: string;
  brand: string;
  size: string;
  price: number;
  category: string;
  description: string;
  comboEligible: boolean;
  stock: number;
  imageUrl?: string;
};

/** Deterministic demo photo per product id — picsum.photos "seed" images are stable across requests. */
function demoImageUrl(productId: string) {
  return `https://picsum.photos/seed/${productId}/480/480`;
}

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

const stores = [
  {
    name: "Bhagwandas Traders",
    slug: "bhagwandas-traders",
    codePrefix: "BGD",
    openingTime: "09:00",
    closingTime: "20:00",
    hourlyCapacity: 40,
    upiId: "bhagwandas@upi",
    users: [
      { username: "admin_user", email: "admin.bhagwandas@example.com", password: "password123", name: "Bhagwandas Admin", role: "admin" as const },
      { username: "staff_user", email: "staff.bhagwandas@example.com", password: "password123", name: "Packing Staff", role: "staff" as const },
      { username: "delivery_user", email: "delivery.bhagwandas@example.com", password: "password123", name: "Delivery Rider", role: "delivery" as const },
      { username: "neha_sharma", email: "neha.sharma@example.com", password: "password123", name: "Neha Sharma", role: "customer" as const },
      { username: "mohan_verma", email: "mohan.verma@example.com", password: "password123", name: "Mohan Verma", role: "customer" as const },
      { username: "aarav_jain", email: "aarav.jain@example.com", password: "password123", name: "Aarav Jain", role: "customer" as const },
      { username: "suhani_gupta", email: "suhani.gupta@example.com", password: "password123", name: "Suhani Gupta", role: "customer" as const },
    ] satisfies DemoUser[],
    products: [
      { id: "amul-milk", name: "Amul Gold Milk", brand: "Amul", size: "1L Pouch", price: 72, category: "Dairy", description: "Fresh toned milk for everyday delivery.", comboEligible: false, stock: 84 },
      { id: "banana-combo", name: "Robusta Banana Combo", brand: "Local Farm", size: "1 Dozen", price: 65, category: "Fruits", description: "Popular family bundle eligible for combo pricing.", comboEligible: true, stock: 24 },
      { id: "atta", name: "Aashirvaad Atta", brand: "Aashirvaad", size: "5 KG", price: 289, category: "Staples", description: "Chakki fresh whole wheat flour.", comboEligible: false, stock: 21 },
      { id: "salt", name: "Tata Salt", brand: "Tata", size: "1 KG", price: 30, category: "Staples", description: "Vacuum evaporated iodised salt.", comboEligible: false, stock: 66 },
      { id: "oil", name: "Fortune Sunlite Oil", brand: "Fortune", size: "1 Litre", price: 160, category: "Cooking", description: "Daily cooking sunflower oil.", comboEligible: false, stock: 39 },
      { id: "rice", name: "India Gate Basmati Rice", brand: "India Gate", size: "5 KG", price: 499, category: "Staples", description: "Long grain basmati for everyday meals.", comboEligible: false, stock: 18 },
      { id: "tomato", name: "Fresh Tomato", brand: "Mandi Select", size: "1 KG", price: 42, category: "Vegetables", description: "Sorted grade A tomatoes.", comboEligible: false, stock: 57 },
      { id: "biscuits", name: "Parle-G Family Pack", brand: "Parle", size: "800 G", price: 95, category: "Snacks", description: "Fast moving essentials for monthly baskets.", comboEligible: false, stock: 40 },
    ] satisfies DemoProduct[],
    orders: [
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
    ] satisfies DemoOrder[],
  },
  {
    name: "Fresh Mart Express",
    slug: "fresh-mart-express",
    codePrefix: "FME",
    openingTime: "08:30",
    closingTime: "21:00",
    hourlyCapacity: 30,
    upiId: "freshmart@upi",
    users: [
      { username: "admin_user", email: "admin.freshmart@example.com", password: "password123", name: "Fresh Mart Admin", role: "admin" as const },
      { username: "floor_user", email: "staff.freshmart@example.com", password: "password123", name: "Floor Staff", role: "staff" as const },
      { username: "rider_user", email: "delivery.freshmart@example.com", password: "password123", name: "Fresh Rider", role: "delivery" as const },
      { username: "rhea_patel", email: "rhea.patel@example.com", password: "password123", name: "Rhea Patel", role: "customer" as const },
      { username: "iman_ali", email: "iman.ali@example.com", password: "password123", name: "Iman Ali", role: "customer" as const },
    ] satisfies DemoUser[],
    products: [
      { id: "fme-milk", name: "Fresh Mart Milk", brand: "Farm Fresh", size: "1L Pouch", price: 68, category: "Dairy", description: "Daily milk supply for local households.", comboEligible: false, stock: 55 },
      { id: "fme-bread", name: "Soft White Bread", brand: "Fresh Mart", size: "400 G", price: 42, category: "Bakery", description: "Soft bread for breakfast and snacks.", comboEligible: false, stock: 32 },
      { id: "fme-rice", name: "Golden Grain Rice", brand: "Fresh Mart", size: "5 KG", price: 469, category: "Staples", description: "Household staple with consistent quality.", comboEligible: false, stock: 26 },
      { id: "fme-fruit-pack", name: "Seasonal Fruit Pack", brand: "Fresh Mart", size: "1 Pack", price: 149, category: "Fruits", description: "Assorted seasonal fruit bundle.", comboEligible: true, stock: 18 },
    ] satisfies DemoProduct[],
    orders: [
      {
        username: "rhea_patel",
        phone: "+91 98765 33001",
        address: "22 Lake View Apartments, Near Central Park",
        status: "pending_verification",
        items: [
          { productId: "fme-milk", quantity: 2 },
          { productId: "fme-bread", quantity: 2 },
          { productId: "fme-fruit-pack", quantity: 1 },
        ],
      },
      {
        username: "iman_ali",
        phone: "+91 98765 33002",
        address: "8 Market Road, Opposite City Library",
        status: "packing",
        items: [
          { productId: "fme-rice", quantity: 1 },
          { productId: "fme-milk", quantity: 1 },
        ],
      },
    ] satisfies DemoOrder[],
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

async function seedStores() {
  for (const store of stores) {
    await prisma.store.upsert({
      where: { slug: store.slug },
      update: {
        name: store.name,
        codePrefix: store.codePrefix,
        openingTime: store.openingTime,
        closingTime: store.closingTime,
        hourlyCapacity: store.hourlyCapacity,
        upiId: store.upiId,
      },
      create: {
        name: store.name,
        slug: store.slug,
        codePrefix: store.codePrefix,
        openingTime: store.openingTime,
        closingTime: store.closingTime,
        hourlyCapacity: store.hourlyCapacity,
        upiId: store.upiId,
      },
    });
  }
}

async function seedUsers(store: (typeof stores)[number]) {
  const storeRecord = await prisma.store.findUniqueOrThrow({ where: { slug: store.slug } });

  for (const demoUser of store.users) {
    const passwordHash = await bcrypt.hash(demoUser.password, SALT_ROUNDS);

    await prisma.user.upsert({
      where: {
        storeId_username: {
          storeId: storeRecord.id,
          username: demoUser.username,
        },
      },
      update: {
        passwordHash,
        name: demoUser.name,
        role: demoUser.role,
        email: demoUser.email,
        emailVerifyToken: null,
        emailVerifyExpires: null,
        emailVerifiedAt: null,
      },
      create: {
        storeId: storeRecord.id,
        username: demoUser.username,
        email: demoUser.email,
        passwordHash,
        name: demoUser.name,
        role: demoUser.role,
      },
    });
  }
}

async function seedProducts(store: (typeof stores)[number]) {
  const storeRecord = await prisma.store.findUniqueOrThrow({ where: { slug: store.slug } });

  for (const product of store.products as DemoProduct[]) {
    const data = { ...product, imageUrl: product.imageUrl ?? demoImageUrl(product.id), storeId: storeRecord.id };
    await prisma.product.upsert({
      where: { id: product.id },
      update: data,
      create: data,
    });
  }
}

async function seedOrders(store: (typeof stores)[number]) {
  const storeRecord = await prisma.store.findUniqueOrThrow({ where: { slug: store.slug } });

  const existingOrderCount = await prisma.order.count({ where: { storeId: storeRecord.id } });
  if (existingOrderCount > 0) {
    return;
  }

  const products = await prisma.product.findMany({ where: { storeId: storeRecord.id } });
  const productsById = new Map(products.map((product) => [product.id, product]));

  for (const demoOrder of store.orders) {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        storeId_username: {
          storeId: storeRecord.id,
          username: demoOrder.username,
        },
      },
    });

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
          storeId: storeRecord.id,
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

      const displayId = `${storeRecord.codePrefix}-${formatDateForDisplayId(created.createdAt)}-${100 + created.orderNumber}`;
      await tx.order.update({ where: { id: created.id }, data: { displayId } });
    });
  }
}

async function main() {
  await seedStores();

  for (const store of stores) {
    await seedUsers(store);
    await seedProducts(store);
    await seedOrders(store);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
