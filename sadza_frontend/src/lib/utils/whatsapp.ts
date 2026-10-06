/**
 * Utility functions for generating direct WhatsApp click-to-chat deep links
 * format: https://wa.me/<phone_number>?text=<encoded_message>
 */

export function sanitizePhoneNumber(phone: string): string {
  // Strip spaces, dashes, parentheses, plus
  const digits = phone.replace(/\D/g, '');
  // If local Zimbabwean format 07XXXXXXXX, prepend 263 and drop leading 0
  if (digits.startsWith('0') && digits.length === 10) {
    return `263${digits.substring(1)}`;
  }
  return digits;
}

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
