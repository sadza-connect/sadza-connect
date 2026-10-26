/**
 * Utility functions for generating direct WhatsApp click-to-chat deep links
 * format: https://wa.me/<phone_number>?text=<encoded_message>
 */

export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return '';
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';

  // 1. If number explicitly starts with '+', it is in standard E.164 format.
  // wa.me requires digits only (country code + subscriber number, no plus)
  if (trimmed.startsWith('+')) {
    return digits;
  }

  // 2. If it starts with '00' (international exit code, e.g. 00263, 00234, 0027)
  if (digits.startsWith('00')) {
    return digits.substring(2);
  }

  // 3. Local Zimbabwean mobile format (071, 073, 077, 078) -> prepend 263
  if (
    digits.startsWith('0') &&
    (digits.startsWith('071') ||
      digits.startsWith('073') ||
      digits.startsWith('077') ||
      digits.startsWith('078'))
  ) {
    return `263${digits.substring(1)}`;
  }

  // 4. Local Zimbabwean 9-digit format without leading 0 -> prepend 263
  if (
    digits.length === 9 &&
    (digits.startsWith('71') ||
      digits.startsWith('73') ||
      digits.startsWith('77') ||
      digits.startsWith('78'))
  ) {
    return `263${digits}`;
  }

  // 5. If it starts with a leading zero from any other country, strip the 0
  if (digits.startsWith('0')) {
    return `263${digits.substring(1)}`;
  }

  return digits;
}

export const cleanWaNumber = sanitizePhoneNumber;

export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = sanitizePhoneNumber(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function createBusinessInquiryLink(businessName: string, phone: string): string {
  const text = `Hello ${businessName}, I found your listing on Sadza Connect Zimbabwe. I would like to make an inquiry.`;
  return generateWhatsAppLink(phone, text);
}

export function createProductInquiryLink(productName: string, priceUsd: number, sellerPhone: string): string {
  const text = `Hello! I saw "${productName}" (USD $${priceUsd.toFixed(2)}) on Sadza Connect Marketplace. Is this still available for purchase?`;
  return generateWhatsAppLink(sellerPhone, text);
}

export function createJobInquiryLink(jobTitle: string, companyName: string, phone: string): string {
  const text = `Hello ${companyName}, I saw your opening for "${jobTitle}" on Sadza Connect Jobs Board and would like to submit my application.`;
  return generateWhatsAppLink(phone, text);
}

export function createUtilityTokenShareLink(biller: string, token: string, units: string, phone: string): string {
  const text = `Sadza Connect Official Token: ${biller} Recharge Voucher.\nToken: ${token}\nUnits: ${units} kWh\nPaid & verified.`;
  return generateWhatsAppLink(phone, text);
}

export function createInvoiceReceiptShareLink(invoiceNumber: string, amount: number, businessName: string, phone: string): string {
  const text = `Official Receipt from Sadza Connect Zimbabwe.\nInvoice: ${invoiceNumber}\nAmount: $${amount.toFixed(2)} USD\nClient: ${businessName}\nStatus: PAID & SETTLED.`;
  return generateWhatsAppLink(phone, text);
}

export function createOrderWaybillShareLink(orderNumber: string, waybillRef: string, carrier: string, phone: string): string {
  const text = `Sadza Connect Logistics Waybill.\nOrder: ${orderNumber}\nWaybill: ${waybillRef}\nCarrier: ${carrier}\nTrack parcel live at https://sadzaconnect.co.zw`;
  return generateWhatsAppLink(phone, text);
}
