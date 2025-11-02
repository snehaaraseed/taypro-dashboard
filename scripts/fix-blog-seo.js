#!/usr/bin/env node

/**
 * Script to fix SEO metadata for all blog pages:
 * 1. Replace yourdomain.com with taypro.in
 * 2. Enhance keywords with "Solar Panel Cleaning Robot"
 * 3. Add canonical URLs, Twitter Cards, and better Open Graph metadata
 */

const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '../src/app/blog');
const siteUrl = 'https://taypro.in';

// Generic enhanced keywords that can be used for most blogs
const getEnhancedKeywords = (title, description) => {
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();
  
  const baseKeywords = [
    'Solar Panel Cleaning Robot',
    'solar panel cleaning',
    'solar panel maintenance',
    'solar energy',
    'Taypro',
  ];
  
  // Add specific keywords based on content
  if (titleLower.includes('robot') || descLower.includes('robot')) {
    baseKeywords.unshift(
      'solar panel cleaning robot',
      'automatic solar panel cleaning robot',
      'robotic solar panel cleaning',
      'solar cleaning robot'
    );
  }
  
  if (titleLower.includes('cleaning') || descLower.includes('cleaning')) {
    baseKeywords.splice(1, 0, 
      'solar panel cleaning best practices',
      'solar cleaning solutions'
    );
  }
  
  if (titleLower.includes('maintenance') || descLower.includes('maintenance')) {
    baseKeywords.splice(2, 0,
      'solar panel maintenance tips',
      'solar farm maintenance'
    );
  }
  
  return baseKeywords;
};

function fixBlogMetadata(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it needs fixing
    if (!content.includes('yourdomain.com') && content.includes('canonical')) {
      console.log(`✓ Already fixed: ${path.basename(path.dirname(filePath))}`);
      return false;
    }
    
    // Extract existing metadata
    const metadataMatch = content.match(/export const metadata: Metadata = \{([\s\S]*?)\};/);
    if (!metadataMatch) {
      console.log(`⚠ No metadata found in: ${path.basename(path.dirname(filePath))}`);
      return false;
    }
    
    const oldMetadata = metadataMatch[0];
    
    // Extract title and description
    const titleMatch = oldMetadata.match(/title:\s*"([^"]+)"/);
    const descMatch = oldMetadata.match(/description:\s*"([^"]+)/);
    const urlMatch = oldMetadata.match(/url:\s*`([^`]+)`/);
    
    if (!titleMatch || !descMatch) {
      console.log(`⚠ Missing title/description in: ${path.basename(path.dirname(filePath))}`);
      return false;
    }
    
    const title = titleMatch[1];
    const description = descMatch[1].replace(/\\n/g, ' ').trim();
    const slug = path.basename(path.dirname(filePath));
    
    // Extract image if exists
    let imagePath = '/tayproasset/taypro-robotImage.png'; // default
    const imageMatch = oldMetadata.match(/images:\s*\[\s*"([^"]+)"/);
    if (imageMatch) {
      imagePath = imageMatch[1];
    }
    
    // Generate enhanced keywords
    const keywords = getEnhancedKeywords(title, description);
    
    // Build new metadata
    const newMetadata = `const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "${siteUrl}";

export const metadata: Metadata = {
  title: "${title.replace(/"/g, '\\"')}",
  description: "${description.replace(/"/g, '\\"')} Learn more about Solar Panel Cleaning Robot solutions and best practices.",
  keywords: ${JSON.stringify(keywords, null, 2).split('\n').map((line, i) => i === 0 ? line : '    ' + line).join('\n')},
  openGraph: {
    title: "${title.replace(/"/g, '\\"')}",
    description: "${description.replace(/"/g, '\\"')}",
    url: \`\${siteUrl}/blog/${slug}\`,
    type: "article",
    images: [
      {
        url: \`\${siteUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}\`,
        width: 1200,
        height: 630,
        alt: "${title.replace(/"/g, '\\"')}",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "${title.replace(/"/g, '\\"')}",
    description: "${description.substring(0, 200).replace(/"/g, '\\"')}",
    images: [\`\${siteUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}\`],
  },
  alternates: {
    canonical: \`\${siteUrl}/blog/${slug}\`,
  },
};`;
    
    // Replace metadata in content
    content = content.replace(/export const metadata: Metadata = \{[\s\S]*?\};/, newMetadata);
    
    // Remove old siteUrl if it exists separately
    content = content.replace(/const siteUrl = [^;]+;\n\n?/g, '');
    
    // Ensure siteUrl is at the top if not already there
    if (!content.includes('const siteUrl')) {
      // Add after last import
      const importEnd = content.lastIndexOf("import");
      const importLineEnd = content.indexOf('\n', importEnd);
      if (importLineEnd > -1) {
        content = content.slice(0, importLineEnd + 1) + 
                 `\nconst siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "${siteUrl}";\n` +
                 content.slice(importLineEnd + 1);
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed: ${slug}`);
    return true;
  } catch (error) {
    console.error(`✗ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Find all blog page.tsx files
function findBlogPages(dir) {
  const files = [];
  
  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory() && 
          !['components', 'api', '[slug]', 'add', 'db'].includes(entry.name)) {
        const pagePath = path.join(fullPath, 'page.tsx');
        if (fs.existsSync(pagePath)) {
          files.push(pagePath);
        }
      }
    }
  }
  
  walk(dir);
  return files;
}

// Main execution
console.log('Starting blog SEO fixes...\n');
const blogFiles = findBlogPages(blogDir);
let fixedCount = 0;

blogFiles.forEach(file => {
  if (fixBlogMetadata(file)) {
    fixedCount++;
  }
});

console.log(`\n✓ Fixed ${fixedCount} of ${blogFiles.length} blog pages.`);

