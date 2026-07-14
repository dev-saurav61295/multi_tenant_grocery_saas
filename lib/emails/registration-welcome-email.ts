type RegistrationWelcomeEmailInput = {
  storeName: string;
  userName: string;
  username: string;
  roleLabel: string;
  verifyPath?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function registrationWelcomeEmail(input: RegistrationWelcomeEmailInput) {
  const safeStore = escapeHtml(input.storeName);
  const safeName = escapeHtml(input.userName);
  const safeUsername = escapeHtml(input.username);
  const safeRole = escapeHtml(input.roleLabel);
  const verifySection = input.verifyPath
    ? `<p style="margin:16px 0 0 0;font-size:15px;color:#3D4A3E;line-height:1.6;">Email confirmation is optional. If you want to mark this inbox as confirmed, use the link below:</p>
       <p style="margin:12px 0 0 0;"><a href="${escapeHtml(input.verifyPath)}" style="display:inline-block;background:#006D37;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700;">Confirm Email (Optional)</a></p>`
    : "";

  return {
    subject: `Welcome to ${input.storeName}`,
    html: `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#F3FCF1;font-family:Arial,sans-serif;color:#161D17;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #BBCBBB;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:#006D37;padding:20px 24px;color:#ffffff;">
                <h1 style="margin:0;font-size:24px;">${safeStore}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0;font-size:16px;line-height:1.6;">Hi ${safeName},</p>
                <p style="margin:12px 0 0 0;font-size:15px;color:#3D4A3E;line-height:1.6;">Your ${safeRole} account is ready. You can sign in using username <strong>${safeUsername}</strong>.</p>
                ${verifySection}
                <p style="margin:18px 0 0 0;font-size:14px;color:#3D4A3E;line-height:1.6;">If you did not expect this email, please contact the store team.</p>
              </td>
            </tr>
            <tr>
              <td style="background:#EEF6EB;padding:14px 24px;font-size:12px;color:#3D4A3E;">Powered by ${safeStore}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
}
