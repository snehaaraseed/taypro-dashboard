const path = require("path");
const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Enable static page generation for better performance
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
  // Enable experimental features for better performance
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/sharp/**/*",
      "./node_modules/@img/**/*",
      "./public/**/*",
      "./messages/**/*",
    ],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["lucide-react", "@tiptap/react", "next-intl"],
  },
  // Turbopack configuration (Next.js 16+)
  turbopack: {},
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80, 90],
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
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
  typescript: {
    // Don't fail build on TypeScript errors (optional, for now we keep it strict)
    ignoreBuildErrors: false,
  },
  // Locale-prefixed requests to /public assets (e.g. /hi/360-degree-images/...) → root path
  async rewrites() {
    const locales = ["hi", "ar", "ja", "bn", "en"];
    const publicRoots = [
      "360-degree-images",
      "tayproasset",
      "tayprobglayout",
      "tayproclients",
      "tayproenergyresource",
      "tayprofounders",
      "tayprokeymetrics",
      "tayprorobots",
      "tayprosolarfirm",
      "tayprosolarpanel",
      "blogs",
    ];
    return locales.flatMap((locale) =>
      publicRoots.map((root) => ({
        source: `/${locale}/${root}/:path*`,
        destination: `/${root}/:path*`,
      }))
    );
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
      {
        source: "/en",
        destination: "/",
        permanent: true,
      },
      {
        source: "/en/:path*",
        destination: "/:path*",
        permanent: true,
      },
      // Canonical price + ROI tool (Keyword Planner: cost, price, ROI)
      {
        source: "/solar-panel-cleaning-robot-price",
        destination: "/solar-panel-cleaning-robot-price-calculator",
        permanent: true,
      },
      {
        source: "/solar-panel-cleaning-cost-calculator",
        destination: "/solar-panel-cleaning-robot-price-calculator",
        permanent: true,
      },
      {
        source: "/solar-panel-cleaning-robot-roi-calculator",
        destination: "/solar-panel-cleaning-robot-price-calculator",
        permanent: true,
      },
      {
        source: "/roi-calculator",
        destination: "/solar-panel-cleaning-robot-price-calculator",
        permanent: true,
      },
    ];
  },
  // Add headers for better caching and performance
  async headers() {
    const globalHeaders: { key: string; value: string }[] = [
      {
        key: "X-DNS-Prefetch-Control",
        value: "on",
      },
    ];
    if (process.env.NODE_ENV === "production") {
      globalHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      });
    }

    return [
      {
        // Apply caching headers to static assets
        source: "/:path*",
        headers: globalHeaders,
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

module.exports = withNextIntl(nextConfig);
