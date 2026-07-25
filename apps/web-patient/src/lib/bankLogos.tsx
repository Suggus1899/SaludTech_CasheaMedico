import Image from "next/image";

type BankLogoProps = {
  bankId: string;
  className?: string;
};

const bankLogoMap: Record<string, { src: string; alt: string }> = {
  bankBanesco: { src: "/banks/banesco.png", alt: "Banesco" },
  bankBDV: { src: "/banks/bdv.png", alt: "Banco de Venezuela" },
  bankMercantil: { src: "/banks/mercantil.png", alt: "Mercantil" },
  bankProvincial: { src: "/banks/provincial.png", alt: "BBVA Provincial" },
  bankBNC: { src: "/banks/bnc.png", alt: "Banco Nacional de Crédito" },
  bankCaroni: { src: "/banks/caroni.png", alt: "Banco Caroní" },
  bankBancaribe: { src: "/banks/bancaribe.png", alt: "Bancaribe" },
  bankTesoro: { src: "/banks/tesoro.png", alt: "Banco del Tesoro" },
  bankBancamiga: { src: "/banks/bancamiga.png", alt: "Bancamiga" },
  bankBangente: { src: "/banks/bangente.png", alt: "Bangente" },
  bank100: { src: "/banks/100banco.png", alt: "100% Banco" },
  zinli: { src: "/banks/zinli.svg", alt: "Zinli" },
  paypal: { src: "/banks/paypal.svg", alt: "PayPal" },
  stripe: { src: "/banks/stripe.svg", alt: "Stripe" },
};

export function BankLogo({ bankId, className = "w-10 h-10" }: BankLogoProps) {
  const logo = bankLogoMap[bankId];
  if (!logo) return null;

  return (
    <div className={`${className} relative shrink-0`}>
      <Image
        src={logo.src}
        alt={logo.alt}
        fill
        className="object-contain"
        sizes="40px"
      />
    </div>
  );
}

export function getBankLabel(bankId: string): string {
  return bankLogoMap[bankId]?.alt ?? bankId;
}

export { bankLogoMap };
