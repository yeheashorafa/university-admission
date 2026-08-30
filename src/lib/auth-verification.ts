export const TEMP_BYPASS_ACCOUNT_VERIFICATION = true;

/**
 * TEMPORARY:
 * Verification flow is currently disabled until OTP/email verification behavior
 * is finalized with backend.
 *
 * TODO:
 * Set TEMP_BYPASS_ACCOUNT_VERIFICATION to false once verification is ready.
 */
export function isAccountVerificationBypassed() {
  return TEMP_BYPASS_ACCOUNT_VERIFICATION;
}
