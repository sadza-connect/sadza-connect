export interface StaffCardRecord {
  id: string;
  name: string;
  role: string;
  department: string;
  bloodGroup: string;
  phone: string;
  photo: string;
  status: 'Active' | 'Suspended' | 'Expired';
  issued: string;
  expires: string;
  prefix: 'HQ' | 'VER';
  verified: boolean;
  businessId?: string | null;
  qrPayload?: string;
  nationalId?: string;
}

export function mapDbIdCardToStaffRecord(card: any): StaffCardRecord {
  const isHq = (card.card_number || '').toUpperCase().startsWith('HQ');
  const issueDateStr = card.issue_date
    ? new Date(card.issue_date).toLocaleDateString('en-GB')
    : new Date().toLocaleDateString('en-GB');

  const expiryDateStr = card.expiry_date
    ? new Date(card.expiry_date).toLocaleDateString('en-GB')
    : new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB');

  return {
    id: card.card_number,
    name: card.member_name,
    role: card.member_role,
    department: card.business_name || 'Sadza Connect Commercial Registry',
    bloodGroup: card.national_id ? `ID: ${card.national_id}` : 'O+ (Standard)',
    phone: card.phone || card.member_phone || '',
    photo: card.photo_url || '',
    status: (card.status as 'Active' | 'Suspended' | 'Expired') || 'Active',
    issued: issueDateStr,
    expires: expiryDateStr,
    prefix: isHq ? 'HQ' : 'VER',
    verified: card.status === 'Active',
    businessId: card.business_id,
    qrPayload:
      card.qr_code_payload ||
      `https://sadzaconnect.co.zw/verify-id/${card.card_number}`,
    nationalId: card.national_id || undefined,
  };
}
