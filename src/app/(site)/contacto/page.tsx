import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { parseOpeningHours } from "@/lib/format";

export const metadata: Metadata = { title: "Contacto" };
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } }) as any;
  const phone = settings?.phone ?? "956 71 60 77";
  const mapsUrl = settings?.mapsUrl ?? "https://www.google.com/maps/place//data=!4m2!3m1!1s0xd0d1472e8bb1e95:0x153d77a80ef824a8?sa=X&ved=1t:8290&ictx=111";
  const openingHours = parseOpeningHours(settings?.openingHours);
  const holidayHours = settings?.holidayHours ?? "Consultar horario en festivos";
  const mapQuery = encodeURIComponent("Venta El Bujio Benamahoma Cádiz");
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;

  return (
    <div className="page">
      <div className="eyebrow">Información</div>
      <h1 style={{ fontSize: "clamp(3rem,7vw,5.5rem)" }}>Contacto</h1>
      <div className="contact-panel" style={{ marginTop: 30 }}>
        <div className="card">
          <div className="muted">Teléfono:</div>
          <a className="contact-big accent" href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
          <p className="muted">{settings?.contactText ?? "Llámanos para cualquier consulta sobre la carta, horarios o la venta."}</p>

          <div className="muted" style={{ marginTop: 18 }}>Dirección:</div>
          <div className="contact-address">{settings?.address ?? "Venta El Bujio · Benamahoma, Cádiz"}</div>
          {settings?.addressNote ? <p className="muted contact-address-note">{settings.addressNote}</p> : null}

          {(settings?.instagramUrl || settings?.facebookUrl) ? (
            <div className="row-actions" style={{ marginTop: 18 }}>
              {settings?.instagramUrl ? <a className="button" href={settings.instagramUrl} target="_blank" rel="noreferrer">Instagram</a> : null}
              {settings?.facebookUrl ? <a className="button" href={settings.facebookUrl} target="_blank" rel="noreferrer">Facebook</a> : null}
            </div>
          ) : null}
        </div>

        <div className="card">
          <div className="muted">Cómo llegar:</div>
          <div className="map-embed-wrap">
            <iframe
              className="map-iframe"
              src={mapEmbedUrl}
              title="Mapa de Venta El Bujio"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              className="map-click-layer"
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Abrir Venta El Bujio en Google Maps"
            >
              <span>Abrir en Google Maps</span>
            </a>
          </div>
          <div className="hr" style={{ margin: "22px 0" }} />
          <div className="muted">Horario:</div>
          <div className="hours-list" style={{ marginTop: 14 }}>
            {openingHours.map((item) => (
              <div className="hours-row" key={item.day}>
                <strong>{item.day}</strong>
                <span>{item.hours}</span>
              </div>
            ))}
            <div className="hours-row holiday-hours-row">
              <strong>Festivos</strong>
              <span>{holidayHours}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
