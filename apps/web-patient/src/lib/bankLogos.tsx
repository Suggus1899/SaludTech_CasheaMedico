type BankLogoProps = {
  bankId: string;
  className?: string;
};

type BankStyle = {
  bg: string;
  text: string;
  label: string;
  abbr: string;
};

const bankStyles: Record<string, BankStyle> = {
  bankBanesco: { bg: "#E30613", text: "#FFFFFF", label: "Banesco", abbr: "B" },
  bankBDV: { bg: "#003366", text: "#FFFFFF", label: "BDV", abbr: "BDV" },
  bankMercantil: { bg: "#1B6E3B", text: "#FFFFFF", label: "Mercantil", abbr: "M" },
  bankProvincial: { bg: "#004481", text: "#FFFFFF", label: "Provincial", abbr: "P" },
  bankBNC: { bg: "#F58220", text: "#FFFFFF", label: "BNC", abbr: "BNC" },
  bankCaroni: { bg: "#0066B3", text: "#FFFFFF", label: "Caroní", abbr: "C" },
  bankBancaribe: { bg: "#00529B", text: "#FFFFFF", label: "Bancaribe", abbr: "BC" },
  bankTesoro: { bg: "#C8102E", text: "#FFD700", label: "Tesoro", abbr: "T" },
  bankBancamiga: { bg: "#E8770E", text: "#FFFFFF", label: "Bancamiga", abbr: "BM" },
  bankBangente: { bg: "#2E7D32", text: "#FFFFFF", label: "Bangente", abbr: "BG" },
  bank100: { bg: "#1565C0", text: "#FFFFFF", label: "100% Banco", abbr: "100" },
  zinli: { bg: "#6C2BD9", text: "#FFFFFF", label: "Zinli", abbr: "Z" },
  paypal: { bg: "#003087", text: "#FFFFFF", label: "PayPal", abbr: "PP" },
  stripe: { bg: "#635BFF", text: "#FFFFFF", label: "Stripe", abbr: "S" },
};

export function BankLogo({ bankId, className = "w-10 h-10" }: BankLogoProps) {
  const style = bankStyles[bankId];
  if (!style) return null;

  return (
    <div
      className={`${className} rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-sm`}
      style={{ backgroundColor: style.bg, color: style.text }}
      aria-hidden="true"
    >
      {style.abbr}
    </div>
  );
}

export function getBankLabel(bankId: string): string {
  return bankStyles[bankId]?.label ?? bankId;
}

export { bankStyles };
