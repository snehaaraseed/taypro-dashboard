import { DynamicBlog } from "../api/blog/list/route";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { AnimateOnScroll } from "../components/AnimateOnScroll";
import BlogList from "./BlogList";
import { promises as fs } from "fs";
import path from "path";

const breadcrumbs = [
  { name: "Home", href: "/" },
  {
    name: "Blogs",
    href: "",
  },
];

async function getFileBlogs(): Promise<DynamicBlog[]> {
  try {
    const blogDir = path.join(process.cwd(), "src", "app", "blog");
    const entries = await fs.readdir(blogDir, { withFileTypes: true });

    const blogDirs = entries.filter(
      (entry) =>
        entry.isDirectory() &&
        !["components", "api", "[slug]", "add", "db"].includes(entry.name)
    );

    const blogs: DynamicBlog[] = [];

    for (const dir of blogDirs) {
      try {
        const metadataPath = path.join(blogDir, dir.name, "metadata.json");
        const metadataContent = await fs.readFile(metadataPath, "utf-8");
        const metadata = JSON.parse(metadataContent);

        // Filter out drafts (only show published blogs, defaulting to true)
        if (metadata.published === false) {
          continue;
        }

        blogs.push({
          ...metadata,
          href: `/blog/${dir.name}`,
          source: "file",
        });
      } catch (error) {
        console.warn(`No metadata found for blog: ${dir.name}`);
      }
    }

    return blogs.sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
  } catch (error) {
    console.error("Error fetching file blogs:", error);
    return [];
  }
}

export default async function Blog() {
  // Fetch blogs on the server side (no loader needed!)
  const dynamicBlogs = await getFileBlogs();

  const allBlogs = dynamicBlogs.map((blog) => ({
    title: blog.title,
    // Ensure imgSrc is null if missing to avoid passing empty string to <Image />
    imgSrc:
      blog.featuredImage && blog.featuredImage.trim() !== ""
        ? blog.featuredImage
        : null,
    date: new Date(blog.publishDate).toLocaleDateString(),
    href: blog.href,
    slug: blog.slug,
  }));

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <section className="w-full min-h-100 pt-20 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-start">
          <AnimateOnScroll animation="fadeInUp" className="mb-8">
            <h1 className="text-[#052638] text-4xl">Blogs</h1>
          </AnimateOnScroll>

          {allBlogs.length === 0 ? (
            <div className="text-center flex justify-center align-center text-xl">
              <span className="bg-red-400 text-white px-4 py-2 rounded-full">
                No Blogs Found
              </span>
            </div>
          ) : (
            <BlogList blogs={allBlogs} />
          )}
        </div>
      </section>
    </>
  );
}
