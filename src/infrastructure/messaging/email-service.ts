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

    try {
      const { error } = await this.getClient().emails.send({
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

      if (error) {
        logger.error(
          {
            error: { name: error.name, message: error.message },
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
    await this.sendEmail({
      to,
      subject: 'Verify your Sadza Connect account',
      html: getVerificationEmailHtml(otp),
      text: getVerificationEmailPlainText(otp),
    });
  }

  async sendResetPasswordEmail(to: string, otp: string): Promise<void> {
    logger.info({ to, otp }, '[AUTH] Dispatched password reset OTP');
    await this.sendEmail({
      to,
      subject: 'Reset your Sadza Connect password',
      html: getResetPasswordEmailHtml(otp),
      text: getResetPasswordEmailPlainText(otp),
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
        <div style="background: linear-gradient(135deg, #0a1018 0%, #1e57eb 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">SADZA CONNECT ZIMBABWE</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #93c5fd;">Official Commercial Payment Receipt</p>
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
              <tr style="border-top: 1px solid #cbd5e1; font-size: 15px; font-weight: 800; color: #0f172a;"><td style="padding: 10px 0 0 0;">Total Paid:</td><td style="text-align: right; padding-top: 10px; color: #1e57eb;">$${invoice.amount.toFixed(2)} USD</td></tr>
            </table>
          </div>
          <p style="font-size: 12px; color: #64748b; line-height: 1.5;">This is an automated fiscal receipt generated by Sadza Connect Zimbabwe. For accounts and billing queries, please contact billing@sadzaconnect.co.zw.</p>
        </div>
      </div>
    `;
    const text = `Sadza Connect Receipt: Invoice ${invoice.invoiceNumber} for $${invoice.amount.toFixed(2)} has been paid via ${invoice.paymentMethod}.`;
    await this.sendEmail({
      to,
      subject: `Receipt: Sadza Connect Invoice ${invoice.invoiceNumber}`,
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
          <h1 style="margin: 0; font-size: 20px; font-weight: 800;">SADZA CONNECT UTILITIES</h1>
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
    const text = `Sadza Connect: Your ${tokenData.biller} token is: ${tokenData.token}`;
    await this.sendEmail({
      to,
      subject: `Your ${tokenData.biller} Recharge Token: ${tokenData.token}`,
      html,
      text,
    });
  }
}

export const emailService = new EmailService();
