import { runtimeUsers } from "@/config";

export type Role = "customer" | "admin" | "staff" | "delivery";

export const roleHome: Record<Role, string> = {
  admin: "/admin/orders",
  staff: "/staff/packing",
  delivery: "/delivery/dashboard",
  customer: "/",
};

export type AppUser = {
  id: string;
  username: string;
  password: string;
  name: string;
  role: Role;
};

const users = runtimeUsers as AppUser[];

export function findUserByCredentials(username: string, password: string): AppUser | null {
  return (
    users.find((user) => user.username === username && user.password === password) ?? null
  );
}

export function findUserByUsername(username: string): AppUser | null {
  return users.find((user) => user.username === username) ?? null;
}

export function registerCustomer(input: { username: string; password: string; name: string }): AppUser {
  const user: AppUser = {
    id: `u-cust-${users.length + 1}`,
    username: input.username,
    password: input.password,
    name: input.name,
    role: "customer",
  };

  users.push(user);

  return user;
}
