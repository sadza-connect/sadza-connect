/**
 * Currency utilities for Zimbabwe's dual-currency multi-rail ecosystem:
 * USD (United States Dollar) and ZiG (Zimbabwe Gold) / ZWL
 */

// Indicative default exchange rate: 1 USD = 27.50 ZiG
export const DEFAULT_USD_TO_ZIG_RATE = 27.50;

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatZiG(amountInZiG: number): string {
  return `ZiG ${new Intl.NumberFormat('en-ZW', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInZiG)}`;
}

export function convertUsdToZiG(amountUsd: number, rate: number = DEFAULT_USD_TO_ZIG_RATE): number {
  return amountUsd * rate;
}

export function formatDualCurrency(amountUsd: number, rate: number = DEFAULT_USD_TO_ZIG_RATE): {
  usd: string;
  zig: string;
  combined: string;
} {
  const usd = formatUSD(amountUsd);
  const zig = formatZiG(convertUsdToZiG(amountUsd, rate));
  return {
    usd,
    zig,
    combined: `${usd} / ${zig}`,
  };
}
