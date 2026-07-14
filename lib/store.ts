import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getStoreBySlug = cache(async (slug: string) => {
  return prisma.store.findUnique({ where: { slug } });
});