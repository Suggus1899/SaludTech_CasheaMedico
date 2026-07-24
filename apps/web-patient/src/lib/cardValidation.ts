export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "unknown";

export const brandLabels: Record<CardBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  discover: "Discover",
  unknown: "",
};

export function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 12) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (shouldDouble) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function detectBrand(cardNumber: string): CardBrand {
  const n = cardNumber.replace(/\D/g, "");
  if (!n) return "unknown";
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (/^(6011|64[4-9]|65)/.test(n)) return "discover";
  return "unknown";
}

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  const brand = detectBrand(digits);
  if (brand === "amex") {
    const max = digits.slice(0, 15);
    const p1 = max.slice(0, 4);
    const p2 = max.slice(4, 10);
    const p3 = max.slice(10, 15);
    return [p1, p2, p3].filter(Boolean).join(" ");
  }
  const max = digits.slice(0, 16);
  return max.match(/.{1,4}/g)?.join(" ") ?? max;
}

export function isValidCardNumber(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  const brand = detectBrand(digits);
  if (brand === "unknown") return false;
  const expectedLength = brand === "amex" ? 15 : 16;
  if (digits.length !== expectedLength) return false;
  return luhnCheck(digits);
}

export function isValidCvv(cvv: string, brand: CardBrand): boolean {
  const digits = cvv.replace(/\D/g, "");
  const expectedLength = brand === "amex" ? 4 : 3;
  return digits.length === expectedLength;
}

export function isValidExpiration(month: string, year: string): boolean {
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  if (isNaN(m) || isNaN(y)) return false;
  if (m < 1 || m > 12) return false;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (y < currentYear) return false;
  if (y === currentYear && m < currentMonth) return false;
  return true;
}
