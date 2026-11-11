export const paymentsEnabled = process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === "true";

export function isPaymentRoute(path: string): boolean {
  return /^\/(?:payment(?:\/|$)|applications\/[^/]+\/payment(?:\/|$))/.test(path);
}
