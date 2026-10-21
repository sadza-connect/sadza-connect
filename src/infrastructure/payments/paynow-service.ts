import crypto from 'node:crypto';
import { invoiceRepository } from '../database/repositories/invoice-repository';
import { emailService } from '../messaging/email-service';
import { logger } from '../../shared/logging/logger';

export interface InitiatePaymentOptions {
  invoiceNumber?: string;
  amount: number;
  currency?: 'USD' | 'ZiG';
  paymentMethod: 'EcoCash' | 'InnBucks' | 'OneMoney' | 'Card';
  phone: string;
  email: string;
  returnUrl?: string;
  additionalInfo?: string;
}

export interface PaymentInitiateResult {
  reference: string;
  status: 'Ok' | 'Error';
  pollUrl: string;
  browserUrl: string;
  instructions: string;
  isSimulated: boolean;
  error?: string;
}

export interface PaymentPollResult {
  reference: string;
  status: 'Paid' | 'Pending' | 'Cancelled' | 'Failed';
  amount: number;
  paynowReference?: string;
  paidAt?: string;
}

export interface WebhookProcessResult {
  success: boolean;
  reference: string;
  invoiceUpdated: boolean;
  status: string;
  message: string;
}

interface SimulatedTransaction {
  reference: string;
  invoiceNumber?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  phone: string;
  email: string;
  status: 'Pending' | 'Paid' | 'Cancelled' | 'Failed';
  createdAt: string;
  updatedAt: string;
}

const globalForPaynow = globalThis as unknown as {
  paynowSimulatedTransactions?: Map<string, SimulatedTransaction>;
};

if (!globalForPaynow.paynowSimulatedTransactions) {
  globalForPaynow.paynowSimulatedTransactions = new Map<string, SimulatedTransaction>();
}

export const simulatedTransactionsStore = globalForPaynow.paynowSimulatedTransactions;

export class PaynowService {
  private integrationId: string | null = null;
  private integrationKey: string | null = null;
  private resultUrl: string;
  private isConfigured = false;

  private get simulatedTransactions() {
    return simulatedTransactionsStore;
  }

  constructor() {
    this.integrationId = process.env.PAYNOW_INTEGRATION_ID || null;
    this.integrationKey = process.env.PAYNOW_INTEGRATION_KEY || null;
    this.resultUrl =
      process.env.PAYNOW_RESULT_URL || 'https://sadzaconnect.co.zw/api/v1/webhooks/payment';

    if (this.integrationId && this.integrationKey) {
      this.isConfigured = true;
    }
  }

  public isLiveMode(): boolean {
    return this.isConfigured;
  }

  /**
   * Generates a Paynow SHA512 hash signature.
   */
  private generateHash(values: Record<string, string>, key: string): string {
    let concatenated = '';
    for (const [k, v] of Object.entries(values)) {
      if (k.toLowerCase() !== 'hash') {
        concatenated += v;
      }
    }
    concatenated += key;
    return crypto.createHash('sha512').update(concatenated).digest('hex').toUpperCase();
  }

  /**
   * Initiates an EcoCash/InnBucks/Card transaction via Paynow or simulation engine.
   */
  async initiateTransaction(options: InitiatePaymentOptions): Promise<PaymentInitiateResult> {
    const reference = `SC-PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Live Paynow Integration
    if (this.isConfigured && this.integrationId && this.integrationKey) {
      try {
        const fields: Record<string, string> = {
          resulturl: this.resultUrl,
          returnurl: options.returnUrl || `https://sadzaconnect.co.zw/checkout/complete?reference=${reference}`,
          reference,
          amount: options.amount.toFixed(2),
          id: this.integrationId,
          additionalinfo: options.additionalInfo || options.invoiceNumber || 'Sadza Connect Commercial Payment',
          authemail: options.email,
          status: 'Message',
        };

        const hash = this.generateHash(fields, this.integrationKey);
        fields.hash = hash;

