import "server-only";

import type { StructuralArchetype } from "@/lib/seo/structural-archetypes";
import { classifyStructuralArchetype } from "@/lib/seo/corpus-index";

export type {
  AngleContractMeta,
  BlogWordCountTier,
  StructuralArchetype,
} from "@/lib/seo/angle-contract-data";

export {
  ANGLE_ARCHETYPE_BY_ID,
  ANGLE_CONTRACT_BY_ID,
  buildSyntheticMetaDescription,
  getAngleContractMeta,
  getWordCountTierForAngle,
} from "@/lib/seo/angle-contract-data";

export function titleMatchesForbiddenArchetype(
  title: string,
  forbidden: StructuralArchetype[]
): boolean {
  const archetype = classifyStructuralArchetype({ title });
  return forbidden.includes(archetype);
}
