/**
 * Blog CMS — backed by SQLite (see src/lib/cms/blogService.ts).
 * Types and function names kept for existing admin API imports.
 */

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
}

export {
  createSlug,
  createBlog as createBlogFiles,
  updateBlog as updateBlogFiles,
  deleteBlog as deleteBlogFiles,
  readBlogMetadata,
  readBlogContent,
} from "@/lib/cms/blogService";
