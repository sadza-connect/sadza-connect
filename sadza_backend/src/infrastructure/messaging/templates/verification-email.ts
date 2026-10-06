export function getVerificationEmailPlainText(otp: string): string {
  return `Verify your Sadza Connect account

Welcome to Sadza Connect — Zimbabwe's Premier Commercial Super-App!
Enter the verification code below to verify your email address:

${otp}

This code expires in 15 minutes. If you did not create a Sadza Connect account, please ignore this email.

—
Sadza Connect Zimbabwe
Connecting Zimbabwe's Commerce, Verified Merchants & Diaspora`;
}

export function getVerificationEmailHtml(otp: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Sadza Connect Account</title>
</head>
<body style="margin:0;padding:0;background-color:#090d16;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f3f4f6">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#090d16;padding:40px 16px">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:500px;background-color:#0f172a;border-radius:16px;overflow:hidden;border:1px solid #1e293b;box-shadow:0 10px 25px -5px rgba(0, 0, 0, 0.5)">
          <!-- Header Banner -->
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;background:linear-gradient(135deg, #047857 0%, #064e3b 100%)">
              <h1 style="margin:0;font-size:26px;font-weight:800;letter-spacing:-0.5px;color:#ffffff">SADZA CONNECT</h1>
              <p style="margin:6px 0 0;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#fde68a">Zimbabwe Commercial Super-App</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:36px 32px 24px;text-align:center">
              <h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#ffffff">Verify Your Email Address</h2>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#94a3b8">
                Welcome to Sadza Connect. To activate your account and start trading across Zimbabwe's verified marketplace, enter this 6-digit verification code:
              </p>

              <!-- OTP Code Display -->
              <div style="display:inline-block;padding:16px 36px;font-size:36px;font-weight:800;letter-spacing:10px;color:#10b981;background-color:#022c22;border:2px dashed #059669;border-radius:12px;font-family:Consolas, Monaco, monospace">
                ${otp}
              </div>

              <p style="margin:28px 0 0;font-size:13px;color:#64748b;line-height:1.5">
                This verification code will expire in <strong style="color:#e2e8f0">15 minutes</strong>.<br>
                For your security, never share this code with anyone.
              </p>
            </td>
          </tr>

          <!-- Security Footer -->
          <tr>
            <td style="padding:20px 32px;background-color:#090e1a;border-top:1px solid #1e293b;text-align:center">
              <p style="margin:0;font-size:12px;color:#64748b">
                If you did not register for an account on Sadza Connect, you can safely ignore this email.
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
