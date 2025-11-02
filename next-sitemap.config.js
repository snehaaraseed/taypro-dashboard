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
    const fs = require('fs').promises;
    const pathModule = require('path');
    
    // Check if this is a blog or project route that might be a draft
    if (path.startsWith('/blog/') && !path.includes('/add') && !path.includes('/db/')) {
      try {
        const blogSlug = path.split('/blog/')[1];
        const blogDir = pathModule.join(process.cwd(), 'src', 'app', 'blog', blogSlug);
        const metadataPath = pathModule.join(blogDir, 'metadata.json');
        
        try {
          const metadataContent = await fs.readFile(metadataPath, 'utf-8');
          const metadata = JSON.parse(metadataContent);
          
          // Exclude drafts from sitemap
          if (metadata.published === false) {
            return null;
          }
        } catch (error) {
          // If metadata doesn't exist or can't be read, skip this route
          return null;
        }
      } catch (error) {
        // If path parsing fails, include it (might be database blog)
      }
    }
    
    // Check if this is a project route that might be a draft
    if (path.startsWith('/projects/')) {
      try {
        const projectSlug = path.split('/projects/')[1];
        const projectDir = pathModule.join(process.cwd(), 'src', 'app', 'projects', projectSlug);
        const metadataPath = pathModule.join(projectDir, 'metadata.json');
        
        try {
          const metadataContent = await fs.readFile(metadataPath, 'utf-8');
          const metadata = JSON.parse(metadataContent);
          
          // Exclude drafts from sitemap
          if (metadata.published === false) {
            return null;
          }
        } catch (error) {
          // If metadata doesn't exist or can't be read, skip this route
          return null;
        }
      } catch (error) {
        // If path parsing fails, include it
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
    
    // You can add dynamic routes here if needed
    // For example, if you have dynamic blog posts that aren't statically generated
    
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