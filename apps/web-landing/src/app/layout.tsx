import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SaludTech — Tu salud, en cuotas sin interés",
  description:
    "Accede a farmacias, clínicas, especialistas y cuidado para adultos mayores con financiamiento sin interés. Paga en cuotas cada 14 días con SaludTech.",
  keywords: [
    "BNPL salud Venezuela",
    "cuotas médicas sin interés",
    "farmacia cuotas",
    "telemedicina Venezuela",
    "elder care",
    "financiamiento salud",
  ],
  openGraph: {
    title: "SaludTech — Tu salud, en cuotas sin interés",
    description:
      "Accede a servicios médicos y paga en cuotas sin interés. Farmacias, clínicas, especialistas y Elder Care.",
    type: "website",
    locale: "es_VE",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaludTech — Tu salud, en cuotas sin interés",
    description: "Financiamiento médico sin interés para ti y tu familia.",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${outfit.variable} ${syne.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
