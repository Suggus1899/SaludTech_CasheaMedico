import type { Metadata } from "next";
import "./globals.css";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
