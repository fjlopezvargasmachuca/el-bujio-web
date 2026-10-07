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

      <div className="allergen-table-wrap">
        <table className="allergen-table">
          <thead>
            <tr>
              <th className="dish-column">Plato</th>
              {ALLERGENS.map((allergen) => (
                <th key={allergen.value} title={allergen.label}><span>{allergen.value}</span></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categoryOrder.map((category) => {
              const categoryItems = items.filter((item) => item.category === category);
              if (!categoryItems.length) return null;
              return [
                <tr className="allergen-category-row" key={`${category}-heading`}>
                  <th colSpan={ALLERGENS.length + 1}>{categoryLabel(category)}</th>
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

      <div className="row-actions" style={{ marginTop: 24 }}>
        <Link className="button" href="/carta">← Volver a la carta</Link>
      </div>
    </div>
  );
}
