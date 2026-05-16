import { readFileSync } from "fs";
import { join } from "path";

const generatedPath = join(
  import.meta.dirname,
  "product-page-full-translations.generated.json"
);

export const fullPagePacks = JSON.parse(readFileSync(generatedPath, "utf8"));
