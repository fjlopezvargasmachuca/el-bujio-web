import Link from "next/link";
import { prisma } from "@/lib/db";
import { PublicShell } from "@/components/PublicShell";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const phone = settings?.phone ?? "956 71 60 77";
  return (
    <PublicShell phone={phone}>
      {children}
      <footer className="footer">
        <div className="footer-inner">
          <div>© {new Date().getFullYear()} El Bujio · Venta</div>
          <div className="row-actions">
            <Link href="/carta">Carta</Link>
            <Link href="/contacto">Contacto</Link>
          </div>
        </div>
      </footer>
    </PublicShell>
  );
}
