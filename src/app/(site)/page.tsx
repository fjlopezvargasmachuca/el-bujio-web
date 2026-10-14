import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ShareButtons } from "@/components/ShareButtons";

export const dynamic = "force-dynamic";

const featureLinks = [
  { href: "/carta", title: "Carta", text: "Cocina, bebidas, vinos, chacina y postres." },
  { href: "/menu-del-dia", title: "Menú del día", text: "Un primero, un segundo y un postre entre las opciones disponibles." },
  { href: "/ofertas", title: "Ofertas", text: "Consulta las promociones disponibles actualmente en la venta." },
  { href: "/contacto", title: "Contacto", text: "Teléfono, horario y ubicación para llegar a la venta." },
] as const;

const FALLBACK_HOME_IMAGE_1 = "https://turismo.grazalema.es/images/images/FOTOS/GUIA/2020/COMER/101-El-Bujio-01.jpg";
const FALLBACK_HOME_IMAGE_2 = "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/.Spain%2C_Andalusia%2C_Benamahoma_%2803%29.jpg/1280px-.Spain%2C_Andalusia%2C_Benamahoma_%2803%29.jpg";

export default async function HomePage() {
  const settings = (await prisma.siteSettings.findUnique({
    where: { id: 1 },
    select: ({
      restaurantName: true,
      phone: true,
      address: true,
      mapsUrl: true,
      updatedAt: true,
      homeImage1Mime: true,
      homeImage1Title: true,
      homeImage1Description: true,
      homeImage1CreditText: true,
      homeImage1CreditUrl: true,
      homeImage2Mime: true,
      homeImage2Title: true,
      homeImage2Description: true,
      homeImage2CreditText: true,
      homeImage2CreditUrl: true,
    } as any),
  })) as any;
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const mapsUrl = settings?.mapsUrl ?? "https://www.google.com/maps/place//data=!4m2!3m1!1s0xd0d1472e8bb1e95:0x153d77a80ef824a8?sa=X&ved=1t:8290&ictx=111";
  const imageVersion = settings?.updatedAt?.getTime() ?? Date.now();
  const homeImage1Src = (settings as any)?.homeImage1Mime ? `/api/portada/1/imagen?v=${imageVersion}` : FALLBACK_HOME_IMAGE_1;
  const homeImage2Src = (settings as any)?.homeImage2Mime ? `/api/portada/2/imagen?v=${imageVersion}` : FALLBACK_HOME_IMAGE_2;
  const homeImage1Title = (settings as any)?.homeImage1Title ?? "La venta y su terraza";
  const homeImage1Description = (settings as any)?.homeImage1Description ?? "Un rincón tradicional a la entrada de Benamahoma.";
  const homeImage1CreditText = (settings as any)?.homeImage1CreditText ?? "Foto: Turismo de Grazalema";
  const homeImage1CreditUrl = (settings as any)?.homeImage1CreditUrl ?? "https://turismo.grazalema.es/index.php/la-guia/comer/336-101-venta-el-bujio";
  const homeImage2Title = (settings as any)?.homeImage2Title ?? "Benamahoma y su entorno";
  const homeImage2Description = (settings as any)?.homeImage2Description ?? "Naturaleza, pueblo blanco y Sierra de Grazalema.";
  const homeImage2CreditText = (settings as any)?.homeImage2CreditText ?? "Foto: Vincent van Zeijst · CC BY-SA 4.0";
  const homeImage2CreditUrl = (settings as any)?.homeImage2CreditUrl ?? "https://commons.wikimedia.org/wiki/File:.Spain,_Andalusia,_Benamahoma_(03).jpg";

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
            <img src={homeImage1Src} alt={homeImage1Title} loading="lazy" />
            <figcaption>
              <strong>{homeImage1Title}</strong>
              <span>{homeImage1Description}</span>
              {homeImage1CreditText ? (homeImage1CreditUrl ? <a href={homeImage1CreditUrl} target="_blank" rel="noreferrer">{homeImage1CreditText}</a> : <small>{homeImage1CreditText}</small>) : null}
            </figcaption>
          </figure>
          <figure className="place-photo-card">
            <img src={homeImage2Src} alt={homeImage2Title} loading="lazy" />
            <figcaption>
              <strong>{homeImage2Title}</strong>
              <span>{homeImage2Description}</span>
              {homeImage2CreditText ? (homeImage2CreditUrl ? <a href={homeImage2CreditUrl} target="_blank" rel="noreferrer">{homeImage2CreditText}</a> : <small>{homeImage2CreditText}</small>) : null}
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="home-features" aria-labelledby="sabores-title">
        <div className="feature-heading home-feature-heading">
          <h2 id="sabores-title">Sabores de siempre</h2>
          <p>Consulta nuestra carta, el menú del día, las ofertas o cómo llegar.</p>
        </div>
        <div className="showcase-grid feature-cross">
          {featureLinks.map((item) => (
            <Link className="showcase-item showcase-link earth-patch" href={item.href} key={item.href}>
              <strong>{item.title}</strong>
              <span>{item.text}</span>
            </Link>
          ))}
        </div>
        <Link className="land-home-cta" href="/productos-de-la-tierra">
          <div>
            <span className="eyebrow">Para llevar</span>
            <strong>Productos de la tierra</strong>
            <p>Miel, sal, aceite y otros productos seleccionados de la zona, disponibles por unidad.</p>
          </div>
        </Link>
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
            <a className="button primary review-google-button" href={mapsUrl} target="_blank" rel="noreferrer">Ver en Google</a>
          </div>
        </div>
      </section>
    </div>
  );
}
