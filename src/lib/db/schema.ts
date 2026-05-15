import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

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

export const blogs = sqliteTable("blogs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  featuredImage: text("featured_image").notNull().default(""),
  author: text("author").notNull().default("Taypro Team"),
  content: text("content").notNull().default(""),
  publishDate: text("publish_date").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at"),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
});

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  details: text("details").notNull().default("[]"),
  content: text("content").notNull().default(""),
  date: text("date").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at"),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
});

export type AuthorRow = typeof authors.$inferSelect;
export type BlogRow = typeof blogs.$inferSelect;
export type ProjectRow = typeof projects.$inferSelect;
