export const TEMP_BYPASS_ACCOUNT_VERIFICATION =
  process.env.NEXT_PUBLIC_ACCOUNT_VERIFICATION_BYPASS === "true";

export function isAccountVerificationBypassed() {
  return TEMP_BYPASS_ACCOUNT_VERIFICATION;
}
