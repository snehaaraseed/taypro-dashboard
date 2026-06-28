import { sqliteTable, text, integer, unique } from "drizzle-orm/sqlite-core";

export const authors = sqliteTable("authors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  bio: text("bio").notNull(),
  avatarUrl: text("avatar_url"),
  linkedInUrl: text("linkedin_url"),
  /** JSON array of BlogAuthorExpertiseTag ids for automation matching */
  expertiseTags: text("expertise_tags").notNull().default("[]"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const blogs = sqliteTable(
  "blogs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    locale: text("locale").notNull().default("en"),
    title: text("title").notNull(),
    description: text("description").notNull(),
    featuredImage: text("featured_image").notNull().default(""),
    featuredImageAlt: text("featured_image_alt").notNull().default(""),
    author: text("author").notNull().default("Taypro Team"),
    content: text("content").notNull().default(""),
    faqs: text("faqs").notNull().default("[]"),
    /** Primary SEO target keyword (automation + metadata). */
    seoKeyword: text("seo_keyword"),
    publishDate: text("publish_date").notNull(),
    /** When set, English draft auto-publishes at this UTC ISO time (cron). */
    scheduledPublishAt: text("scheduled_publish_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at"),
    published: integer("published", { mode: "boolean" }).notNull().default(true),
  },
  (table) => ({
    slugLocale: unique().on(table.slug, table.locale),
  })
);

export const projects = sqliteTable(
  "projects",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    locale: text("locale").notNull().default("en"),
    title: text("title").notNull(),
    description: text("description").notNull(),
    image: text("image").notNull(),
    imageAlt: text("image_alt").notNull().default(""),
    details: text("details").notNull().default("[]"),
    content: text("content").notNull().default(""),
    author: text("author").notNull().default("Taypro Team"),
    /** Immutable star codename (English row is canonical; copied to locale rows). */
    codename: text("codename"),
    /** Authoritative site facts JSON for stats table and AI prompts. */
    factsJson: text("facts_json"),
    /** Narrative sections JSON (executive summary + H2 bodies). */
    sectionsJson: text("sections_json"),
    editorialStatus: text("editorial_status").notNull().default("legacy"),
    seoKeyword: text("seo_keyword"),
    date: text("date").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at"),
    published: integer("published", { mode: "boolean" }).notNull().default(true),
  },
  (table) => ({
    slugLocale: unique().on(table.slug, table.locale),
  })
);

export const publishedTopics = sqliteTable("published_topics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  publishDate: text("publish_date").notNull(),
  category: text("category"),
  h2Outline: text("h2_outline"),
  contentFingerprint: text("content_fingerprint"),
  wordCountTier: text("word_count_tier"),
  createdAt: text("created_at").notNull(),
});

/** Image files stay on disk; this table indexes paths for the admin gallery. */
export const uploads = sqliteTable("uploads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  url: text("url").notNull().unique(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  mimeType: text("mime_type"),
  size: integer("size").notNull(),
  uploadedAt: text("uploaded_at").notNull(),
});

/** Pending CMS locale translations (auto-resume after Gemini quota / transient errors). */
export const translationQueue = sqliteTable(
  "translation_queue",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    contentType: text("content_type").notNull(),
    slug: text("slug").notNull(),
    locale: text("locale").notNull(),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    nextRetryAt: text("next_retry_at").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => ({
    contentSlugLocale: unique().on(table.contentType, table.slug, table.locale),
  })
);

export const insights = sqliteTable(
  "insights",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    locale: text("locale").notNull().default("en"),
    title: text("title").notNull(),
    description: text("description").notNull(),
    content: text("content").notNull().default(""),
    /** category_pulse | playbook | index | mini_study */
    reportType: text("report_type").notNull().default("category_pulse"),
    /** YYYY-MM: one category pulse per calendar month */
    period: text("period"),
    /** Source-of-truth metrics bundle (JSON) */
    metricsJson: text("metrics_json").notNull().default("{}"),
    publishDate: text("publish_date").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at"),
    published: integer("published", { mode: "boolean" }).notNull().default(true),
  },
  (table) => ({
    slugLocale: unique().on(table.slug, table.locale),
  })
);

export type TranslationQueueRow = typeof translationQueue.$inferSelect;

export type AuthorRow = typeof authors.$inferSelect;
export type BlogRow = typeof blogs.$inferSelect;
export type ProjectRow = typeof projects.$inferSelect;
export type PublishedTopicRow = typeof publishedTopics.$inferSelect;
export type UploadRow = typeof uploads.$inferSelect;
export type InsightRow = typeof insights.$inferSelect;

export const pressReleases = sqliteTable(
  "press_releases",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    locale: text("locale").notNull().default("en"),
    title: text("title").notNull(),
    subhead: text("subhead").notNull().default(""),
    dateline: text("dateline").notNull().default(""),
    content: text("content").notNull().default(""),
    boilerplate: text("boilerplate").notNull().default(""),
    contactJson: text("contact_json").notNull().default("{}"),
    quotesJson: text("quotes_json").notNull().default("[]"),
    featuredImage: text("featured_image").notNull().default(""),
    /** draft | ready | published */
    status: text("status").notNull().default("draft"),
    /** queue | project | insight | manual */
    source: text("source").notNull().default("queue"),
    queueKey: text("queue_key"),
    publishDate: text("publish_date").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at"),
    published: integer("published", { mode: "boolean" }).notNull().default(false),
  },
  (table) => ({
    slugLocale: unique().on(table.slug, table.locale),
  })
);

export const pressSubmissions = sqliteTable(
  "press_submissions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    releaseSlug: text("release_slug").notNull(),
    targetId: text("target_id").notNull(),
    /** pending | submitted | live | rejected */
    status: text("status").notNull().default("pending"),
    externalUrl: text("external_url"),
    /** dofollow | nofollow | none | unknown */
    backlinkType: text("backlink_type").notNull().default("unknown"),
    submittedAt: text("submitted_at"),
    notes: text("notes").notNull().default(""),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at"),
  },
  (table) => ({
    releaseTarget: unique().on(table.releaseSlug, table.targetId),
  })
);

export type PressReleaseRow = typeof pressReleases.$inferSelect;
export type PressSubmissionRow = typeof pressSubmissions.$inferSelect;
