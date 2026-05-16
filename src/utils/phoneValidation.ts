/**
 * Phone number validation utilities for Nigerian phone numbers
 */

// Nigerian phone number formats:
// - 080XXXXXXXX (11 digits starting with 0)
// - +234XXXXXXXXXX (14 digits with country code)
// - 234XXXXXXXXXX (13 digits without +)

export const NIGERIAN_PHONE_REGEX = /^(\+?234|0)[789][01]\d{8}$/;

/**
 * Validate Nigerian phone number
 */
export function isValidNigerianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, '');
  return NIGERIAN_PHONE_REGEX.test(cleaned);
}

/**
 * Format phone number to E.164 format (+234XXXXXXXXXX)
 */
export function formatPhoneToE164(phone: string): string {
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Already in E.164 format
  if (cleaned.startsWith('+234')) {
    return cleaned;
  }
  
  // Remove leading 0 and add +234
  if (cleaned.startsWith('0')) {
    return `+234${cleaned.slice(1)}`;
  }
  
  // Add + if missing
  if (cleaned.startsWith('234')) {
    return `+${cleaned}`;
  }
  
  return cleaned;
}

/**
 * Format phone number for display (0XXXXXXXXXX)
 */
export function formatPhoneForDisplay(phone: string): string {
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Convert from E.164 to local format
  if (cleaned.startsWith('+234')) {
    return `0${cleaned.slice(4)}`;
  }
  
  if (cleaned.startsWith('234')) {
    return `0${cleaned.slice(3)}`;
  }
  
  return cleaned;
}

/**
 * Mask phone number for privacy (080****1234)
 */
export function maskPhoneNumber(phone: string): string {
  const display = formatPhoneForDisplay(phone);
  if (display.length !== 11) return phone;
  
  return `${display.slice(0, 3)}****${display.slice(-4)}`;
}

/**
 * Get phone number carrier from prefix
 */
export function getPhoneCarrier(phone: string): string {
  const display = formatPhoneForDisplay(phone);
  const prefix = display.slice(0, 4);
  
  const carriers: Record<string, string> = {
    '0803': 'MTN',
    '0806': 'MTN',
    '0810': 'MTN',
    '0813': 'MTN',
    '0814': 'MTN',
    '0816': 'MTN',
    '0903': 'MTN',
    '0906': 'MTN',
    '0805': 'Glo',
    '0807': 'Glo',
    '0811': 'Glo',
    '0815': 'Glo',
    '0905': 'Glo',
    '0802': 'Airtel',
    '0808': 'Airtel',
    '0812': 'Airtel',
    '0901': 'Airtel',
    '0902': 'Airtel',
    '0907': 'Airtel',
    '0809': '9mobile',
    '0817': '9mobile',
    '0818': '9mobile',
    '0908': '9mobile',
    '0909': '9mobile',
  };
  
  return carriers[prefix] || 'Unknown';
}

/**
 * Validate and format phone number
 */
export function validateAndFormatPhone(phone: string): {
  isValid: boolean;
  formatted: string;
  display: string;
  carrier: string;
  error?: string;
} {
  const cleaned = phone.replace(/[\s-]/g, '');
  
  if (!cleaned) {
    return {
      isValid: false,
      formatted: '',
      display: '',
      carrier: '',
      error: 'Phone number is required',
    };
  }
  
  if (!isValidNigerianPhone(cleaned)) {
    return {
      isValid: false,
      formatted: cleaned,
      display: cleaned,
      carrier: '',
      error: 'Invalid Nigerian phone number format',
    };
  }
  
  const formatted = formatPhoneToE164(cleaned);
  const display = formatPhoneForDisplay(cleaned);
  const carrier = getPhoneCarrier(cleaned);
  
  return {
    isValid: true,
    formatted,
    display,
    carrier,
  };
}

// Made with Bob