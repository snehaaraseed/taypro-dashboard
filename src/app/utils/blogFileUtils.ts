/**
 * Blog CMS — backed by SQLite (see src/lib/cms/blogService.ts).
 * Types and function names kept for existing admin API imports.
 */

export type { BlogFaqItem } from "@/lib/cms/blog-faqs";

export interface BlogMetadata {
  title: string;
  description: string;
  featuredImage: string;
  featuredImageAlt?: string;
  author: string;
  slug: string;
  publishDate: string;
  createdAt: string;
  updatedAt?: string;
  published?: boolean;
  faqs?: import("@/lib/cms/blog-faqs").BlogFaqItem[];
}

export interface BlogData {
  title: string;
  description: string;
  featuredImage: string;
  featuredImageAlt?: string;
  author: string;
  content: string;
  publishDate?: string;
  published?: boolean;
  faqs?: import("@/lib/cms/blog-faqs").BlogFaqItem[];
}

export {
  createSlug,
  createBlog as createBlogFiles,
  updateBlog as updateBlogFiles,
  deleteBlog as deleteBlogFiles,
  readBlogMetadata,
  readBlogContent,
} from "@/lib/cms/blogService";
