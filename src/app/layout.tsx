import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "El Bujio | Venta",
    template: "%s | El Bujio",
  },
  description: "Carta, bebidas, vinos, chacina, menú del día, productos de la tierra, ofertas y alérgenos de la Venta El Bujio.",
  icons: {
    icon: "/favicon-512.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Venta El Bujio",
    description: "Consulta la carta, bebidas, vinos, chacina, menú del día y productos de la tierra de Venta El Bujio.",
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
