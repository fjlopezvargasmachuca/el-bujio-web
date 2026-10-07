import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "El Bujio | Venta",
    template: "%s | El Bujio",
  },
  description: "Carta, menú del día, postres, ofertas, ingredientes y alérgenos de la Venta El Bujio.",
  icons: {
    icon: "/favicon-512.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Venta El Bujio",
    description: "Consulta la carta, el menú del día, los postres y las ofertas de Venta El Bujio.",
    type: "website",
    locale: "es_ES",
    images: [{ url: "/marca-completa.png", width: 1254, height: 1254, alt: "Venta El Bujio" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
