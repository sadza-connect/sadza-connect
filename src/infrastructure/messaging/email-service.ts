import { Resend } from 'resend';
import { env } from '../../config/env.js';
import { logger } from '../../shared/logging/logger.js';
import { InternalError } from '../../shared/errors/index.js';
import {
  getVerificationEmailHtml,
  getVerificationEmailPlainText,
} from './templates/verification-email.js';
import {
  getResetPasswordEmailHtml,
  getResetPasswordEmailPlainText,
} from './templates/reset-password-email.js';

function extractEmailAddress(from: string): string {
  const match = from.match(/<([^>]+)>/);
  return match ? match[1] : from;
}

export class EmailService {
  private resend: Resend | null = null;

  private getClient(): Resend {
    if (!this.resend) {
      if (!env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured');
      }
      this.resend = new Resend(env.RESEND_API_KEY);
    }
    return this.resend;
  }

  private async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void> {
    if (!env.RESEND_API_KEY) {
      logger.warn(
        { to: params.to, subject: params.subject },
        'No RESEND_API_KEY configured — email skipped (configured via env)',
      );
      return;
    }

    const replyTo = extractEmailAddress(env.EMAIL_FROM);
    const client = this.getClient();

    try {
      let sendResult = await client.emails.send({
        from: env.EMAIL_FROM,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        replyTo,
        headers: {
          'X-Entity-Ref-ID': `${Date.now()}-${params.to}`,
        },
      });

      // If custom domain is unverified in Resend, automatically fallback to onboarding@resend.dev sandbox sender
      const resendError = sendResult.error as any;
      if (resendError && (resendError.message?.includes('not verified') || resendError.statusCode === 403)) {
        logger.warn(
          { from: env.EMAIL_FROM, error: resendError.message },
          'Custom email domain unverified on Resend. Falling back to onboarding@resend.dev...',
        );
        sendResult = await client.emails.send({
          from: 'MySadza Connect <onboarding@resend.dev>',
          to: params.to,
          subject: params.subject,
          html: params.html,
          text: params.text,
          replyTo: 'support@sadzaconnect.co.zw',
          headers: {
            'X-Entity-Ref-ID': `${Date.now()}-${params.to}`,
          },
        });
      }

      if (sendResult.error) {
        logger.error(
          {
            error: { name: sendResult.error.name, message: sendResult.error.message },
            from: env.EMAIL_FROM,
            to: params.to,
          },
          'Failed to send email via Resend',
        );
        if (process.env.NODE_ENV === 'production') {
          throw new InternalError('Failed to send email');
        }
        logger.warn('Non-production mode: Resend failure logged, continuing without blocking.');
        return;
      }

      logger.info({ to: params.to, subject: params.subject }, 'Email sent successfully via Resend');
    } catch (err) {
      if (err instanceof InternalError) throw err;
      logger.error({ err, to: params.to }, 'Unexpected error dispatching email');
      if (process.env.NODE_ENV === 'production') {
        throw new InternalError('Failed to deliver email message');
      }
      logger.warn('Non-production mode: Email dispatch error handled gracefully.');
    }
  }

