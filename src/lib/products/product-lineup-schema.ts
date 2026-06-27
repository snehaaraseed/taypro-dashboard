export type ProductLineupSchemaKey =
  | "helyx"
  | "glyde"
  | "nyuma"
  | "glydeX"
  | "nyumaX"
  | "tayproOpex"
  | "nectyr"
  | "miny"
  | "cradyl"
  | "orion";

const MODEL_TO_SCHEMA_KEY: Record<string, ProductLineupSchemaKey> = {
  HELYX: "helyx",
  GLYDE: "glyde",
  NYUMA: "nyuma",
  "GLYDE-X": "glydeX",
  "NYUMA-X": "nyumaX",
  Opex: "tayproOpex",
  NECTYR: "nectyr",
  MINY: "miny",
  CRADYL: "cradyl",
  ORION: "orion",
};

export function productToSchemaKey(model: string): ProductLineupSchemaKey {
  const key = MODEL_TO_SCHEMA_KEY[model];
  if (!key) {
    throw new Error(`Unknown robot model for schema i18n key: ${model}`);
  }
  return key;
}
