export function formatUnits(value: string, decimals: number): string {
  if (!Number.isFinite(decimals) || decimals <= 0) return value;

  const negative = value.startsWith('-');
  const digits = (negative ? value.slice(1) : value).replace(/[^0-9]/g, '');

  if (digits.length === 0) return '0';

  const padded = digits.padStart(decimals + 1, '0');
  const integerPart = padded.slice(0, -decimals);
  const fractionRaw = padded.slice(-decimals);
  const fractionPart = fractionRaw.replace(/0+$/, '');

  const formatted = fractionPart.length > 0 ? `${integerPart}.${fractionPart}` : integerPart;
  return negative ? `-${formatted}` : formatted;
}
