export type Product = {
  id: string;
  name: string;
  brand: string;
  size: string;
  price: number;
  category: string;
  description: string;
  comboEligible?: boolean;
  defaultQuantity: number;
};

export type OrderRecord = {
  id: string;
  customer: string;
  phone: string;
  area: string;
  total: number;
  status: "Pending Verification" | "Verified";
  createdAt: string;
  screenshotName: string;
  notes: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  brand: string;
  size: string;
  price: number;
  stock: number;
};

export type PackingOrder = {
  id: string;
  customer: string;
  slot: string;
  priority: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
};

export type DeliveryStop = {
  id: string;
  customer: string;
  orderId: string;
  address: string;
  distanceKm: number;
  phone: string;
  mapUrl: string;
  eta: string;
};

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Packer";
  status: string;
};

export const catalogProducts: Product[] = [
  {
    id: "amul-milk",
    name: "Amul Gold Milk",
    brand: "Amul",
    size: "1L Pouch",
    price: 72,
    category: "Dairy",
    description: "Fresh toned milk for everyday delivery.",
    defaultQuantity: 2,
  },
  {
    id: "banana-combo",
    name: "Robusta Banana Combo",
    brand: "Local Farm",
    size: "1 Dozen",
    price: 65,
    category: "Fruits",
    description: "Popular family bundle eligible for combo pricing.",
    comboEligible: true,
    defaultQuantity: 3,
  },
  {
    id: "atta",
    name: "Aashirvaad Atta",
    brand: "Aashirvaad",
    size: "5 KG",
    price: 289,
    category: "Staples",
    description: "Chakki fresh whole wheat flour.",
    defaultQuantity: 1,
  },
  {
    id: "salt",
    name: "Tata Salt",
    brand: "Tata",
    size: "1 KG",
    price: 30,
    category: "Staples",
    description: "Vacuum evaporated iodised salt.",
    defaultQuantity: 1,
  },
  {
    id: "oil",
    name: "Fortune Sunlite Oil",
    brand: "Fortune",
    size: "1 Litre",
    price: 160,
    category: "Cooking",
    description: "Daily cooking sunflower oil.",
    defaultQuantity: 0,
  },
  {
    id: "rice",
    name: "India Gate Basmati Rice",
    brand: "India Gate",
    size: "5 KG",
    price: 499,
    category: "Staples",
    description: "Long grain basmati for everyday meals.",
    defaultQuantity: 0,
  },
  {
    id: "tomato",
    name: "Fresh Tomato",
    brand: "Mandi Select",
    size: "1 KG",
    price: 42,
    category: "Vegetables",
    description: "Sorted grade A tomatoes.",
    defaultQuantity: 0,
  },
  {
    id: "biscuits",
    name: "Parle-G Family Pack",
    brand: "Parle",
    size: "800 G",
    price: 95,
    category: "Snacks",
    description: "Fast moving essentials for monthly baskets.",
    defaultQuantity: 0,
  },
];

export const recentOrders: OrderRecord[] = [
  {
    id: "BGD-240731-101",
    customer: "Neha Sharma",
    phone: "+91 98765 21001",
    area: "Civil Lines",
    total: 708,
    status: "Pending Verification",
    createdAt: "9:12 AM",
    screenshotName: "upi-receipt-neha.png",
    notes: "Requested fast verification before 11 AM delivery slot.",
  },
  {
    id: "BGD-240731-102",
    customer: "Mohan Verma",
    phone: "+91 98765 21002",
    area: "Station Road",
    total: 522,
    status: "Pending Verification",
    createdAt: "9:28 AM",
    screenshotName: "payment-proof-mohan.jpg",
    notes: "Customer added a gate landmark in the screenshot caption.",
  },
  {
    id: "BGD-240731-103",
    customer: "Aarav Jain",
    phone: "+91 98765 21003",
    area: "Collectorate",
    total: 914,
    status: "Verified",
    createdAt: "8:54 AM",
    screenshotName: "verified-aarav.png",
    notes: "Already pushed to packing queue.",
  },
  {
    id: "BGD-240731-104",
    customer: "Suhani Gupta",
    phone: "+91 98765 21004",
    area: "Khandari",
    total: 645,
    status: "Pending Verification",
    createdAt: "10:02 AM",
    screenshotName: "suhani-upi-slip.png",
    notes: "Partial cash note removed after phone confirmation.",
  },
];

