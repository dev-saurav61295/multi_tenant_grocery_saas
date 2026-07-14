// Pure, dependency-free helpers — safe to import from client components.
// Server-side pricing (which needs Prisma) lives in lib/pricing.ts instead.
export type CartLine = { productId: string; quantity: number };

export function parseCartParam(raw: string | undefined | null): CartLine[] {
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((pair) => {
      const [productId, quantityRaw] = pair.split(":");
      return { productId, quantity: Number.parseInt(quantityRaw ?? "", 10) };
    })
    .filter(
      (line): line is CartLine =>
        Boolean(line.productId) && Number.isFinite(line.quantity) && line.quantity > 0 && line.quantity <= 99
    );
}

export function cartParamFromLines(lines: CartLine[]): string {
  return lines.map((line) => `${line.productId}:${line.quantity}`).join(",");
}

// Same flat +₹20-per-eligible-line rule used on the catalog page.
export function computeComboDiscount(lines: { comboEligible: boolean; quantity: number }[]): number {
  return lines.filter((line) => line.comboEligible && line.quantity >= 3).length * 20;
}
