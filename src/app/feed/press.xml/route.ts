import { NextResponse } from "next/server";
import { listPublishedPressReleases } from "@/lib/cms/pressReleaseService";
import { PRESS_RELEASES_PATH } from "@/lib/press/press-export";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import { SOURCE_LOCALE } from "@/lib/translation/config";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const releases = await listPublishedPressReleases(SOURCE_LOCALE);
  const channelTitle = "Taypro Press Releases";
  const channelLink = `${SITE_URL}/press`;
  const feedLink = `${SITE_URL}/feed/press.xml`;

  const items = releases
    .map((r) => {
      const link = `${SITE_URL}${PRESS_RELEASES_PATH}/${r.slug}`;
      const pubDate = new Date(r.publishDate).toUTCString();
      return `    <item>
      <title>${escapeXml(r.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(r.subhead)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${escapeXml(channelLink)}</link>
    <description>Official press releases from Taypro — robotic solar panel cleaning in India.</description>
    <language>en-in</language>
    <atom:link href="${escapeXml(feedLink)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

export const revalidate = 3600;
