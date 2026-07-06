import "server-only";
import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import { SOURCE_LOCALE } from "@/lib/translation/config";
import { listAllBlogs } from "@/lib/cms/blogService";
import type { BlogMetadata } from "@/app/utils/blogFileUtils";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const blogs: BlogMetadata[] = await listAllBlogs(false, SOURCE_LOCALE);

  const channelTitle = "Taypro Blog — Solar Panel Cleaning Insights";
  const channelLink = `${SITE_URL}/blog`;
  const feedLink = `${SITE_URL}/feed/blog.xml`;
  const channelDescription =
    "Expert guides, O&M insights, and technical articles on solar panel cleaning robots, efficiency, and operations from Taypro.";

  const items = blogs
    .slice(0, 50) // RSS readers rarely need more than 50
    .map((post: BlogMetadata) => {
      const link = `${SITE_URL}/blog/${post.slug}`;
      const pubDate = new Date(
        post.publishDate ?? Date.now()
      ).toUTCString();
      const title = escapeXml(post.title ?? "");
      const description = escapeXml(post.description ?? "");
      const author = escapeXml(post.author ?? "Taypro Team");

      const imageUrl = post.featuredImage
        ? post.featuredImage.startsWith("http")
          ? post.featuredImage
          : `${SITE_URL}${post.featuredImage}`
        : null;

      const enclosure = imageUrl
        ? `\n      <enclosure url="${escapeXml(imageUrl)}" type="image/jpeg" length="0"/>`
        : "";

      return `    <item>
      <title>${title}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
      <author>${author}</author>${enclosure}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${escapeXml(channelLink)}</link>
    <description>${escapeXml(channelDescription)}</description>
    <language>en-in</language>
    <copyright>© ${new Date().getFullYear()} Taypro Technologies Pvt. Ltd.</copyright>
    <managingEditor>contact@taypro.in (Taypro)</managingEditor>
    <webMaster>contact@taypro.in (Taypro)</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(feedLink)}" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/tayproasset/taypro-favicon.png</url>
      <title>${escapeXml(channelTitle)}</title>
      <link>${escapeXml(channelLink)}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

export const revalidate = 3600;
