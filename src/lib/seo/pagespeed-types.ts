export type PagespeedStrategy = "mobile" | "desktop";

export type PagespeedAuditScope = "english" | "full";

export type PagespeedOpportunity = {
  id: string;
  title: string;
  savingsMs: number;
};

export type PagespeedPageRow = {
  url: string;
  pathname: string;
  template: string;
  mobileScore: number | null;
  previousMobileScore?: number;
  scoreDelta?: number;
  lcp: string;
  lcpMs: number | null;
  cls: string;
  tbt: string;
  speedIndex: string;
  cruxCategory?: string;
  gscImpressions: number;
  gscClicks: number;
  impactScore: number;
  topOpportunities: PagespeedOpportunity[];
  error?: string;
  reportFile?: string;
};

export type PagespeedFixCluster = {
  auditId: string;
  title: string;
  pagesAffected: number;
  totalSavingsMs: number;
  sampleUrl: string;
};

export type PagespeedTemplateGroup = {
  template: string;
  pageCount: number;
  medianScore: number;
  worstUrl: string;
  worstScore: number;
};

export type PagespeedAuditSummary = {
  runId: string;
  updatedAt: string;
  scope: {
    strategy: PagespeedStrategy;
    auditScope: PagespeedAuditScope;
    urlCount: number;
  };
  previousRunId?: string;
  siteMedianScore: number;
  scoreDelta?: number;
  pagesBelow50: number;
  pagesBelow70: number;
  priorityQueue: PagespeedPageRow[];
  fixClusters: PagespeedFixCluster[];
  templateGroups: PagespeedTemplateGroup[];
  allPages: PagespeedPageRow[];
};

export type PagespeedAuditStatus = {
  configured: boolean;
  inProgress: boolean;
  lastRunAt: string | null;
  lastRunId: string | null;
  urlCount: number | null;
  summaryPath: string;
};

export type PagespeedAuditResult = {
  ok: true;
  summary: PagespeedAuditSummary;
  summaryPath: string;
  pagesAudited: number;
  pagesFailed: number;
  durationMs: number;
};

export type ParsedPsiResult = {
  mobileScore: number | null;
  lcp: string;
  lcpMs: number | null;
  cls: string;
  tbt: string;
  speedIndex: string;
  cruxCategory?: string;
  opportunities: PagespeedOpportunity[];
  raw: unknown;
};
