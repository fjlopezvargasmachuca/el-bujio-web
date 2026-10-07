export const ALLERGENS = [
  { value: "Gluten", label: "Gluten (trigo, centeno, cebada, avena)" },
  { value: "Crustáceos", label: "Crustáceos" },
  { value: "Huevos", label: "Huevos" },
  { value: "Pescado", label: "Pescado" },
  { value: "Cacahuetes", label: "Cacahuetes" },
  { value: "Soja", label: "Soja" },
  { value: "Leche", label: "Leche" },
  { value: "Frutos de cáscara", label: "Frutos de cáscara" },
  { value: "Apio", label: "Apio" },
  { value: "Mostaza", label: "Mostaza" },
  { value: "Sésamo", label: "Sésamo" },
  { value: "Sulfitos", label: "Dióxido de azufre y sulfitos" },
  { value: "Altramuces", label: "Altramuces" },
  { value: "Moluscos", label: "Moluscos" },
] as const;

export type AllergenValue = (typeof ALLERGENS)[number]["value"];

export function sanitizeAllergens(values: FormDataEntryValue[]) {
  const allowed = new Set<string>(ALLERGENS.map((item) => item.value));
  return values.map(String).filter((value) => allowed.has(value));
}
