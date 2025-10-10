/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  generateRobotsTxt: true, // ✅ auto-create robots.txt
  generateIndexSitemap: true,
  changefreq: "daily",
  priority: 0.7,
  sitemapSize: 5000,
};