  async sendVerificationEmail(to: string, otp: string): Promise<void> {
    logger.info({ to, otp }, '[AUTH] Dispatched email verification OTP');
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n' + '='.repeat(70));
      console.log(`🔑 [MYSADZA DEV OTP] Email Verification PIN for: ${to}`);
      console.log(`👉 6-DIGIT PIN: ${otp}`);
      console.log('='.repeat(70) + '\n');
    }
    await this.sendEmail({
      to,
      subject: 'Verify your MySadza Connect account',
      html: getVerificationEmailHtml(otp),
      text: getVerificationEmailPlainText(otp),
    });
  }

  async sendResetPasswordEmail(to: string, otp: string): Promise<void> {
    logger.info({ to, otp }, '[AUTH] Dispatched password reset OTP');
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n' + '='.repeat(70));
      console.log(`🔑 [MYSADZA DEV OTP] Password Reset PIN for: ${to}`);
      console.log(`👉 6-DIGIT PIN: ${otp}`);
      console.log('='.repeat(70) + '\n');
    }
    await this.sendEmail({
      to,
      subject: 'Reset your MySadza Connect password',
      html: getResetPasswordEmailHtml(otp),
      text: getResetPasswordEmailPlainText(otp),
    });
  }

  async sendTwoFactorLoginEmail(to: string, otp: string, fullName?: string): Promise<void> {
    logger.info({ to, otp }, '[AUTH] Dispatched 2FA login verification OTP');
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n' + '='.repeat(70));
      console.log(`🔐 [MYSADZA 2FA LOGIN OTP] Security Code for: ${to}`);
      console.log(`👉 6-DIGIT 2FA PIN: ${otp}`);
      console.log('='.repeat(70) + '\n');
    }
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0a1018 0%, #1e57eb 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">MYSADZA CONNECT SECURITY</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #93c5fd;">Two-Factor Authentication (2FA) Sign-In Code</p>
        </div>
        <div style="padding: 28px 24px;">
          <p style="font-size: 14px; color: #0f172a; margin-top: 0;">Hello${fullName ? ` <strong>${fullName}</strong>` : ''},</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">A sign-in attempt to your MySadza Connect account requires Two-Factor Authentication. Enter the 6-digit verification code below to complete your sign-in:</p>
          <div style="background: #f8fafc; border: 2px dashed #1e57eb; border-radius: 12px; padding: 22px; text-align: center; margin: 22px 0;">
            <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase;">Your 6-Digit 2FA Code</p>
            <p style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 6px; color: #0f172a; font-family: monospace;">${otp}</p>
          </div>
          <p style="font-size: 12px; color: #64748b; line-height: 1.5;">This security code expires in <strong>10 minutes</strong>. If you did not attempt to sign in, please change your password immediately.</p>
        </div>
      </div>
    `;
    const text = `MySadza Connect Two-Factor Authentication Code: ${otp}. This code expires in 10 minutes.`;
    await this.sendEmail({
      to,
      subject: `${otp} is your MySadza Connect 2FA Sign-In Code`,
      html,
      text,
    });
  }

  async sendInvoiceReceiptEmail(
    to: string,
    invoice: {
      invoiceNumber: string;
      amount: number;
      paymentMethod: string;
      reference?: string;
    }
  ): Promise<void> {
    logger.info({ to, invoiceNumber: invoice.invoiceNumber }, '[BILLING] Dispatched invoice receipt email');
    const vat = (invoice.amount * 0.15).toFixed(2);
    const subtotal = (invoice.amount * 0.85).toFixed(2);
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0a1018 0%, #007a3d 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">MYSADZA CONNECT ZIMBABWE</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #facc15;">Zimbabwe Commercial Super-Platform Receipt</p>
        </div>
        <div style="padding: 28px 24px;">
          <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Payment Confirmation</h2>
          <p style="font-size: 14px; color: #475569;">Thank you for your payment. Your commercial invoice has been settled in full.</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
              <tr><td style="padding: 6px 0; font-weight: 600;">Invoice Reference:</td><td style="text-align: right; font-family: monospace; font-weight: 700;">${invoice.invoiceNumber}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: 600;">Settlement Method:</td><td style="text-align: right;">${invoice.paymentMethod}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: 600;">Subtotal (USD):</td><td style="text-align: right;">$${subtotal}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: 600;">ZIMRA VAT (15%):</td><td style="text-align: right;">$${vat}</td></tr>
              <tr style="border-top: 1px solid #cbd5e1; font-size: 15px; font-weight: 800; color: #0f172a;"><td style="padding: 10px 0 0 0;">Total Paid:</td><td style="text-align: right; padding-top: 10px; color: #007a3d;">$${invoice.amount.toFixed(2)} USD</td></tr>
            </table>
          </div>
          <p style="font-size: 12px; color: #64748b; line-height: 1.5;">This is an automated fiscal receipt generated by MySadza Connect Zimbabwe. For accounts and billing queries, please contact billing@sadzaconnect.co.zw.</p>
        </div>
      </div>
    `;
    const text = `MySadza Connect Receipt: Invoice ${invoice.invoiceNumber} for $${invoice.amount.toFixed(2)} has been paid via ${invoice.paymentMethod}.`;
    await this.sendEmail({
      to,
      subject: `Receipt: MySadza Connect Invoice ${invoice.invoiceNumber}`,
      html,
      text,
    });
  }

  async sendUtilityTokenEmail(
    to: string,
    tokenData: {
      biller: string;
      accountNumber: string;
      token: string;
      unitsKwh?: number;
      amount: number;
    }
  ): Promise<void> {
    logger.info({ to, token: tokenData.token }, '[UTILITIES] Dispatched prepaid token email');
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #0a1018; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 800;">MYSADZA CONNECT UTILITIES</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #10b981;">Prepaid Recharge Token Generated</p>
        </div>
        <div style="padding: 24px;">
          <h2 style="font-size: 16px; color: #0f172a; margin-top: 0;">${tokenData.biller} Recharge</h2>
          <div style="background: #ecfdf5; border: 2px dashed #059669; border-radius: 10px; padding: 20px; text-align: center; margin: 16px 0;">
            <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #065f46; letter-spacing: 1px; text-transform: uppercase;">Your 20-Digit Recharge Token</p>
            <p style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 2px; color: #047857; font-family: monospace;">${tokenData.token}</p>
          </div>
          <p style="font-size: 13px; color: #475569;">Meter / Account: <strong>${tokenData.accountNumber}</strong></p>
          ${tokenData.unitsKwh ? `<p style="font-size: 13px; color: #475569;">Energy Purchased: <strong>${tokenData.unitsKwh} kWh</strong></p>` : ''}
          <p style="font-size: 13px; color: #475569;">Amount Paid: <strong>$${tokenData.amount.toFixed(2)} USD</strong></p>
        </div>
      </div>
    `;
    const text = `MySadza Connect: Your ${tokenData.biller} token is: ${tokenData.token}`;
    await this.sendEmail({
      to,
      subject: `Your ${tokenData.biller} Recharge Token: ${tokenData.token}`,
      html,
      text,
    });
  }

  async sendContactReplyEmail(
    to: string,
    reply: {
      recipientName: string;
      topic?: string;
      replyMessage: string;
    }
  ): Promise<void> {
    logger.info({ to, recipientName: reply.recipientName }, '[SUPPORT] Dispatched contact response email');
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0a1018 0%, #007a3d 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">MYSADZA CONNECT SUPPORT DESK</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #facc15;">Zimbabwe Commercial Super-Platform</p>
        </div>
        <div style="padding: 28px 24px;">
          <p style="font-size: 14px; color: #0f172a; margin-top: 0;">Dear <strong>${reply.recipientName}</strong>,</p>
          ${reply.topic ? `<p style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Re: ${reply.topic}</p>` : ''}
          <div style="background: #f8fafc; border-left: 4px solid #1e57eb; padding: 16px 20px; margin: 18px 0; border-radius: 4px; font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-line;">
            ${reply.replyMessage}
          </div>
          <p style="font-size: 13px; color: #475569; line-height: 1.5;">If you have any further questions or require additional assistance, please reply directly to this email or contact our support team on WhatsApp at +263 77 210 1101.</p>
          <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 16px; font-size: 12px; color: #64748b;">
            <p style="margin: 0; font-weight: 600; color: #0f172a;">Sadza Connect Zimbabwe Support HQ</p>
            <p style="margin: 4px 0 0 0;">14 Samora Machel Avenue, Harare CBD, Zimbabwe</p>
          </div>
        </div>
      </div>
    `;
    const text = `Dear ${reply.recipientName},\n\nRegarding your inquiry${reply.topic ? ` (${reply.topic})` : ''}:\n\n${reply.replyMessage}\n\nBest regards,\nSadza Connect Zimbabwe Support HQ`;
    await this.sendEmail({
      to,
      subject: `Sadza Connect Support: Response regarding ${reply.topic || 'your inquiry'}`,
      html,
      text,
    });
  }

  async sendSubscriptionNoticeEmail(
    to: string,
    notice: {
      businessName: string;
      title: string;
      message: string;
      actionLabel: string;
    }
  ): Promise<void> {
    logger.info({ to, businessName: notice.businessName }, '[SUBSCRIPTION] Dispatched subscription notice email');
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0a1018 0%, #007a3d 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">MYSADZA CONNECT</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #facc15;">Subscription Notice</p>
        </div>
        <div style="padding: 28px 24px;">
          <h2 style="margin-top: 0; font-size: 18px; color: #0f172a;">${notice.title}</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #1e293b;">${notice.message}</p>
          <p style="text-align: center; margin: 24px 0;">
            <a href="https://sadzaconnect.co.zw/pricing" style="background: #007a3d; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px;">${notice.actionLabel}</a>
          </p>
          <p style="font-size: 12px; color: #64748b;">Need help? Contact our support team on WhatsApp at +263 77 210 1101.</p>
        </div>
      </div>
    `;
    const text = `${notice.title}\n\n${notice.message}\n\n${notice.actionLabel}: https://sadzaconnect.co.zw/pricing\n\nMySadza Connect Support`;
    await this.sendEmail({
      to,
      subject: `MySadza Connect: ${notice.title}`,
      html,
      text,
    });
  }

  async sendBroadcastEmail(
    to: string,
    payload: {
      subject: string;
      eyebrow?: string;
      htmlBody: string;
    }
  ): Promise<void> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0a1018 0%, #007a3d 100%); padding: 26px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">MYSADZA CONNECT</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #facc15;">${payload.eyebrow || 'Platform Notice'}</p>
        </div>
        <div style="padding: 28px 24px; font-size: 14px; line-height: 1.6; color: #1e293b;">
          ${payload.htmlBody}
          <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 16px; font-size: 12px; color: #64748b;">
            <p style="margin: 0; font-weight: 600; color: #0f172a;">MySadza Connect Zimbabwe</p>
            <p style="margin: 4px 0 0 0;">Support &amp; Partnerships: +263 77 210 1101</p>
          </div>
        </div>
      </div>
    `;
    const text = payload.htmlBody.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    await this.sendEmail({
      to,
      subject: payload.subject,
      html,
      text,
    });
  }
}

export const emailService = new EmailService();
