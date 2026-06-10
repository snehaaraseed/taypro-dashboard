export type RecoveryReason =
  | "alias"
  | "normalization"
  | "prefix"
  | "fuzzy"
  | "static-fuzzy";

export type RecoveryResult =
  | {
      kind: "redirect";
      destination: string;
      reason: RecoveryReason;
      score: number;
    }
  | {
      kind: "suggest";
      destination: string;
      reason: RecoveryReason;
      score: number;
    }
  | { kind: "none" };
