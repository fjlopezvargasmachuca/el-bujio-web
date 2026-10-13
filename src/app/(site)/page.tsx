import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ShareButtons } from "@/components/ShareButtons";

export const dynamic = "force-dynamic";

const featureLinks = [
  { href: "/carta", title: "Carta", text: "Entrantes, pescados, carnes, bocadillos y postres." },
  { href: "/menu-del-dia", title: "Menú del día", text: "Un primero, un segundo y un postre entre las opciones disponibles." },
  { href: "/ofertas", title: "Ofertas", text: "Consulta las promociones disponibles actualmente en la venta." },
  { href: "/contacto", title: "Contacto", text: "Teléfono, horario y ubicación para llegar a la venta." },
] as const;

export default async function HomePage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const mapsUrl = settings?.mapsUrl ?? "https://www.google.com/maps/place//data=!4m2!3m1!1s0xd0d1472e8bb1e95:0x153d77a80ef824a8?sa=X&ved=1t:8290&ictx=111";

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: settings?.restaurantName ?? "El Bujio",
    telephone: settings?.phone,
    address: settings?.address,
    url: baseUrl,
    menu: `${baseUrl}/carta`,
    servesCuisine: ["Española", "Tradicional"],
  }).replace(/</g, "\\u003c");

  return (
    <div className="page home-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <section className="home-intro">
        <div className="home-intro-copy">
          <div className="eyebrow">Venta tradicional · cocina casera · Benamahoma</div>
          <h1>El Bujio</h1>
          <p>
            Cocina tradicional, producto cercano y platos de siempre. Consulta lo que tenemos preparado hoy
            y encuentra toda la información de la venta antes de venir a vernos.
          </p>
        </div>
        <div className="home-sign" aria-label="Rótulo de Venta El Bujio">
          <Image src="/rotulo-el-bujio.png" alt="Rótulo Venta El Bujio" width={1254} height={723} priority />
        </div>
      </section>

      <section className="section-compact place-gallery-section" aria-labelledby="lugar-title">
        <div className="section-head place-gallery-head">
          <div>
            <div className="eyebrow">Benamahoma · Sierra de Grazalema</div>
            <h2 id="lugar-title">Un lugar para disfrutar sin prisas</h2>
            <p>La venta se encuentra en un entorno natural privilegiado, junto a Benamahoma y muy cerca del sendero del río Majaceite.</p>
          </div>
        </div>
        <div className="place-gallery">
          <figure className="place-photo-card">
            <img
              src="https://turismo.grazalema.es/images/images/FOTOS/GUIA/2020/COMER/101-El-Bujio-01.jpg"
              alt="Exterior y terraza de Venta El Bujio en Benamahoma"
              loading="lazy"
            />
            <figcaption>
              <strong>La venta y su terraza</strong>
              <span>Un rincón tradicional a la entrada de Benamahoma.</span>
              <a href="https://turismo.grazalema.es/index.php/la-guia/comer/336-101-venta-el-bujio" target="_blank" rel="noreferrer">Foto: Turismo de Grazalema</a>
            </figcaption>
          </figure>
          <figure className="place-photo-card">
            <img
              src="https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/.Spain%2C_Andalusia%2C_Benamahoma_%2803%29.jpg/1280px-.Spain%2C_Andalusia%2C_Benamahoma_%2803%29.jpg"
              alt="Vista panorámica de Benamahoma y la Sierra de Grazalema"
              loading="lazy"
            />
            <figcaption>
              <strong>Benamahoma y su entorno</strong>
              <span>Naturaleza, pueblo blanco y Sierra de Grazalema.</span>
              <a href="https://commons.wikimedia.org/wiki/File:.Spain,_Andalusia,_Benamahoma_(03).jpg" target="_blank" rel="noreferrer">Foto: Vincent van Zeijst · CC BY-SA 4.0</a>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="home-features" aria-labelledby="sabores-title">
        <Link className="feature-heading" href="/carta">
          <div className="eyebrow">El Bujio</div>
          <h2 id="sabores-title">Sabores de siempre</h2>
          <p>Consulta nuestra carta, el menú del día, las ofertas o cómo llegar.</p>
        </Link>
        <div className="showcase-grid">
          {featureLinks.map((item) => (
            <Link className="showcase-item showcase-link" href={item.href} key={item.href}>
              <strong>{item.title}</strong>
              <span>{item.text}</span>
              <span className="showcase-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section share-section">
        <div>
          <div className="eyebrow">Ayúdanos a llegar a más gente</div>
          <h2>Comparte El Bujio</h2>
          <p className="muted">
            Si te gusta nuestra cocina, comparte la web con quien quieras venir a disfrutarla.
            Tu recomendación nos ayuda a seguir dando a conocer la venta.
          </p>
          <ShareButtons />
        </div>
        <div className="share-review-card">
          <Image src="/logo-el-bujio.png" alt="Logo de Venta El Bujio" width={180} height={180} />
          <div>
            <strong>¿Ya nos conoces?</strong>
            <p>También puedes abrir nuestra ficha en Google y dejar tu valoración.</p>
            <a className="button primary" href={mapsUrl} target="_blank" rel="noreferrer">Ver en Google</a>
          </div>
        </div>
      </section>
    </div>
  );
}
