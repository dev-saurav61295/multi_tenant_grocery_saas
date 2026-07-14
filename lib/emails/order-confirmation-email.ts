import { formatCurrency } from "@/lib/format";

type OrderConfirmationEmailInput = {
  storeName: string;
  displayId: string;
  address: string;
  total: number;
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function orderConfirmationEmail(input: OrderConfirmationEmailInput) {
  const lines = input.items
    .map((item) => `<li style="margin:0 0 8px 0;">${escapeHtml(item.name)} x ${item.quantity} - ${formatCurrency(item.quantity * item.unitPrice)}</li>`)
    .join("");

  return {
    subject: `Order ${input.displayId} confirmed at ${input.storeName}`,
    html: `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#F3FCF1;font-family:Arial,sans-serif;color:#161D17;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #BBCBBB;border-radius:12px;overflow:hidden;">
            <tr><td style="background:#006D37;padding:20px 24px;color:#ffffff;"><h1 style="margin:0;font-size:24px;">Order Confirmation</h1></td></tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0;font-size:15px;color:#3D4A3E;line-height:1.6;">Thanks for your order with ${escapeHtml(input.storeName)}.</p>
                <p style="margin:12px 0 0 0;font-size:15px;"><strong>Order ID:</strong> ${escapeHtml(input.displayId)}</p>
                <p style="margin:8px 0 0 0;font-size:15px;"><strong>Delivery address:</strong> ${escapeHtml(input.address)}</p>
                <p style="margin:8px 0 0 0;font-size:15px;"><strong>Total:</strong> <span style="color:#FC8F34;font-weight:700;">${formatCurrency(input.total)}</span></p>
                <h2 style="margin:20px 0 10px 0;font-size:18px;">Items</h2>
                <ul style="margin:0;padding-left:20px;color:#3D4A3E;line-height:1.6;">${lines}</ul>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
}
