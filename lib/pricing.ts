import "server-only";
import { prisma } from "@/lib/prisma";
import { computeComboDiscount, type CartLine } from "@/lib/cart";

export type PricedLine = CartLine & {
  name: string;
  price: number;
  comboEligible: boolean;
  lineTotal: number;
};

export type PricedCart = {
  lines: PricedLine[];
  subtotal: number;
  comboDiscount: number;
  total: number;
};

export async function priceCart(storeId: string, lines: CartLine[]): Promise<PricedCart> {
  const products = await prisma.product.findMany({
    where: { storeId, active: true, id: { in: lines.map((line) => line.productId) } },
  });

  const productsById = new Map(products.map((product) => [product.id, product]));

  const priced = lines
    .map((line) => {
      const product = productsById.get(line.productId);

      if (!product) {
        return null;
      }

      return {
        ...line,
        name: product.name,
        price: product.price,
        comboEligible: product.comboEligible,
        lineTotal: product.price * line.quantity,
      };
    })
    .filter((line): line is PricedLine => line !== null);

  const subtotal = priced.reduce((sum, line) => sum + line.lineTotal, 0);
  const comboDiscount = computeComboDiscount(priced);

  return { lines: priced, subtotal, comboDiscount, total: subtotal - comboDiscount };
}
