/** Shared helpers for hand-authored locale packs (hi, ar, ja, bn). */
export function T(hi, ar, ja, bn) {
  return { hi, ar, ja, bn };
}

/** Per-locale string arrays (e.g. meta keywords). */
export function TArray(hi, ar, ja, bn) {
  return { hi, ar, ja, bn };
}

export function deepMerge(target, source) {
  for (const [k, v] of Object.entries(source)) {
    if (
      v &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      target[k] &&
      typeof target[k] === "object" &&
      !Array.isArray(target[k])
    ) {
      deepMerge(target[k], v);
    } else {
      target[k] = v;
    }
  }
  return target;
}

export function resolvePack(node, locale) {
  if (!node || typeof node !== "object") return node;
  if (
    Array.isArray(node.hi) &&
    Array.isArray(node.ar) &&
    Array.isArray(node.ja) &&
    Array.isArray(node.bn)
  ) {
    return node[locale];
  }
  if (
    typeof node.hi === "string" &&
    typeof node.ar === "string" &&
    typeof node.ja === "string" &&
    typeof node.bn === "string"
  ) {
    return node[locale];
  }
  const out = Array.isArray(node) ? [] : {};
  for (const [k, v] of Object.entries(node)) {
    out[k] = resolvePack(v, locale);
  }
  return out;
}