export const inventoryItems: InventoryItem[] = [
  { id: "inv-1", name: "Amul Gold Milk", brand: "Amul", size: "1L Pouch", price: 72, stock: 84 },
  { id: "inv-2", name: "Aashirvaad Atta", brand: "Aashirvaad", size: "5 KG", price: 289, stock: 21 },
  { id: "inv-3", name: "India Gate Basmati Rice", brand: "India Gate", size: "5 KG", price: 499, stock: 18 },
  { id: "inv-4", name: "Fortune Sunlite Oil", brand: "Fortune", size: "1 Litre", price: 160, stock: 39 },
  { id: "inv-5", name: "Fresh Tomato", brand: "Mandi Select", size: "1 KG", price: 42, stock: 57 },
  { id: "inv-6", name: "Tata Salt", brand: "Tata", size: "1 KG", price: 30, stock: 66 },
  { id: "inv-7", name: "Parle-G Family Pack", brand: "Parle", size: "800 G", price: 95, stock: 40 },
  { id: "inv-8", name: "Robusta Banana Combo", brand: "Local Farm", size: "1 Dozen", price: 65, stock: 24 },
];

export const packingOrders: PackingOrder[] = [
  {
    id: "PK-901",
    customer: "Neha Sharma",
    slot: "11:00 AM - 1:00 PM",
    priority: "Express",
    items: [
      { id: "pack-1", name: "Amul Gold Milk", quantity: 2 },
      { id: "pack-2", name: "Robusta Banana Combo", quantity: 3 },
      { id: "pack-3", name: "Aashirvaad Atta", quantity: 1 },
    ],
  },
  {
    id: "PK-902",
    customer: "Mohan Verma",
    slot: "1:00 PM - 3:00 PM",
    priority: "Standard",
    items: [
      { id: "pack-4", name: "Fortune Sunlite Oil", quantity: 2 },
      { id: "pack-5", name: "Tata Salt", quantity: 1 },
      { id: "pack-6", name: "Fresh Tomato", quantity: 2 },
    ],
  },
  {
    id: "PK-903",
    customer: "Suhani Gupta",
    slot: "4:00 PM - 6:00 PM",
    priority: "High Basket",
    items: [
      { id: "pack-7", name: "India Gate Basmati Rice", quantity: 1 },
      { id: "pack-8", name: "Parle-G Family Pack", quantity: 2 },
      { id: "pack-9", name: "Amul Gold Milk", quantity: 1 },
    ],
  },
];

export const deliveryStops: DeliveryStop[] = [
  {
    id: "DL-501",
    customer: "Neha Sharma",
    orderId: "BGD-240731-101",
    address: "12/4 Civil Lines, Near Green Park Gate",
    distanceKm: 2.1,
    phone: "+91 98765 21001",
    mapUrl: "https://maps.google.com/?q=Civil+Lines",
    eta: "12 mins",
  },
  {
    id: "DL-502",
    customer: "Mohan Verma",
    orderId: "BGD-240731-102",
    address: "88 Station Road, Opposite Old Post Office",
    distanceKm: 3.4,
    phone: "+91 98765 21002",
    mapUrl: "https://maps.google.com/?q=Station+Road",
    eta: "19 mins",
  },
  {
    id: "DL-503",
    customer: "Suhani Gupta",
    orderId: "BGD-240731-104",
    address: "A-17 Khandari, Near Community Hall",
    distanceKm: 4.7,
    phone: "+91 98765 21004",
    mapUrl: "https://maps.google.com/?q=Khandari",
    eta: "24 mins",
  },
];

export const staffMembers: StaffMember[] = [
  { id: "staff-1", name: "Bhagwandas Admin", email: "admin@bhagwandas.com", role: "Admin", status: "Active Now" },
  { id: "staff-2", name: "Ritika Malhotra", email: "ritika.m@bhagwandas.com", role: "Manager", status: "Active Now" },
  { id: "staff-3", name: "Packing Staff", email: "staff@bhagwandas.com", role: "Packer", status: "Offline" },
  { id: "staff-4", name: "Vikram Singh", email: "vikram.s@bhagwandas.com", role: "Packer", status: "Last active 2h ago" },
  { id: "staff-5", name: "Anjali Kapoor", email: "anjali.k@bhagwandas.com", role: "Manager", status: "Offline" },
];