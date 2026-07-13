import type { Metadata, Viewport } from "next";
import { Outfit, Syne } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SaludTech - Paciente",
  description: "Portal del paciente SaludTech",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SaludTech",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a6b8a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${outfit.variable} ${syne.variable} font-sans h-full`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('theme');var t=m==='dark'?'saludtech-dark':'saludtech';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
