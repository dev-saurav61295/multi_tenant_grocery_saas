"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/session";
import { findUserByCredentials, findUserByUsername, registerCustomer, roleHome } from "@/lib/users";

export type AuthState = { error: string } | undefined;

export async function login(_state: AuthState, formData: FormData): Promise<AuthState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const user = findUserByCredentials(username, password);

  if (!user) {
    return { error: "Invalid username or password." };
  }

  await createSession(user);
  redirect(roleHome[user.role]);
}

export async function register(_state: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !username || !password) {
    return { error: "Please fill in every field." };
  }

  if (findUserByUsername(username)) {
    return { error: "That username is already taken." };
  }

  const user = registerCustomer({ username, password, name });
  await createSession(user);
  redirect(roleHome[user.role]);
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
