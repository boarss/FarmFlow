/**
 * Email validation utilities
 */

// Email regex pattern (RFC 5322 simplified)
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return EMAIL_REGEX.test(email.trim().toLowerCase());
}

/**
 * Normalize email (lowercase and trim)
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!password) {
    return { isValid: false, errors: ['Password is required'] };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get password strength level
 */
export function getPasswordStrength(password: string): {
  level: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
  feedback: string;
} {
  let score = 0;
  
  if (!password) {
    return { level: 'weak', score: 0, feedback: 'Password is required' };
  }
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  
  // Determine level
  let level: 'weak' | 'medium' | 'strong' | 'very-strong';
  let feedback: string;
  
  if (score <= 2) {
    level = 'weak';
    feedback = 'Weak password. Add more characters and variety.';
  } else if (score <= 4) {
    level = 'medium';
    feedback = 'Medium strength. Consider adding more variety.';
  } else if (score <= 6) {
    level = 'strong';
    feedback = 'Strong password!';
  } else {
    level = 'very-strong';
    feedback = 'Very strong password!';
  }
  
  return { level, score, feedback };
}

/**
 * Validate email and password together
 */
export function validateCredentials(email: string, password: string): {
  isValid: boolean;
  emailError?: string;
  passwordErrors?: string[];
} {
  const emailValid = isValidEmail(email);
  const passwordValidation = validatePassword(password);
  
  return {
    isValid: emailValid && passwordValidation.isValid,
    emailError: emailValid ? undefined : 'Invalid email format',
    passwordErrors: passwordValidation.errors.length > 0 ? passwordValidation.errors : undefined,
  };
}

/**
 * Mask email for privacy (e.g., j***@example.com)
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  
  const [localPart, domain] = email.split('@');
  
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  
  return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
}

/**
 * Extract domain from email
 */
export function getEmailDomain(email: string): string {
  if (!email || !email.includes('@')) return '';
  return email.split('@')[1].toLowerCase();
}

/**
 * Check if email is from a common provider
 */
export function isCommonEmailProvider(email: string): boolean {
  const commonProviders = [
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
    'icloud.com',
    'aol.com',
    'protonmail.com',
  ];
  
  const domain = getEmailDomain(email);
  return commonProviders.includes(domain);
}

// Made with Bob