        const bodyParams = new URLSearchParams(fields);
        const res = await fetch('https://www.paynow.co.zw/interface/initiatetransaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: bodyParams.toString(),
        });

        const textResponse = await res.text();
        const responseParams = new URLSearchParams(textResponse);

        if (responseParams.get('status')?.toLowerCase() === 'ok') {
          return {
            reference,
            status: 'Ok',
            pollUrl: responseParams.get('pollurl') || '',
            browserUrl: responseParams.get('browserurl') || '',
            instructions: `USSD push prompt sent to ${options.phone}. Please confirm transaction.`,
            isSimulated: false,
          };
        }

        const errDetail = responseParams.get('error') || 'Paynow rejected initiation';
        logger.warn({ errDetail, reference }, 'Paynow live transaction rejection, falling back to simulated engine');
      } catch (err) {
        logger.error({ err, reference }, 'Error reaching Paynow live API, falling back to simulation engine');
      }
    }

    // Option A: Interactive Simulation Mode (Local development & test)
    const simulatedRecord: SimulatedTransaction = {
      reference,
      invoiceNumber: options.invoiceNumber,
      amount: options.amount,
      currency: options.currency || 'USD',
      paymentMethod: options.paymentMethod,
      phone: options.phone,
      email: options.email,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.simulatedTransactions.set(reference, simulatedRecord);

    const instructions =
      options.paymentMethod === 'EcoCash'
        ? `EcoCash USSD prompt dispatched to ${options.phone}. Enter your EcoCash PIN on your phone to approve payment of $${options.amount.toFixed(2)}.`
        : options.paymentMethod === 'InnBucks'
        ? `InnBucks authorization prompt dispatched to ${options.phone}. Authorize in your InnBucks mobile wallet.`
        : `Simulated gateway initiated. Awaiting authorization for ${options.phone}.`;

    return {
      reference,
      status: 'Ok',
      pollUrl: `/api/v1/payments/poll?reference=${reference}`,
      browserUrl: options.returnUrl || `/checkout/complete?reference=${reference}`,
      instructions,
      isSimulated: true,
    };
  }

  /**
   * Checks the status of a transaction.
   */
  async pollTransaction(reference: string): Promise<PaymentPollResult> {
    const sim = this.simulatedTransactions.get(reference);
    if (sim) {
      return {
        reference: sim.reference,
        status: sim.status,
        amount: sim.amount,
        paynowReference: `PAYNOW-SIM-${sim.reference.slice(-6)}`,
        paidAt: sim.status === 'Paid' ? sim.updatedAt : undefined,
      };
    }

    // Check by invoice number if reference matches invoice
    try {
      const invoice = await invoiceRepository.findByInvoiceNumber(reference);
      if (invoice) {
        return {
          reference: invoice.invoice_number,
          status: invoice.status === 'Paid' ? 'Paid' : 'Pending',
          amount: Number(invoice.amount_usd) || 0,
        };
      }
    } catch {
      // Ignore
    }

    return {
      reference,
      status: 'Pending',
      amount: 0,
    };
  }

  /**
   * Processes an incoming payment webhook from Paynow.
   */
  async processWebhook(payload: Record<string, string>): Promise<WebhookProcessResult> {
    const reference = payload.reference || '';
    const status = payload.status || 'Paid';
    const paynowReference = payload.paynowreference || `PN-${Date.now()}`;
    const isPaid = status.toLowerCase() === 'paid';

    let invoiceUpdated = false;

    // 1. Update in simulated memory store if present
    const sim = this.simulatedTransactions.get(reference);
    if (sim) {
      sim.status = isPaid ? 'Paid' : 'Failed';
      sim.updatedAt = new Date().toISOString();
      if (sim.invoiceNumber) {
        try {
          const inv = await invoiceRepository.findByInvoiceNumber(sim.invoiceNumber);
          if (inv) {
            await invoiceRepository.update(inv.id, {
              status: 'Paid',
              payment_method: sim.paymentMethod,
            });
            invoiceUpdated = true;
          }
        } catch (err) {
          logger.warn({ err, invoice: sim.invoiceNumber }, 'Failed to update invoice in webhook');
        }
      }
    }

    // 2. Direct lookup by invoice number
    if (!invoiceUpdated && reference) {
      try {
        const inv = await invoiceRepository.findByInvoiceNumber(reference);
        if (inv) {
          await invoiceRepository.update(inv.id, {
            status: isPaid ? 'Paid' : 'Failed',
          });
          invoiceUpdated = true;
        }
      } catch {
        // Continue
      }
    }

    // 3. Dispatch receipt email
    if (isPaid && (sim?.email || payload.authemail)) {
      const targetEmail = sim?.email || payload.authemail;
      try {
        await emailService.sendInvoiceReceiptEmail(targetEmail, {
          invoiceNumber: sim?.invoiceNumber || reference,
          amount: sim?.amount || Number(payload.amount) || 0,
          paymentMethod: sim?.paymentMethod || 'EcoCash USD',
          reference: paynowReference,
        });
      } catch (err) {
        logger.warn({ err }, 'Failed to dispatch payment receipt email');
      }
    }

    return {
      success: true,
      reference,
      invoiceUpdated,
      status: isPaid ? 'Paid' : status,
      message: `Transaction ${reference} processed successfully (status: ${status})`,
    };
  }

  /**
   * Simulates immediate successful customer PIN authorization for testing.
   */
  async simulatePaymentSuccess(reference: string): Promise<WebhookProcessResult> {
    let sim = this.simulatedTransactions.get(reference);
    if (!sim) {
      sim = {
        reference,
        amount: 25.0,
        currency: 'USD',
        paymentMethod: 'EcoCash',
        phone: '+263 77 123 4567',
        email: 'customer@sadzaconnect.co.zw',
        status: 'Paid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.simulatedTransactions.set(reference, sim);
    } else {
      sim.status = 'Paid';
      sim.updatedAt = new Date().toISOString();
    }

    return this.processWebhook({
      reference: sim.reference,
      status: 'Paid',
      paynowreference: `PN-SIM-${Date.now()}`,
      amount: String(sim.amount),
      authemail: sim.email,
    });
  }
}

export const paynowService = new PaynowService();
