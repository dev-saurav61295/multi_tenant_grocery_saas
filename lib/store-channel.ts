// Pure, dependency-free — imported by both the server publisher (lib/realtime.ts)
// and the client subscriber (lib/use-store-events.ts).
export function storeChannelName(storeId: string): string {
  return `store:${storeId}`;
}

export const ORDERS_CHANGED_EVENT = "orders-changed";

export type StoreEventKind = "placed" | "verified" | "assigned" | "accepted" | "dispatched" | "delivered";

// Doorbell metadata only — never put order details (customer, items, amounts) here.
export type StoreEventPayload = {
  orderId: string;
  displayId: string;
  kind: StoreEventKind;
};
