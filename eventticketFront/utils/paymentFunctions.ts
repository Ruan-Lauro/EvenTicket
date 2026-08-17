export function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

export function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

export function maskCardNumber(number: string) {
  const clean = number.replace(/\s/g, "");
  if (clean.length <= 4) return clean.padEnd(16, "·").replace(/(.{4})/g, "$1 ").trim();
  const shown = clean.slice(-4);
  return `···· ···· ···· ${shown}`;
}

export function getCardBrand(number: string): "visa" | "mastercard" | "other" {
  const n = number.replace(/\s/g, "");
  if (n.startsWith("4")) return "visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "mastercard";
  return "other";
}