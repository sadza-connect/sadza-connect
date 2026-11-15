export interface CountryDialInfo {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  placeholder: string;
}

/**
 * Complete directory of international calling dial codes with flags and country names.
 * Default is Zimbabwe (+263) followed by major diaspora and regional African trade partners,
 * then all sovereign nations and territories alphabetically.
 */
export const ALL_COUNTRIES: CountryDialInfo[] = [
  // --- Primary Market & Major Diaspora Hubs ---
  { code: 'ZW', name: 'Zimbabwe', dialCode: '+263', flag: '🇿🇼', placeholder: '77 123 4567' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', placeholder: '82 123 4567' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', placeholder: '7911 123456' },
  { code: 'BW', name: 'Botswana', dialCode: '+267', flag: '🇧🇼', placeholder: '71 234 567' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬', placeholder: '803 123 4567' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', placeholder: '415 555 2671' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', placeholder: '416 555 0199' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', placeholder: '412 345 678' },
  { code: 'ZM', name: 'Zambia', dialCode: '+260', flag: '🇿🇲', placeholder: '97 123 4567' },
  { code: 'MZ', name: 'Mozambique', dialCode: '+258', flag: '🇲🇿', placeholder: '84 123 4567' },
  { code: 'NA', name: 'Namibia', dialCode: '+264', flag: '🇳🇦', placeholder: '81 123 4567' },
  { code: 'MW', name: 'Malawi', dialCode: '+265', flag: '🇲🇼', placeholder: '99 123 4567' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪', placeholder: '712 345 678' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭', placeholder: '24 123 4567' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255', flag: '🇹🇿', placeholder: '712 345 678' },
  { code: 'UG', name: 'Uganda', dialCode: '+256', flag: '🇺🇬', placeholder: '712 345 678' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250', flag: '🇷🇼', placeholder: '788 123 456' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', placeholder: '50 123 4567' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', placeholder: '138 0000 0000' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', placeholder: '98765 43210' },
  { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪', placeholder: '85 123 4567' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿', placeholder: '21 123 4567' },

  // --- All World Countries (Alphabetical) ---
  { code: 'AF', name: 'Afghanistan', dialCode: '+93', flag: '🇦🇫', placeholder: '70 123 4567' },
  { code: 'AL', name: 'Albania', dialCode: '+355', flag: '🇦🇱', placeholder: '69 123 4567' },
  { code: 'DZ', name: 'Algeria', dialCode: '+213', flag: '🇩🇿', placeholder: '551 23 45 67' },
  { code: 'AD', name: 'Andorra', dialCode: '+376', flag: '🇦🇩', placeholder: '312 345' },
  { code: 'AO', name: 'Angola', dialCode: '+244', flag: '🇦🇴', placeholder: '923 123 456' },
  { code: 'AG', name: 'Antigua and Barbuda', dialCode: '+1268', flag: '🇦🇬', placeholder: '723 4567' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷', placeholder: '9 11 2345 6789' },
  { code: 'AM', name: 'Armenia', dialCode: '+374', flag: '🇦🇲', placeholder: '77 123456' },
  { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹', placeholder: '664 1234567' },
  { code: 'AZ', name: 'Azerbaijan', dialCode: '+994', flag: '🇦🇿', placeholder: '50 123 45 67' },
  { code: 'BS', name: 'Bahamas', dialCode: '+1242', flag: '🇧🇸', placeholder: '359 1234' },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭', placeholder: '3600 1234' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩', placeholder: '1712 345678' },
  { code: 'BB', name: 'Barbados', dialCode: '+1246', flag: '🇧🇧', placeholder: '230 1234' },
  { code: 'BY', name: 'Belarus', dialCode: '+375', flag: '🇧🇾', placeholder: '29 123 45 67' },
  { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪', placeholder: '470 12 34 56' },
  { code: 'BZ', name: 'Belize', dialCode: '+501', flag: '🇧🇿', placeholder: '622 1234' },
  { code: 'BJ', name: 'Benin', dialCode: '+229', flag: '🇧🇯', placeholder: '97 12 34 56' },
  { code: 'BM', name: 'Bermuda', dialCode: '+1441', flag: '🇧🇲', placeholder: '505 1234' },
  { code: 'BT', name: 'Bhutan', dialCode: '+975', flag: '🇧🇹', placeholder: '17 12 34 56' },
  { code: 'BO', name: 'Bolivia', dialCode: '+591', flag: '🇧🇴', placeholder: '71234567' },
  { code: 'BA', name: 'Bosnia and Herzegovina', dialCode: '+387', flag: '🇧🇦', placeholder: '61 123 456' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', placeholder: '11 91234 5678' },
  { code: 'BN', name: 'Brunei', dialCode: '+673', flag: '🇧🇳', placeholder: '712 3456' },
  { code: 'BG', name: 'Bulgaria', dialCode: '+359', flag: '🇧🇬', placeholder: '87 123 4567' },
  { code: 'BF', name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫', placeholder: '70 12 34 56' },
  { code: 'BI', name: 'Burundi', dialCode: '+257', flag: '🇧🇮', placeholder: '79 12 34 56' },
  { code: 'KH', name: 'Cambodia', dialCode: '+855', flag: '🇰🇭', placeholder: '12 345 678' },
  { code: 'CM', name: 'Cameroon', dialCode: '+237', flag: '🇨🇲', placeholder: '6 71 23 45 67' },
  { code: 'CV', name: 'Cape Verde', dialCode: '+238', flag: '🇨🇻', placeholder: '991 1234' },
  { code: 'CF', name: 'Central African Republic', dialCode: '+236', flag: '🇨🇫', placeholder: '75 12 34 56' },
  { code: 'TD', name: 'Chad', dialCode: '+235', flag: '🇹🇩', placeholder: '66 12 34 56' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱', placeholder: '9 1234 5678' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴', placeholder: '310 123 4567' },
  { code: 'KM', name: 'Comoros', dialCode: '+269', flag: '🇰🇲', placeholder: '321 1234' },
  { code: 'CG', name: 'Congo', dialCode: '+242', flag: '🇨🇬', placeholder: '06 123 4567' },
  { code: 'CD', name: 'DR Congo', dialCode: '+243', flag: '🇨🇩', placeholder: '812 345 678' },
  { code: 'CR', name: 'Costa Rica', dialCode: '+506', flag: '🇨🇷', placeholder: '8312 3456' },
  { code: 'CI', name: "Cote d'Ivoire", dialCode: '+225', flag: '🇨🇮', placeholder: '07 12 34 56 78' },
  { code: 'HR', name: 'Croatia', dialCode: '+385', flag: '🇭🇷', placeholder: '91 123 4567' },
  { code: 'CU', name: 'Cuba', dialCode: '+53', flag: '🇨🇺', placeholder: '5 1234567' },
  { code: 'CY', name: 'Cyprus', dialCode: '+357', flag: '🇨🇾', placeholder: '99 123456' },
  { code: 'CZ', name: 'Czech Republic', dialCode: '+420', flag: '🇨🇿', placeholder: '601 123 456' },
  { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '🇩🇰', placeholder: '20 12 34 56' },
  { code: 'DJ', name: 'Djibouti', dialCode: '+253', flag: '🇩🇯', placeholder: '77 12 34 56' },
  { code: 'DM', name: 'Dominica', dialCode: '+1767', flag: '🇩🇲', placeholder: '275 1234' },
  { code: 'DO', name: 'Dominican Republic', dialCode: '+1809', flag: '🇩🇴', placeholder: '234 5678' },
  { code: 'EC', name: 'Ecuador', dialCode: '+593', flag: '🇪🇨', placeholder: '99 123 4567' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬', placeholder: '100 123 4567' },
  { code: 'SV', name: 'El Salvador', dialCode: '+503', flag: '🇸🇻', placeholder: '7012 3456' },
  { code: 'GQ', name: 'Equatorial Guinea', dialCode: '+240', flag: '🇬🇶', placeholder: '222 123 456' },
  { code: 'ER', name: 'Eritrea', dialCode: '+291', flag: '🇪🇷', placeholder: '7 123 456' },
  { code: 'EE', name: 'Estonia', dialCode: '+372', flag: '🇪🇪', placeholder: '5123 4567' },
  { code: 'SZ', name: 'Eswatini (Swaziland)', dialCode: '+268', flag: '🇸🇿', placeholder: '7612 3456' },
  { code: 'ET', name: 'Ethiopia', dialCode: '+251', flag: '🇪🇹', placeholder: '91 123 4567' },
  { code: 'FJ', name: 'Fiji', dialCode: '+679', flag: '🇫🇯', placeholder: '701 2345' },
  { code: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮', placeholder: '40 1234567' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', placeholder: '6 12 34 56 78' },
  { code: 'GA', name: 'Gabon', dialCode: '+241', flag: '🇬🇦', placeholder: '06 12 34 56' },
  { code: 'GM', name: 'Gambia', dialCode: '+220', flag: '🇬🇲', placeholder: '701 2345' },
  { code: 'GE', name: 'Georgia', dialCode: '+995', flag: '🇬🇪', placeholder: '555 12 34 56' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', placeholder: '151 12345678' },
  { code: 'GR', name: 'Greece', dialCode: '+30', flag: '🇬🇷', placeholder: '691 234 5678' },
  { code: 'GD', name: 'Grenada', dialCode: '+1473', flag: '🇬🇩', placeholder: '403 1234' },
  { code: 'GT', name: 'Guatemala', dialCode: '+502', flag: '🇬🇹', placeholder: '5123 4567' },
  { code: 'GN', name: 'Guinea', dialCode: '+224', flag: '🇬🇳', placeholder: '621 12 34 56' },
  { code: 'GW', name: 'Guinea-Bissau', dialCode: '+245', flag: '🇬🇼', placeholder: '955 12 34 56' },
  { code: 'GY', name: 'Guyana', dialCode: '+592', flag: '🇬🇾', placeholder: '612 3456' },
  { code: 'HT', name: 'Haiti', dialCode: '+509', flag: '🇭🇹', placeholder: '3412 3456' },
  { code: 'HN', name: 'Honduras', dialCode: '+504', flag: '🇭🇳', placeholder: '9123 4567' },
  { code: 'HK', name: 'Hong Kong', dialCode: '+852', flag: '🇭🇰', placeholder: '5123 4567' },
  { code: 'HU', name: 'Hungary', dialCode: '+36', flag: '🇭🇺', placeholder: '20 123 4567' },
  { code: 'IS', name: 'Iceland', dialCode: '+354', flag: '🇮🇸', placeholder: '612 3456' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩', placeholder: '812 3456 7890' },
  { code: 'IR', name: 'Iran', dialCode: '+98', flag: '🇮🇷', placeholder: '912 345 6789' },
  { code: 'IQ', name: 'Iraq', dialCode: '+964', flag: '🇮🇶', placeholder: '790 123 4567' },
  { code: 'IL', name: 'Israel', dialCode: '+972', flag: '🇮🇱', placeholder: '50 123 4567' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', placeholder: '312 345 6789' },
  { code: 'JM', name: 'Jamaica', dialCode: '+1876', flag: '🇯🇲', placeholder: '312 3456' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', placeholder: '90 1234 5678' },
  { code: 'JO', name: 'Jordan', dialCode: '+962', flag: '🇯🇴', placeholder: '7 9012 3456' },
  { code: 'KZ', name: 'Kazakhstan', dialCode: '+7', flag: '🇰🇿', placeholder: '701 123 4567' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼', placeholder: '5123 4567' },
  { code: 'KG', name: 'Kyrgyzstan', dialCode: '+996', flag: '🇰🇬', placeholder: '700 123 456' },
  { code: 'LA', name: 'Laos', dialCode: '+856', flag: '🇱🇦', placeholder: '20 23 123 456' },
  { code: 'LV', name: 'Latvia', dialCode: '+371', flag: '🇱🇻', placeholder: '21 234 567' },
  { code: 'LB', name: 'Lebanon', dialCode: '+961', flag: '🇱🇧', placeholder: '70 123 456' },
  { code: 'LS', name: 'Lesotho', dialCode: '+266', flag: '🇱🇸', placeholder: '5812 3456' },
  { code: 'LR', name: 'Liberia', dialCode: '+231', flag: '🇱🇷', placeholder: '77 012 3456' },
  { code: 'LY', name: 'Libya', dialCode: '+218', flag: '🇱🇾', placeholder: '91 123 4567' },
  { code: 'LI', name: 'Liechtenstein', dialCode: '+423', flag: '🇱🇮', placeholder: '660 1234' },
  { code: 'LT', name: 'Lithuania', dialCode: '+370', flag: '🇱🇹', placeholder: '612 34567' },
  { code: 'LU', name: 'Luxembourg', dialCode: '+352', flag: '🇱🇺', placeholder: '621 123 456' },
  { code: 'MG', name: 'Madagascar', dialCode: '+261', flag: '🇲🇬', placeholder: '32 12 345 67' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', placeholder: '12 345 6789' },
  { code: 'MV', name: 'Maldives', dialCode: '+960', flag: '🇲🇻', placeholder: '771 2345' },
  { code: 'ML', name: 'Mali', dialCode: '+223', flag: '🇲🇱', placeholder: '65 12 34 56' },
  { code: 'MT', name: 'Malta', dialCode: '+356', flag: '🇲🇹', placeholder: '9912 3456' },
  { code: 'MR', name: 'Mauritania', dialCode: '+222', flag: '🇲🇷', placeholder: '22 12 34 56' },
  { code: 'MU', name: 'Mauritius', dialCode: '+230', flag: '🇲🇺', placeholder: '5123 4567' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽', placeholder: '55 1234 5678' },
  { code: 'MD', name: 'Moldova', dialCode: '+373', flag: '🇲🇩', placeholder: '601 23 456' },
  { code: 'MC', name: 'Monaco', dialCode: '+377', flag: '🇲🇨', placeholder: '6 12 34 56 78' },
  { code: 'MN', name: 'Mongolia', dialCode: '+976', flag: '🇲🇳', placeholder: '8812 3456' },
  { code: 'ME', name: 'Montenegro', dialCode: '+382', flag: '🇲🇪', placeholder: '67 123 456' },
  { code: 'MA', name: 'Morocco', dialCode: '+212', flag: '🇲🇦', placeholder: '650 123456' },
  { code: 'MM', name: 'Myanmar', dialCode: '+95', flag: '🇲🇲', placeholder: '9 251 234 567' },
  { code: 'NP', name: 'Nepal', dialCode: '+977', flag: '🇳🇵', placeholder: '984 1234567' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱', placeholder: '6 12345678' },
  { code: 'NI', name: 'Nicaragua', dialCode: '+505', flag: '🇳🇮', placeholder: '8712 3456' },
  { code: 'NE', name: 'Niger', dialCode: '+227', flag: '🇳🇪', placeholder: '96 12 34 56' },
  { code: 'MK', name: 'North Macedonia', dialCode: '+389', flag: '🇲🇰', placeholder: '72 123 456' },
  { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴', placeholder: '412 34 567' },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲', placeholder: '9123 4567' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰', placeholder: '301 2345678' },
  { code: 'PS', name: 'Palestine', dialCode: '+970', flag: '🇵🇸', placeholder: '59 912 3456' },
  { code: 'PA', name: 'Panama', dialCode: '+507', flag: '🇵🇦', placeholder: '6123 4567' },
  { code: 'PG', name: 'Papua New Guinea', dialCode: '+675', flag: '🇵🇬', placeholder: '7123 4567' },
  { code: 'PY', name: 'Paraguay', dialCode: '+595', flag: '🇵🇾', placeholder: '981 123456' },
  { code: 'PE', name: 'Peru', dialCode: '+51', flag: '🇵🇪', placeholder: '912 345 678' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭', placeholder: '917 123 4567' },
  { code: 'PL', name: 'Poland', dialCode: '+48', flag: '🇵🇱', placeholder: '512 345 678' },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹', placeholder: '912 345 678' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦', placeholder: '3312 3456' },
  { code: 'RO', name: 'Romania', dialCode: '+40', flag: '🇷🇴', placeholder: '712 345 678' },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺', placeholder: '912 345-67-89' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', placeholder: '50 123 4567' },
  { code: 'SN', name: 'Senegal', dialCode: '+221', flag: '🇸🇳', placeholder: '77 123 45 67' },
  { code: 'RS', name: 'Serbia', dialCode: '+381', flag: '🇷🇸', placeholder: '60 1234567' },
  { code: 'SC', name: 'Seychelles', dialCode: '+248', flag: '🇸🇨', placeholder: '2 510 123' },
  { code: 'SL', name: 'Sierra Leone', dialCode: '+232', flag: '🇸🇱', placeholder: '76 123456' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', placeholder: '8123 4567' },
  { code: 'SK', name: 'Slovakia', dialCode: '+421', flag: '🇸🇰', placeholder: '901 123 456' },
  { code: 'SI', name: 'Slovenia', dialCode: '+386', flag: '🇸🇮', placeholder: '41 123 456' },
  { code: 'SO', name: 'Somalia', dialCode: '+252', flag: '🇸🇴', placeholder: '61 1234567' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷', placeholder: '10-1234-5678' },
  { code: 'SS', name: 'South Sudan', dialCode: '+211', flag: '🇸🇸', placeholder: '912 345 678' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸', placeholder: '612 34 56 78' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰', placeholder: '71 234 5678' },
  { code: 'SD', name: 'Sudan', dialCode: '+249', flag: '🇸🇩', placeholder: '91 123 4567' },
  { code: 'SR', name: 'Suriname', dialCode: '+597', flag: '🇸🇷', placeholder: '741 2345' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪', placeholder: '70 123 45 67' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭', placeholder: '78 123 45 67' },
  { code: 'SY', name: 'Syria', dialCode: '+963', flag: '🇸🇾', placeholder: '944 123 456' },
  { code: 'TW', name: 'Taiwan', dialCode: '+886', flag: '🇹🇼', placeholder: '912 345 678' },
  { code: 'TJ', name: 'Tajikistan', dialCode: '+992', flag: '🇹🇯', placeholder: '918 12 34 56' },
  { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭', placeholder: '81 234 5678' },
  { code: 'TG', name: 'Togo', dialCode: '+228', flag: '🇹🇬', placeholder: '90 12 34 56' },
  { code: 'TT', name: 'Trinidad and Tobago', dialCode: '+1868', flag: '🇹🇹', placeholder: '291 2345' },
  { code: 'TN', name: 'Tunisia', dialCode: '+216', flag: '🇹🇳', placeholder: '20 123 456' },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷', placeholder: '501 234 56 78' },
  { code: 'TM', name: 'Turkmenistan', dialCode: '+993', flag: '🇹🇲', placeholder: '65 123456' },
  { code: 'UA', name: 'Ukraine', dialCode: '+380', flag: '🇺🇦', placeholder: '50 123 4567' },
  { code: 'UY', name: 'Uruguay', dialCode: '+598', flag: '🇺🇾', placeholder: '94 123 456' },
  { code: 'UZ', name: 'Uzbekistan', dialCode: '+998', flag: '🇺🇿', placeholder: '90 123 45 67' },
  { code: 'VU', name: 'Vanuatu', dialCode: '+678', flag: '🇻🇺', placeholder: '551 2345' },
  { code: 'VE', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪', placeholder: '412 1234567' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳', placeholder: '91 234 56 78' },
  { code: 'YE', name: 'Yemen', dialCode: '+967', flag: '🇾🇪', placeholder: '71 123 456' },
  { code: 'INTL', name: 'Other International', dialCode: '+', flag: '🌐', placeholder: 'Country code + number' },
];

/**
 * Normalizes user input into E.164 phone format (+<countryCode><subscriberNumber>).
 * Handles leading zeros, already-prefixed country codes, and non-digit characters.
 */
export function formatE164Phone(dialCode: string, inputNumber: string): string {
  const cleanDigits = inputNumber.replace(/\D/g, '');
  if (!cleanDigits) return '';

  if (dialCode === '+') {
    return `+${cleanDigits.replace(/^0+/, '')}`;
  }

  const codeDigits = dialCode.replace(/\D/g, '');
  if (cleanDigits.startsWith(codeDigits)) {
    const subscriber = cleanDigits.slice(codeDigits.length).replace(/^0+/, '');
    return `+${codeDigits}${subscriber}`;
  }

  const withoutLeadingZero = cleanDigits.replace(/^0+/, '');
  return `${dialCode}${withoutLeadingZero}`;
}

/**
 * Extracts the dial code and local number from an existing E.164 phone number.
 * Automatically runs detectCountryFromPhone for numbers without explicit country code.
 */
export function parsePhoneComponents(phone: string): { dialCode: string; localNumber: string } {
  if (!phone) return { dialCode: '+263', localNumber: '' };
  const trimmed = phone.trim();

  for (const country of ALL_COUNTRIES) {
    if (country.dialCode !== '+' && trimmed.startsWith(country.dialCode)) {
      return {
        dialCode: country.dialCode,
        localNumber: trimmed.slice(country.dialCode.length).replace(/^0+/, ''),
      };
    }
  }

  if (trimmed.startsWith('+')) {
    return { dialCode: '+', localNumber: trimmed.slice(1) };
  }

  // Attempt smart country auto-detection for non-prefixed local numbers (e.g. 9030098304, 09030098304)
  const detected = detectCountryFromPhone(trimmed);
  if (detected.detected && detected.country) {
    return {
      dialCode: detected.dialCode,
      localNumber: detected.localNumber,
    };
  }

  // Default assumption: Zimbabwe
  if (trimmed.startsWith('0')) {
    return { dialCode: '+263', localNumber: trimmed.slice(1) };
  }

  return { dialCode: '+263', localNumber: trimmed };
}

/**
 * Filters the country list based on user search query (name, dial code, ISO code).
 */
export function filterCountries(query: string): CountryDialInfo[] {
  if (!query || !query.trim()) return ALL_COUNTRIES;
  const clean = query.trim().toLowerCase();
  const digitsOnly = clean.replace(/\D/g, '');

  return ALL_COUNTRIES.filter((country) => {
    // 1. Country Name match
    if (country.name.toLowerCase().includes(clean)) return true;
    // 2. ISO Code match (e.g., "ZW", "NG", "GB")
    if (country.code.toLowerCase().includes(clean)) return true;
    // 3. Dial code match (e.g., "+263" or "263")
    if (country.dialCode.toLowerCase().includes(clean)) return true;
    if (digitsOnly && country.dialCode.replace(/\D/g, '').includes(digitsOnly)) return true;
    return false;
  });
}

export interface PhoneDetectionResult {
  detected: boolean;
  country: CountryDialInfo | null;
  dialCode: string;
  localNumber: string;
  source: 'international_prefix' | 'dial_code_lead' | 'national_pattern' | 'none';
}

/**
 * Automatically detects country code from user phone input.
 * Supports:
 * 1. International prefix with '+' or '00' (e.g. +2349030098304, 002349030098304)
 * 2. Full international dial code without '+' (e.g. 2349030098304, 263771234567, 27821234567, 447911123456)
 * 3. National/Local subscriber formats without dial code:
 *    - Nigeria (+234): 9030098304, 09030098304, 8031234567, 08031234567, 7011234567, 8131234567, 9121234567
 *    - Zimbabwe (+263): 771234567, 0771234567, 781234567, 711234567, 731234567, landlines
 *    - South Africa (+27): 060-069, 082, 083, 084, 82, 83, 84
 *    - Botswana (+267): 71-77 (8 digits)
 *    - Kenya (+254): 70-72, 74, 79, 11 (9 digits)
 *    - Ghana (+233): 24, 54, 55, 59, 20, 50 (9 digits)
 *    - Zambia (+260): 95, 96, 97, 76, 77 (9 digits)
 *    - United Kingdom (+44): 071-079 (11 digits with 0)
 */
export function detectCountryFromPhone(
  rawInput: string,
  currentDialCode?: string
): PhoneDetectionResult {
  if (!rawInput) {
    return { detected: false, country: null, dialCode: currentDialCode || '+263', localNumber: '', source: 'none' };
  }

  const clean = rawInput.trim();
  const digits = clean.replace(/\D/g, '');
  if (!digits || digits.length < 3) {
    return { detected: false, country: null, dialCode: currentDialCode || '+263', localNumber: clean, source: 'none' };
  }

  // 1. Explicit International Prefix (+ or 00)
  if (clean.startsWith('+') || clean.startsWith('00')) {
    const rawDigits = clean.startsWith('+') ? clean.slice(1).replace(/\D/g, '') : clean.slice(2).replace(/\D/g, '');
    const sorted = [...ALL_COUNTRIES]
      .filter((c) => c.dialCode !== '+')
      .sort((a, b) => b.dialCode.length - a.dialCode.length);

    for (const c of sorted) {
      const codeDigits = c.dialCode.replace(/\D/g, '');
      if (rawDigits.startsWith(codeDigits)) {
        const local = rawDigits.slice(codeDigits.length).replace(/^0+/, '');
        return {
          detected: true,
          country: c,
          dialCode: c.dialCode,
          localNumber: local,
          source: 'international_prefix',
        };
      }
    }
  }

  // 2. High-Confidence Full Dial Code without '+'
  // e.g. 2349030098304 (13 digits), 263771234567 (12 digits), 27821234567 (11 digits)
  const fullDialPrefixes = [
    { code: 'NG', dial: '234', minLen: 13, maxLen: 13 },
    { code: 'ZW', dial: '263', minLen: 12, maxLen: 12 },
    { code: 'ZA', dial: '27', minLen: 11, maxLen: 11 },
    { code: 'GB', dial: '44', minLen: 12, maxLen: 13 },
    { code: 'BW', dial: '267', minLen: 11, maxLen: 11 },
    { code: 'ZM', dial: '260', minLen: 12, maxLen: 12 },
    { code: 'KE', dial: '254', minLen: 12, maxLen: 12 },
    { code: 'GH', dial: '233', minLen: 12, maxLen: 12 },
    { code: 'MZ', dial: '258', minLen: 12, maxLen: 12 },
    { code: 'NA', dial: '264', minLen: 11, maxLen: 12 },
    { code: 'MW', dial: '265', minLen: 11, maxLen: 12 },
  ];

  for (const item of fullDialPrefixes) {
    if (digits.startsWith(item.dial) && digits.length >= item.minLen && digits.length <= item.maxLen) {
      const foundCountry = ALL_COUNTRIES.find((x) => x.code === item.code);
      if (foundCountry) {
        return {
          detected: true,
          country: foundCountry,
          dialCode: foundCountry.dialCode,
          localNumber: digits.slice(item.dial.length).replace(/^0+/, ''),
          source: 'dial_code_lead',
        };
      }
    }
  }

  // 3. National / Local Subscriber Formats (No dial code prefix entered)
  // Nigeria (NG, +234):
  // 10 digits without leading 0: 9030098304, 8031234567, 7011234567, 8121234567, 9121234567
  // Or 11 digits with leading 0: 09030098304, 08031234567, etc.
  const ngRegex = /^(?:0)?(70[1-9]|80[1-9]|81[0-9]|90[1-9]|91[1-6])(\d{7})$/;
  const ngMatch = digits.match(ngRegex);
  if (ngMatch) {
    const country = ALL_COUNTRIES.find((x) => x.code === 'NG')!;
    return {
      detected: true,
      country,
      dialCode: country.dialCode,
      localNumber: ngMatch[1] + ngMatch[2],
      source: 'national_pattern',
    };
  }

  // Partial typing for Nigeria (at least 3-4 digits e.g. 903..., 0903..., 803..., 0803...)
  if (/^(?:0)?(90[1-9]|80[1-9]|81[0-9]|70[1-9]|91[1-6])/.test(digits)) {
    const country = ALL_COUNTRIES.find((x) => x.code === 'NG')!;
    return {
      detected: true,
      country,
      dialCode: country.dialCode,
      localNumber: digits.replace(/^0+/, ''),
      source: 'national_pattern',
    };
  }

  // Zimbabwe (ZW, +263):
  // 9 digits without 0: 771234567, 781234567, 711234567, 731234567
  // 10 digits with 0: 0771234567, 0781234567, etc.
  const zwRegex = /^(?:0)?(77|78|71|73|24|29|20|54|39|67|68|55|28)(\d{6,7})$/;
  const zwMatch = digits.match(zwRegex);
  if (zwMatch) {
    const country = ALL_COUNTRIES.find((x) => x.code === 'ZW')!;
    return {
      detected: true,
      country,
      dialCode: country.dialCode,
      localNumber: zwMatch[1] + zwMatch[2],
      source: 'national_pattern',
    };
  }

  // Partial typing for Zimbabwe mobile (77..., 78..., 71..., 73...)
  if (/^(?:0)?(77|78|71|73)/.test(digits) && digits.length >= 3) {
    const country = ALL_COUNTRIES.find((x) => x.code === 'ZW')!;
    return {
      detected: true,
      country,
      dialCode: country.dialCode,
      localNumber: digits.replace(/^0+/, ''),
      source: 'national_pattern',
    };
  }

  // South Africa (ZA, +27):
  if (/^(?:0)?(60|61|62|63|64|65|66|67|68|69|82|83|84|72|76|79|74)(\d{7})$/.test(digits)) {
    const country = ALL_COUNTRIES.find((x) => x.code === 'ZA')!;
    return {
      detected: true,
      country,
      dialCode: country.dialCode,
      localNumber: digits.replace(/^0+/, ''),
      source: 'national_pattern',
    };
  }

  // Botswana (BW, +267):
  if (/^(?:0)?(71|72|73|74|75|76|77)(\d{6})$/.test(digits)) {
    const country = ALL_COUNTRIES.find((x) => x.code === 'BW')!;
    return {
      detected: true,
      country,
      dialCode: country.dialCode,
      localNumber: digits.replace(/^0+/, ''),
      source: 'national_pattern',
    };
  }

  // Kenya (KE, +254):
  if (/^(?:0)?(7[0-2]|74|79|11)(\d{7})$/.test(digits)) {
    const country = ALL_COUNTRIES.find((x) => x.code === 'KE')!;
    return {
      detected: true,
      country,
      dialCode: country.dialCode,
      localNumber: digits.replace(/^0+/, ''),
      source: 'national_pattern',
    };
  }

  // Ghana (GH, +233):
  if (/^(?:0)?(24|54|55|59|20|50|26|56|27|57)(\d{7})$/.test(digits)) {
    const country = ALL_COUNTRIES.find((x) => x.code === 'GH')!;
    return {
      detected: true,
      country,
      dialCode: country.dialCode,
      localNumber: digits.replace(/^0+/, ''),
      source: 'national_pattern',
    };
  }

  // Zambia (ZM, +260):
  if (/^(?:0)?(95|96|97|76|77)(\d{7})$/.test(digits)) {
    const country = ALL_COUNTRIES.find((x) => x.code === 'ZM')!;
    return {
      detected: true,
      country,
      dialCode: country.dialCode,
      localNumber: digits.replace(/^0+/, ''),
      source: 'national_pattern',
    };
  }

  // United Kingdom (GB, +44):
  if (/^07[1-9]\d{8}$/.test(digits)) {
    const country = ALL_COUNTRIES.find((x) => x.code === 'GB')!;
    return {
      detected: true,
      country,
      dialCode: country.dialCode,
      localNumber: digits.slice(1),
      source: 'national_pattern',
    };
  }

  return {
    detected: false,
    country: null,
    dialCode: currentDialCode || '+263',
    localNumber: clean,
    source: 'none',
  };
}

/**
 * Normalizes any phone number input into international E.164 format.
 * Automatically runs detectCountryFromPhone so that inputs like '9030098304' or '09030098304'
 * become '+2349030098304', '0771234567' becomes '+263771234567', etc.
 */
export function normalizePhoneNumber(rawInput: string, defaultDialCode = '+263'): string {
  if (!rawInput) return '';
  const trimmed = rawInput.trim();
  const detection = detectCountryFromPhone(trimmed, defaultDialCode);
  if (detection.detected && detection.country) {
    return formatE164Phone(detection.dialCode, detection.localNumber);
  }
  if (trimmed.startsWith('+')) {
    return trimmed.replace(/\s+/g, '');
  }
  return formatE164Phone(defaultDialCode, trimmed);
}

