import * as cheerio from "cheerio";

export interface ScrapedBlogContent {
  title: string;
  content: string;
  publishDate: string;
  author: string;
  description: string;
  featuredImage: string | null;
  originalUrl: string;
  error?: string;
}

export async function scrapeBlogContent(
  url: string
): Promise<ScrapedBlogContent> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // blog content
    const title =
      $("h1").first().text().trim() ||
      $(".entry-title").text().trim() ||
      $("title").text().trim();

    let cleanContent =
      $("article").html() ||
      $(".entry-content").html() ||
      $(".post-content").html() ||
      $("main").html() ||
      "";
    const $content = cheerio.load(cleanContent);
    $content("h1").remove(); // Remove all H1 tags

    // Convert H2 to H3, H3 to H4, etc. to maintain hierarchy
    $content("h2").each((i, el) => {
      $content(el).replaceWith(`<h3>${$content(el).html()}</h3>`);
    });
    $content("h3").each((i, el) => {
      $content(el).replaceWith(`<h4>${$content(el).html()}</h4>`);
    });

    cleanContent = $content.html() || "";

    const publishDate =
      $(".entry-date").text().trim() ||
      $("time").attr("datetime") ||
      $(".post-date").text().trim() ||
      new Date().toISOString();

    const author =
      $(".author").text().trim() ||
      $(".entry-author").text().trim() ||
      "Taypro Team";

    const description =
      $('meta[name="description"]').attr("content") ||
      $(".entry-summary").text().trim() ||
      $("p").first().text().trim().substring(0, 160) ||
      "";

    const featuredImage =
      $(".featured-image img").attr("src") ||
      $("article img").first().attr("src") ||
      $(".post-thumbnail img").attr("src");

    return {
      title,
      content: cleanContent,
      publishDate,
      author,
      description,
      featuredImage: featuredImage
        ? featuredImage.startsWith("http")
          ? featuredImage
          : `https://taypro.in${featuredImage}`
        : null,
      originalUrl: url,
    };
  } catch (error) {
    console.error("Error scraping blog content:", error);
    return {
      title: "Content Not Available",
      content: "<p>Sorry, this content could not be loaded at the moment.</p>",
      publishDate: new Date().toISOString(),
      author: "Taypro Team",
      description: "Blog content unavailable",
      featuredImage: null,
      originalUrl: url,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
