import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ALLERGENS } from "@/lib/allergens";
import { categoryLabel } from "@/lib/format";

export const metadata: Metadata = { title: "Carta de alérgenos" };
export const dynamic = "force-dynamic";

const categoryOrder = ["ENTRANTES", "PESCADO", "CARNES", "BOCADILLOS", "POSTRES", "OTROS"];

export default async function AllergenChartPage() {
  const items = await prisma.menuItem.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div className="page">
      <div className="eyebrow">Información alimentaria</div>
      <h1 style={{ fontSize: "clamp(3rem,7vw,5.5rem)" }}>Carta de alérgenos</h1>
      <p className="muted allergen-intro">
        Una X indica que el plato tiene registrado ese alérgeno. Si tienes una alergia o intolerancia,
        comunícalo al personal antes de pedir para poder confirmar la elaboración y posibles trazas.
      </p>

      <div className="allergen-actions">
        <a className="button primary" href="/api/alergenos/pdf">Descargar carta de alérgenos (PDF)</a>
        <span className="muted">El PDF se genera automáticamente con la carta publicada en ese momento.</span>
      </div>

      <div className="allergen-desktop-chart">
        <div className="allergen-scroll-hint" aria-hidden="true">
          <span>↔</span>
          <span>En ordenador puedes desplazarte horizontalmente para consultar todas las columnas.</span>
        </div>

        <div className="allergen-table-wrap" tabIndex={0} aria-label="Tabla desplazable de alérgenos">
          <table className="allergen-table">
            <thead>
              <tr>
                <th className="dish-column" scope="col">Plato</th>
                {ALLERGENS.map((allergen) => (
                  <th key={allergen.value} title={allergen.label} scope="col">
                    <span>{allergen.value}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categoryOrder.map((category) => {
                const categoryItems = items.filter((item) => item.category === category);
                if (!categoryItems.length) return null;
                return [
                  <tr className="allergen-category-row" key={`${category}-heading`}>
                    <th className="allergen-category-name" scope="rowgroup">{categoryLabel(category)}</th>
                    <td className="allergen-category-fill" colSpan={ALLERGENS.length} aria-hidden="true" />
                  </tr>,
                  ...categoryItems.map((item) => {
                    const set = new Set(item.allergens);
                    return (
                      <tr key={item.id}>
                        <th className="dish-name" scope="row">{item.name}</th>
                        {ALLERGENS.map((allergen) => (
                          <td key={allergen.value} aria-label={set.has(allergen.value) ? `Contiene ${allergen.value}` : `No registrado: ${allergen.value}`}>
                            {set.has(allergen.value) ? <span className="allergen-x">X</span> : <span className="allergen-empty">·</span>}
                          </td>
                        ))}
                      </tr>
                    );
                  }),
                ];
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="allergen-mobile-list" aria-label="Listado de alérgenos por plato">
        <div className="status-box warning mobile-allergen-note">
          En móvil mostramos los alérgenos por plato para que no tengas que mover una tabla muy ancha. Si prefieres la matriz completa, descarga el PDF.
        </div>
        {categoryOrder.map((category) => {
          const categoryItems = items.filter((item) => item.category === category);
          if (!categoryItems.length) return null;
          return (
            <section className="allergen-mobile-category" key={category}>
              <h2>{categoryLabel(category)}</h2>
              <div className="allergen-mobile-cards">
                {categoryItems.map((item) => (
                  <article className="allergen-mobile-card" key={item.id}>
                    <h3>{item.name}</h3>
                    {item.allergens.length ? (
                      <div className="tag-row">
                        {item.allergens.map((allergen) => <span className="tag allergen" key={allergen}>{allergen}</span>)}
                      </div>
                    ) : (
                      <p className="muted">No hay alérgenos registrados.</p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="row-actions" style={{ marginTop: 24 }}>
        <Link className="button" href="/carta">← Volver a la carta</Link>
      </div>
    </div>
  );
}
