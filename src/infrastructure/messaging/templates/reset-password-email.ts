export function getResetPasswordEmailPlainText(otp: string): string {
  return `Reset your Sadza Connect password

We received a request to reset the password for your Sadza Connect account.
Enter the 6-digit verification code below to proceed:

${otp}

This code expires in 15 minutes. If you did not request a password reset, your account is safe and you can ignore this email.

—
Sadza Connect Zimbabwe
Connecting Zimbabwe's Commerce, Verified Merchants & Diaspora`;
}

export function getResetPasswordEmailHtml(otp: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your Sadza Connect Password</title>
</head>
<body style="margin:0;padding:0;background-color:#090d16;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f3f4f6">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#090d16;padding:40px 16px">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:500px;background-color:#0f172a;border-radius:16px;overflow:hidden;border:1px solid #1e293b;box-shadow:0 10px 25px -5px rgba(0, 0, 0, 0.5)">
          <!-- Header Banner -->
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;background:linear-gradient(135deg, #b45309 0%, #78350f 100%)">
              <h1 style="margin:0;font-size:26px;font-weight:800;letter-spacing:-0.5px;color:#ffffff">SADZA CONNECT</h1>
              <p style="margin:6px 0 0;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#fef3c7">Security & Account Recovery</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:36px 32px 24px;text-align:center">
              <h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#ffffff">Password Reset Code</h2>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#94a3b8">
                We received a request to reset your Sadza Connect account password. Use this 6-digit recovery code to complete the verification step:
              </p>

              <!-- OTP Code Display -->
              <div style="display:inline-block;padding:16px 36px;font-size:36px;font-weight:800;letter-spacing:10px;color:#f59e0b;background-color:#451a03;border:2px dashed #d97706;border-radius:12px;font-family:Consolas, Monaco, monospace">
                ${otp}
              </div>

              <p style="margin:28px 0 0;font-size:13px;color:#64748b;line-height:1.5">
                This reset code will expire in <strong style="color:#e2e8f0">15 minutes</strong>.<br>
                If you did not request this reset, your account is safe and no changes were made.
              </p>
            </td>
          </tr>

          <!-- Security Footer -->
          <tr>
            <td style="padding:20px 32px;background-color:#090e1a;border-top:1px solid #1e293b;text-align:center">
              <p style="margin:0;font-size:12px;color:#64748b">
                Need help? Contact Sadza Connect Security Support at support@sadzaconnect.co.zw
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#475569">
                &copy; 2026 Sadza Connect Zimbabwe. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
