// Mock user store for initial development. No real database yet — this is an
// in-memory seed, not a durable store. Runtime registrations reset on restart.
export const seedUsers = [
  {
    id: "u-admin-1",
    username: "admin_user",
    password: "password123",
    name: "Bhagwandas Admin",
    role: "admin",
  },
  {
    id: "u-staff-1",
    username: "staff_user",
    password: "password123",
    name: "Packing Staff",
    role: "staff",
  },
  {
    id: "u-delivery-1",
    username: "delivery_user",
    password: "password123",
    name: "Delivery Rider",
    role: "delivery",
  },
  {
    id: "u-cust-1",
    username: "neha_sharma",
    password: "password123",
    name: "Neha Sharma",
    role: "customer",
  },
];

export const runtimeUsers = [...seedUsers];
