import { prisma } from "@/lib/db";
import { updateContact } from "../actions";

export const dynamic = "force-dynamic";

const FALLBACK_HOME_IMAGE_1 = "https://turismo.grazalema.es/images/images/FOTOS/GUIA/2020/COMER/101-El-Bujio-01.jpg";
const FALLBACK_HOME_IMAGE_2 = "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/.Spain%2C_Andalusia%2C_Benamahoma_%2803%29.jpg/1280px-.Spain%2C_Andalusia%2C_Benamahoma_%2803%29.jpg";

export default async function AdminContactPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const [settings, params] = await Promise.all([
    prisma.siteSettings.findUnique({
      where: { id: 1 },
      select: ({
        phone: true,
        address: true,
        mapsUrl: true,
        openingHours: true,
        contactText: true,
        instagramUrl: true,
        facebookUrl: true,
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
    }) as any,
    searchParams,
  ]);
  const version = settings?.updatedAt?.getTime() ?? Date.now();
  const homeImage1Src = (settings as any)?.homeImage1Mime ? `/api/portada/1/imagen?v=${version}` : FALLBACK_HOME_IMAGE_1;
  const homeImage2Src = (settings as any)?.homeImage2Mime ? `/api/portada/2/imagen?v=${version}` : FALLBACK_HOME_IMAGE_2;

  return (
    <div className="admin-page">
      <div className="section-head">
        <div>
          <div className="eyebrow">Contacto y portada</div>
          <h2>Datos públicos</h2>
          <p>Gestiona los datos de contacto y las dos imágenes de presentación que aparecen en la página de inicio.</p>
        </div>
      </div>

      {params.status === "saved" ? <div className="status-box success admin-flash" role="status">✓ Datos públicos guardados correctamente.</div> : null}
      {params.status === "home_image_size" ? <div className="status-box error admin-flash" role="alert">La imagen supera 1,5 MB. Redúcela e inténtalo de nuevo.</div> : null}
      {params.status === "home_image_format" ? <div className="status-box error admin-flash" role="alert">Formato de imagen no válido. Utiliza JPG, PNG o WebP.</div> : null}

      <form className="card" action={updateContact} encType="multipart/form-data">
        <div className="form-grid">
          <div className="field"><label>Teléfono</label><input name="phone" required defaultValue={settings?.phone ?? "956 71 60 77"} /></div>
          <div className="field"><label>Dirección</label><input name="address" required defaultValue={settings?.address ?? "Venta El Bujio · Benamahoma, Cádiz"} /></div>
          <div className="field full"><label>Enlace de Google Maps</label><input name="mapsUrl" type="url" defaultValue={settings?.mapsUrl ?? ""} placeholder="https://www.google.com/maps/..." /></div>
          <div className="field full"><label>Horario (una línea por día, formato día|horario)</label><textarea name="openingHours" defaultValue={settings?.openingHours ?? "martes|Cerrado\nmiércoles|11:00-23:00\njueves|11:00-23:00\nviernes|11:00-23:00\nsábado|11:00-23:00\ndomingo|11:00-17:00\nlunes|11:00-23:00"} /></div>
          <div className="field full"><label>Texto de contacto</label><textarea name="contactText" defaultValue={settings?.contactText ?? ""} /></div>
          <div className="field"><label>Instagram URL</label><input name="instagramUrl" type="url" defaultValue={settings?.instagramUrl ?? ""} placeholder="https://instagram.com/..." /></div>
          <div className="field"><label>Facebook URL</label><input name="facebookUrl" type="url" defaultValue={settings?.facebookUrl ?? ""} placeholder="https://facebook.com/..." /></div>
        </div>

        <div className="hr" />
        <div className="admin-home-gallery-heading">
          <div>
            <div className="eyebrow">Página de inicio</div>
            <h3>Imágenes de presentación</h3>
            <p className="muted">Puedes sustituir las dos fotografías, cambiar su título y descripción y editar o eliminar el crédito mostrado debajo.</p>
          </div>
        </div>

        <div className="admin-home-gallery-grid">
          <section className="admin-home-gallery-card">
            <img className="admin-home-gallery-preview" src={homeImage1Src} alt="Vista previa de la primera imagen de portada" />
            <div className="field"><label>Primera imagen</label><input name="homeImage1" type="file" accept="image/jpeg,image/png,image/webp" /></div>
            {(settings as any)?.homeImage1Mime ? (
              <label className="inline-check"><input type="checkbox" name="removeHomeImage1" /> Eliminar imagen subida y recuperar la imagen inicial</label>
            ) : null}
            <div className="field"><label>Título</label><input name="homeImage1Title" maxLength={120} defaultValue={(settings as any)?.homeImage1Title ?? "La venta y su terraza"} /></div>
            <div className="field"><label>Descripción</label><textarea name="homeImage1Description" maxLength={500} defaultValue={(settings as any)?.homeImage1Description ?? "Un rincón tradicional a la entrada de Benamahoma."} /></div>
            <div className="field"><label>Texto del crédito (opcional)</label><input name="homeImage1CreditText" maxLength={160} defaultValue={(settings as any)?.homeImage1CreditText ?? "Foto: Turismo de Grazalema"} /></div>
            <div className="field"><label>Enlace del crédito (opcional)</label><input name="homeImage1CreditUrl" type="url" defaultValue={(settings as any)?.homeImage1CreditUrl ?? "https://turismo.grazalema.es/index.php/la-guia/comer/336-101-venta-el-bujio"} /></div>
          </section>

          <section className="admin-home-gallery-card">
            <img className="admin-home-gallery-preview" src={homeImage2Src} alt="Vista previa de la segunda imagen de portada" />
            <div className="field"><label>Segunda imagen</label><input name="homeImage2" type="file" accept="image/jpeg,image/png,image/webp" /></div>
            {(settings as any)?.homeImage2Mime ? (
              <label className="inline-check"><input type="checkbox" name="removeHomeImage2" /> Eliminar imagen subida y recuperar la imagen inicial</label>
            ) : null}
            <div className="field"><label>Título</label><input name="homeImage2Title" maxLength={120} defaultValue={(settings as any)?.homeImage2Title ?? "Benamahoma y su entorno"} /></div>
            <div className="field"><label>Descripción</label><textarea name="homeImage2Description" maxLength={500} defaultValue={(settings as any)?.homeImage2Description ?? "Naturaleza, pueblo blanco y Sierra de Grazalema."} /></div>
            <div className="field"><label>Texto del crédito (opcional)</label><input name="homeImage2CreditText" maxLength={160} defaultValue={(settings as any)?.homeImage2CreditText ?? "Foto: Vincent van Zeijst · CC BY-SA 4.0"} /></div>
            <div className="field"><label>Enlace del crédito (opcional)</label><input name="homeImage2CreditUrl" type="url" defaultValue={(settings as any)?.homeImage2CreditUrl ?? "https://commons.wikimedia.org/wiki/File:.Spain,_Andalusia,_Benamahoma_(03).jpg"} /></div>
          </section>
        </div>

        <p className="muted admin-upload-note">Formatos admitidos: JPG, PNG y WebP. Tamaño máximo: 1,5 MB por imagen.</p>
        <button className="button primary" style={{ marginTop: 16 }}>Guardar datos públicos</button>
      </form>
    </div>
  );
}
