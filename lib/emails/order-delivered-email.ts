type OrderDeliveredEmailInput = {
  storeName: string;
  displayId: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function orderDeliveredEmail(input: OrderDeliveredEmailInput) {
  return {
    subject: `Order ${input.displayId} delivered`,
    html: `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#F3FCF1;font-family:Arial,sans-serif;color:#161D17;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #BBCBBB;border-radius:12px;overflow:hidden;">
          <tr><td style="background:#006D37;padding:20px 24px;color:#ffffff;"><h1 style="margin:0;font-size:24px;">Delivered</h1></td></tr>
          <tr><td style="padding:24px;">
            <p style="margin:0;font-size:15px;color:#3D4A3E;line-height:1.6;">Order <strong>${escapeHtml(input.displayId)}</strong> from ${escapeHtml(input.storeName)} has been delivered.</p>
            <p style="margin:12px 0 0 0;font-size:15px;color:#3D4A3E;line-height:1.6;">Thank you for shopping with us.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`,
  };
}
