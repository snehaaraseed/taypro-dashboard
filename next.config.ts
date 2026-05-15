/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Enable static page generation for better performance
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["lucide-react", "@tiptap/react"],
    outputFileTracingIncludes: {
      "/*": [
        "./node_modules/sharp/**/*",
        "./node_modules/@img/**/*",
        "./public/**/*",
      ],
    },
  },
  // Turbopack configuration (Next.js 16+)
  turbopack: {},
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Increase cache duration for optimized images
    minimumCacheTTL: 60,
    // Enable image optimization caching
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      // Local development
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3000",
        pathname: "/**",
      },
      // Production domain with wildcard for subdomains
      {
        protocol: "https",
        hostname: "**.taypro.in",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "taypro.in",
        pathname: "/**",
      },
      // Third-party image services
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "example.com",
        pathname: "/**",
      },
    ],
  },
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    // Only bundle fs and path on server side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    // Optimize bundle splitting
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for node_modules
            vendor: {
              name: "vendor",
              chunks: "all",
              test: /node_modules/,
              priority: 20,
            },
            // Separate chunk for common components
            common: {
              name: "common",
              minChunks: 2,
              chunks: "all",
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }

    return config;
  },
  typescript: {
    // Don't fail build on TypeScript errors (optional, for now we keep it strict)
    ignoreBuildErrors: false,
  },
  // Permanent redirects (SEO: avoid duplicate URLs)
  async redirects() {
    return [
      {
        // /home is an internal module path consumed by src/app/page.tsx.
        // Any external link to /home should resolve to the single canonical
        // homepage URL to prevent duplicate content / split signals.
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        // app/sitemap.ts serves /sitemap.xml; human-readable map lives at /site-map.
        source: "/sitemap",
        destination: "/site-map",
        permanent: true,
      },
      {
        source: "/contact/thank-you",
        destination: "/contact",
        permanent: true,
      },
    ];
  },
  // Add headers for better caching and performance
  async headers() {
    return [
      {
        // Apply caching headers to static assets
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
      {
        // Cache fonts aggressively
        source: "/:all*(font|woff|woff2|ttf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache images aggressively
        source: "/:all*(png|jpg|jpeg|webp|avif|svg|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
