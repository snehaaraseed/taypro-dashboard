import { sqliteTable, text, integer, unique } from "drizzle-orm/sqlite-core";

export const authors = sqliteTable("authors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  bio: text("bio").notNull(),
  avatarUrl: text("avatar_url"),
  linkedInUrl: text("linkedin_url"),
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
    publishDate: text("publish_date").notNull(),
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

export type AuthorRow = typeof authors.$inferSelect;
export type BlogRow = typeof blogs.$inferSelect;
export type ProjectRow = typeof projects.$inferSelect;
export type PublishedTopicRow = typeof publishedTopics.$inferSelect;
export type UploadRow = typeof uploads.$inferSelect;
