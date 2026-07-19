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
      { id: "farm-fresh-milk", name: "Farm Fresh Milk", brand: "Farm Fresh", size: "1 Litre - Pouch", price: 62, category: "Dairy", description: "Fresh toned milk for everyday delivery.", comboEligible: true, stock: 84, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuADc04G1Ci40gQVB_dhb-xUEotQv-K--G4vSC0i9DYJCnxlfeg1wSxsVBBS7DycUYO2Ka6nfv7W3TAYm1X5JKBE8WucL9g2WYwrRHXTkMy2UTumtkBk1UzNMxau3OfnHR3JGvXmJuh0EAE6_jGHtW8VKPwb5tk0mDNBYKj3TrtO3lT0cgb433e771-9XE7ZOvc_Q1Erj-rWSnVnCFiJvyuiVSTRPJbNn0p3aPDzvKUP1qYD5Xkqj6tG" },
      { id: "organic-eggs", name: "Organic Brown Eggs", brand: "Farm Fresh", size: "Pack of 6", price: 95, category: "Dairy", description: "Certified organic, farm fresh brown eggs.", comboEligible: false, stock: 60, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAqrnztMlrgsCso41NSgp0SyhtYyd5EdBe9x8O97g6kvTvT-oENnfpHJX-khApsupH2zW-QXZX2E0WsRdX0wYeCRm3eGlf5eOfulx9tWboTJ1AVtykT4VKs73DZCv7-recPMLtx1wE2bx_sBCOQztOmmsds7-79VzclTPNyidiKNExWM6JPI8DjhRnQ7W7muaAEyZse6r8SxPIU5-mCIUoqvpmGDvZejq_fqSEO60e1GFZr6XWUpVKj" },
      { id: "royal-gala-apples", name: "Royal Gala Apples", brand: "Organic Farms", size: "1 kg - Approx 6-7 pcs", price: 180, category: "Fruits", description: "Crisp, organically grown Royal Gala apples.", comboEligible: false, stock: 45, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtHG_SI_mIKEHbOSdRffhfMkQL595n4KtmFZuHcohbGZmyPqESMcBkjKuuMh3UhRQQLvEepZ1cIhXn_MIclsWkVQZVKF0ogKzvx5ZGyoMbY4SZeWaifxjAiD_1z_RlqDwy0QmMi8HJ5Sl0L-1oeaP453Dns2Fodxm1uwpNNoWPVxUBFJGMouxoW7RrIJrYmibgCOf2lPUq1Rh2fTItjSoH0BT3qz__ob86rh6lLgovSPFYR2MlVmyB" },
      { id: "multigrain-bread", name: "Multigrain Bread", brand: "Fresh Bakery", size: "400g - Sliced", price: 45, category: "Bakery", description: "Freshly baked multigrain sliced bread.", comboEligible: false, stock: 30, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC58B500lt7pRnXWKi82uu1JxMSW9vASXdC6nQdZgUbO1JADPbYgZQNN4u8DZErOkh86RuuzVpcYjHuLQtwQFioOQ294dBic6nL3w55srKZflOmp_M8l9OhdAd1z9mPm5bOh9mzaRxUIXEMsg_cTXL-IOZcFzRtXYiaSAFbvIWazvxtzZhYL431tVFtsHDDEHXwJhBEmf45GrmPc2W_gX2ctqlF5e93tf9mCy2Lglr8sNndg9L8RIUA" },
      { id: "alphonso-mangoes", name: "Alphonso Mangoes", brand: "Ratnagiri Farms", size: "Pack of 2", price: 240, category: "Fruits", description: "Limited season Alphonso mangoes.", comboEligible: false, stock: 20, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBu4HpSmyoauF26uUMDYc86PeOe2tNmzu74JJ9KS-8WgJj4uRzjILP7gwSDxttnBqY1Dqf_1CmnwNTw3yq5jtz-f4Gz9vy3ckgvx40rH6xGFsdNe8JB4cizoNAYgjxuSnl6ehtK6QVZV57_q4VKfy32Cj2xMWp0JjxjXqQMG28FqNXQ2nbbqDmtny11I7QsmzWSI2qIjc9L0G7mRZpZGX7Iqm33DpfyGGiH8KBEhKMh9Y0cM2LcUYko" },
    ] satisfies DemoProduct[],
    orders: [
      {
        username: "neha_sharma",
        phone: "+91 98765 21001",
        address: "12/4 Civil Lines, Near Green Park Gate",
        status: "pending_verification",
        items: [
          { productId: "farm-fresh-milk", quantity: 3 },
          { productId: "organic-eggs", quantity: 1 },
        ],
      },
      {
        username: "mohan_verma",
        phone: "+91 98765 21002",
        address: "88 Station Road, Opposite Old Post Office",
        status: "verified",
        items: [
          { productId: "royal-gala-apples", quantity: 2 },
          { productId: "multigrain-bread", quantity: 2 },
        ],
      },
      {
        username: "aarav_jain",
        phone: "+91 98765 21003",
        address: "14 Collectorate Road, Near District Court",
        status: "packing",
        items: [
          { productId: "alphonso-mangoes", quantity: 1 },
          { productId: "farm-fresh-milk", quantity: 1 },
          { productId: "organic-eggs", quantity: 2 },
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
          { productId: "multigrain-bread", quantity: 2 },
          { productId: "royal-gala-apples", quantity: 1 },
        ],
      },
      {
        username: "neha_sharma",
        phone: "+91 98765 21001",
        address: "12/4 Civil Lines, Near Green Park Gate",
        status: "delivered",
        createdAt: yesterday,
        items: [
          { productId: "alphonso-mangoes", quantity: 1 },
          { productId: "organic-eggs", quantity: 1 },
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
      { id: "fme-milk", name: "Fresh Mart Milk", brand: "Farm Fresh", size: "1L Pouch", price: 68, category: "Dairy", description: "Daily milk supply for local households.", comboEligible: false, stock: 55, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Oat_milk_glass_and_bottles.jpg/500px-Oat_milk_glass_and_bottles.jpg" },
      { id: "fme-bread", name: "Soft White Bread", brand: "Fresh Mart", size: "400 G", price: 42, category: "Bakery", description: "Soft bread for breakfast and snacks.", comboEligible: false, stock: 32, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Fresh_made_bread_05.jpg/500px-Fresh_made_bread_05.jpg" },
      { id: "fme-rice", name: "Golden Grain Rice", brand: "Fresh Mart", size: "5 KG", price: 469, category: "Staples", description: "Household staple with consistent quality.", comboEligible: false, stock: 26, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Uncooked_ST25_rice_on_bamboo_surface.jpg/500px-Uncooked_ST25_rice_on_bamboo_surface.jpg" },
      { id: "fme-fruit-pack", name: "Seasonal Fruit Pack", brand: "Fresh Mart", size: "1 Pack", price: 149, category: "Fruits", description: "Assorted seasonal fruit bundle.", comboEligible: true, stock: 18, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/DFC_2197_A_colorful_assortment_of_fresh_fruits_and_vegetables_-_apples_mango_dragon_fruit_kiwis_limes_bananas_and_more_-_arranged_on_a_wooden_crate.jpg/500px-DFC_2197_A_colorful_assortment_of_fresh_fruits_and_vegetables_-_apples_mango_dragon_fruit_kiwis_limes_bananas_and_more_-_arranged_on_a_wooden_crate.jpg" },
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
    const data = { ...product, storeId: storeRecord.id };
    await prisma.product.upsert({
      where: { id: product.id },
      update: data,
      create: data,
    });
  }
}

async function seedCategories(store: (typeof stores)[number]) {
  const storeRecord = await prisma.store.findUniqueOrThrow({ where: { slug: store.slug } });

  const names = [...new Set((store.products as DemoProduct[]).map((product) => product.category))];

  for (const name of names) {
    await prisma.category.upsert({
      where: { storeId_name: { storeId: storeRecord.id, name } },
      update: {},
      create: { storeId: storeRecord.id, name },
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
    await seedCategories(store);
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
