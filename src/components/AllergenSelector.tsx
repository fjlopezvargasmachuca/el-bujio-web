import { ALLERGENS } from "@/lib/allergens";

export function AllergenSelector({ selected = [] }: { selected?: string[] }) {
  const selectedSet = new Set(selected);
  return (
    <div className="allergen-selector">
      {ALLERGENS.map((allergen) => (
        <label className="allergen-option" key={allergen.value}>
          <input
            type="checkbox"
            name="allergens"
            value={allergen.value}
            defaultChecked={selectedSet.has(allergen.value)}
          />
          <span>{allergen.label}</span>
        </label>
      ))}
    </div>
  );
}
