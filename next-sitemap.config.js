const path = require('path');
const {
  isDraftBlog,
  isDraftProject,
  getPublishedBlogSlugs,
  getPublishedProjectSlugs,
} = require('./scripts/cms-sitemap-helper.cjs');

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in",
  generateRobotsTxt: true,
  generateIndexSitemap: false, // Generate single sitemap file instead of index
  sitemapSize: 5000,
  
  // Exclude admin routes and API routes
  exclude: [
    '/admin/*',
    '/api/*',
    '/blog/add',
    '/blog/db/*',
  ],
  
  // Transform function to set priorities and changefreq dynamically
  transform: async (config, path) => {
    if (path.startsWith('/blog/') && !path.includes('/add') && !path.includes('/db/') && !path.includes('/author/')) {
      const blogSlug = path.split('/blog/')[1]?.split('/')[0];
      if (blogSlug && isDraftBlog(blogSlug) !== false) {
        return null;
      }
    }

    if (path.startsWith('/projects/')) {
      const projectSlug = path.split('/projects/')[1]?.split('/')[0];
      if (projectSlug && isDraftProject(projectSlug) === true) {
        return null;
      }
    }
    
    // Default values
    let priority = 0.7;
    let changefreq = 'daily';
    const now = new Date().toISOString();
    
    // Homepage - highest priority
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    }
    // Main category pages - high priority
    else if (['/blog', '/projects', '/company', '/solar-panel-cleaning-system', '/contact'].includes(path)) {
      priority = 0.9;
      changefreq = 'daily';
    }
    // Product/service pages - high priority
    else if (path.startsWith('/solar-panel-cleaning-system/')) {
      priority = 0.9;
      changefreq = 'weekly';
    }
    // Project pages - high priority
    else if (path.startsWith('/projects/')) {
      priority = 0.8;
      changefreq = 'monthly';
    }
    // Blog posts - medium-high priority
    else if (path.startsWith('/blog/') && !path.includes('/add') && !path.includes('/db/')) {
      priority = 0.8;
      changefreq = 'weekly';
    }
    // Important utility pages
    else if (['/solar-panel-cleaning-robot-price-calculator', '/cleaning-technology'].includes(path)) {
      priority = 0.8;
      changefreq = 'monthly';
    }
    // Supporting pages
    else if (['/privacy-policy', '/sitemap'].includes(path)) {
      priority = 0.5;
      changefreq = 'monthly';
    }
    // Contact sub-pages
    else if (path.startsWith('/contact/')) {
      priority = 0.7;
      changefreq = 'monthly';
    }
    
    return {
      loc: path,
      changefreq,
      priority,
      lastmod: now,
    };
  },
  
  // Additional paths to include (if needed)
  additionalPaths: async (config) => {
    const result = [];
    const siteUrl = config.siteUrl;

    for (const slug of getPublishedBlogSlugs()) {
      result.push({
        loc: `/blog/${slug}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      });
    }
    for (const slug of getPublishedProjectSlugs()) {
      result.push({
        loc: `/projects/${slug}`,
        changefreq: 'monthly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      });
    }

    return result;
  },
  
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/blog/add', '/blog/db/'],
      },
    ],
    additionalSitemaps: [
      // Add any additional sitemaps if needed
    ],
  },
};