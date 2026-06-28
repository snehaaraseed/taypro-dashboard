const path = require("path");
const createNextIntlPlugin = require("next-intl/plugin");
import { getLegacyPathRedirects } from "./src/lib/seo/legacy-path-redirects";

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
    // TipTap must not be barrel-optimized — breaks dynamic editor chunks in admin.
    optimizePackageImports: ["lucide-react", "next-intl"],
  },
  // Turbopack configuration (Next.js 16+)
  turbopack: {},
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [65, 70, 75, 80, 90],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400,
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
      // Blog author fallback avatars (see src/app/data/blogAuthors.ts)
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/api/**",
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
        source: "/:locale(hi|ar|ja|bn)/home",
        destination: "/:locale",
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
      // Legacy utility O&M path used in case-study HTML
      {
        source: "/utility-operations",
        destination: "/utility-scale-solar-operations",
        permanent: true,
      },
      // Price guide (informational) vs calculator (interactive tool)
      {
        source: "/solar-panel-cleaning-robot-price",
        destination: "/solar-panel-cleaning-robot-price-india",
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
      // Semrush / legacy underscore URLs (SEO-STRATEGY §4.2)
      {
        source: "/solar_panel_cleaning_robot",
        destination: "/solar-panel-cleaning-system",
        permanent: true,
      },
      {
        source: "/pv_panel_cleaning_robot",
        destination: "/solar-panel-cleaning-system",
        permanent: true,
      },
      {
        source: "/pv_panel_cleaning_robot/",
        destination: "/solar-panel-cleaning-system",
        permanent: true,
      },
      {
        source: "/solar_panel_cleaning_system",
        destination: "/solar-panel-cleaning-system",
        permanent: true,
      },
      {
        source: "/automatic_solar_panel_cleaning_machine",
        destination:
          "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
        permanent: true,
      },
      {
        source: "/battery_solar_cleaning_machine",
        destination: "/solar-panel-cleaning-system",
        permanent: true,
      },
      {
        source: "/rooftop-solar-panel-cleaning-robot",
        destination:
          "/solar-panel-cleaning-system/miny-compact-rooftop-cleaning-robot",
        permanent: true,
      },
      {
        source: "/monocrystalline_solar_module_cleaning_robot",
        destination: "/solar-panel-cleaning-system",
        permanent: true,
      },
      {
        source: "/taypro-automatic",
        destination:
          "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
        permanent: true,
      },
      {
        source: "/taypro-ams",
        destination:
          "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
        permanent: true,
      },
      {
        source: "/taypro-ams/",
        destination:
          "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
        permanent: true,
      },
      // Legacy WordPress / static HTML pages (SEO-045)
      {
        source: "/taypro-basic",
        destination:
          "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system",
        permanent: true,
      },
      {
        source: "/taypro-basic/",
        destination:
          "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system",
        permanent: true,
      },
      {
        source: "/industrial_solar_panel_cleaning_system.html",
        destination: "/solar-panel-cleaning-system",
        permanent: true,
      },
      {
        source: "/industrial_solar_panel_cleaning_system",
        destination: "/solar-panel-cleaning-system",
        permanent: true,
      },
      {
        source: "/news/:path*",
        destination: "/blog/:path*",
        permanent: true,
      },
      {
        source: "/contact/",
        destination: "/contact",
        permanent: true,
      },
      // Truncated state-landing resource slugs → canonical CMS slugs
      {
        source: "/blog/the-impact-of-weather-on-solar-panel-cleanliness-in-india",
        destination:
          "/blog/the-impact-of-weather-on-solar-panel-cleanliness-in-india-tips-for-optimal-performance",
        permanent: true,
      },
      {
        source:
          "/blog/the-importance-of-solar-panel-cleaning-across-different-regions-of-india",
        destination:
          "/blog/the-importance-of-solar-panel-cleaning-across-different-regions-of-india-tailoring-solutions-for-diverse-climates",
        permanent: true,
      },
      {
        source: "/solar-panel-cleaning-system/",
        destination: "/solar-panel-cleaning-system",
        permanent: true,
      },
      // Legacy WordPress / truncated blog slugs → canonical CMS slugs
      {
        source: "/renewable-energy/:path*",
        destination: "/blog/:path*",
        permanent: true,
      },
      {
        source: "/blog/what-is-solar-panel-cleaning",
        destination:
          "/blog/what-is-solar-panel-cleaning-why-is-it-necessary-to-clean-solar-panels",
        permanent: true,
      },
      {
        source:
          "/blog/the-importance-of-regular-solar-panel-cleaning-for-efficiency",
        destination:
          "/blog/the-crucial-role-of-regular-solar-panel-cleaning-for-efficiency-keeping-performance-high-in-a-dusty-world",
        permanent: true,
      },
      {
        source:
          "/blog/5-signs-your-solar-plant-needs-automated-cleaning-before-revenue-drops",
        destination:
          "/blog/5-signs-your-solar-plant-needs-automated-cleaning-before-revenue-starts-dropping",
        permanent: true,
      },
      {
        source: "/blog/what-are-the-different-types-of-solar-panels-2",
        destination: "/blog/what-are-the-different-types-of-solar-panels",
        permanent: true,
      },
      {
        source: "/blog/what-are-the-best-practices-of-cleaning-solar-pane",
        destination: "/blog/what-are-the-best-practices-of-cleaning-solar-panels",
        permanent: true,
      },
      // Trailing-dash legacy slug (CMS canonical is without dash)
      {
        source: "/blog/how-does-a-solar-panel-cleaning-robot-work-",
        destination: "/blog/how-does-a-solar-panel-cleaning-robot-work",
        permanent: true,
      },
      {
        source: "/blog/how-does-a-solar-panel-cleaning-robot-work-/",
        destination: "/blog/how-does-a-solar-panel-cleaning-robot-work",
        permanent: true,
      },
      // SEO-020: blog cannibalization pairs → canonical winners
      {
        source: "/blog/what-is-the-solar-panel-efficiency-in-2025",
        destination: "/blog/what-is-solar-panel-efficiency",
        permanent: true,
      },
      // Common price URL variants → guide vs calculator split
      {
        source: "/solar-panel-cleaning-robot-cost-india",
        destination: "/solar-panel-cleaning-robot-price-india",
        permanent: true,
      },
      {
        source: "/solar-panel-cleaning-cost",
        destination: "/solar-cleaning-opex-pricing",
        permanent: true,
      },
      // Buyer-intent landing page aliases (Tier 1 SEO)
      {
        source: "/solar-plant-om-company-india",
        destination: "/solar-om-services",
        permanent: true,
      },
      {
        source: "/solar-panel-cleaning-service-cost",
        destination: "/solar-cleaning-opex-pricing",
        permanent: true,
      },
      {
        source: "/solar-plant-performance-monitoring",
        destination: "/solar-fleet-monitoring-software",
        permanent: true,
      },
      {
        source: "/mw-scale-solar-cleaning-robot",
        destination: "/large-scale-solar-panel-cleaning",
        permanent: true,
      },
      {
        source: "/solar-cleaning-opex-pricings",
        destination: "/solar-cleaning-opex-pricing",
        permanent: true,
      },
      {
        source: "/soiling-loss-calculator",
        destination: "/solar-panel-soiling-loss-calculator",
        permanent: true,
      },
      {
        source: "/solar-panel-soiling-calculator",
        destination: "/solar-panel-soiling-loss-calculator",
        permanent: true,
      },
      {
        source: "/solar-cleaning-capex-opex",
        destination: "/solar-cleaning-capex-vs-opex",
        permanent: true,
      },
      {
        source: "/solar-cleaning-robot-manufacturer",
        destination: "/solar-cleaning-robot-manufacturer-india",
        permanent: true,
      },
      {
        source: "/solar-plant-intelligence",
        destination: "/solar-plant-data-intelligence",
        permanent: true,
      },
      {
        source: "/enterprise-solar-partnership",
        destination: "/enterprise-solar-cleaning-partnership",
        permanent: true,
      },
      // CMS project slug aliases (duplicate imports → canonical URL)
      {
        source: "/projects/akhadana-360-mw",
        destination: "/projects/akhadana-rajasthan-360-mw",
        permanent: true,
      },
      {
        source: "/projects/bhadla-300-mw",
        destination: "/projects/bhadlarajasthan-300-mw",
        permanent: true,
      },
      {
        source: "/projects/apex-13-mw",
        destination: "/projects/apex-nagpur-13-mw",
        permanent: true,
      },
      {
        source: "/projects/hariwansh-07-mw",
        destination: "/projects/hariwansh-nagpur-07-mw",
        permanent: true,
      },
      {
        source: "/projects/-12-mw",
        destination: "/projects/kuber-agro-12-mw",
        permanent: true,
      },
      {
        source: "/projects/-03-mw",
        destination: "/projects/shri-ganesh-industries-03-mw",
        permanent: true,
      },
      // Product hero image path migration (Image SEO Phase B)
      {
        source: "/tayprorobots/taypro-glyde-x-tracker-solar-cleaning-robot.png",
        destination: "/tayprorobots/glyde-x/hero.png",
        permanent: true,
      },
      {
        source: "/tayprorobots/taypro-nyuma-automatic-solar-cleaning-robot.png",
        destination: "/tayprorobots/nyuma/brush-detail.png",
        permanent: true,
      },
      {
        source: "/tayprorobots/taypro-nyuma-x-tracker-solar-cleaning-robot.png",
        destination: "/tayprorobots/nyuma-x/hero.png",
        permanent: true,
      },
      {
        source: "/tayprorobots/taypro-helyx-semi-automatic-solar-cleaning-robot.png",
        destination: "/tayprorobots/helyx/hero.png",
        permanent: true,
      },
      {
        source: "/tayprorobots/glyde/glyde-tr150-top-view.png",
        destination: "/tayprorobots/glyde/hero.webp",
        permanent: true,
      },
      {
        source: "/tayprorobots/glyde/glyde-dual-pass-mechanism.png",
        destination: "/tayprorobots/glyde/side-view.png",
        permanent: true,
      },
      {
        source: "/tayprorobots/glyde/dual-pass-mechanism.png",
        destination: "/tayprorobots/glyde/side-view.png",
        permanent: true,
      },
      {
        source: "/tayprorobots/glyde/glyde-docking-power-unit.png",
        destination: "/tayprorobots/glyde/docking-power-unit.png",
        permanent: true,
      },
      {
        source: "/tayprorobots/taypro-modelT-img.png",
        destination: "/tayprorobots/glyde-x/hero.png",
        permanent: true,
      },
      {
        source: "/tayproasset/taypro-console.png",
        destination: "/tayproasset/nectyr.webp",
        permanent: true,
      },
      {
        source: "/tayproasset/robots.png",
        destination: "/tayproasset/robots.webp",
        permanent: true,
      },
      {
        source: "/tayproasset/nectyr.png",
        destination: "/tayproasset/nectyr.webp",
        permanent: true,
      },
      {
        source: "/tayproasset/taypro-robotFeature.jpg",
        destination: "/tayproasset/taypro-robotFeature.webp",
        permanent: true,
      },
      {
        source: "/tayprorobots/taypro-opex.jpg",
        destination: "/tayprorobots/taypro-opex.webp",
        permanent: true,
      },
      {
        source: "/tayprorobots/taypro-modelA.png",
        destination: "/tayprorobots/glyde/hero.png",
        permanent: true,
      },
      {
        source: "/tayprorobots/taypro-modelAcopy.png",
        destination: "/tayprorobots/glyde/hero.png",
        permanent: true,
      },
      {
        source: "/tayprorobots/taypro-modelBcopy.png",
        destination: "/tayprorobots/helyx/hero.png",
        permanent: true,
      },
      {
        source: "/tayprorobots/taypro-modelTcopy.png",
        destination: "/tayprorobots/glyde-x/hero.png",
        permanent: true,
      },
      // Legacy WordPress media (Ahrefs / inbound links)
      {
        source:
          "/wp-content/uploads/2020/08/23-automatic-operation-1024x576.jpeg",
        destination: "/tayprorobots/glyde/hero.webp",
        permanent: true,
      },
      // 360° frame sequences (legacy Model-A/B/T folder names)
      {
        source: "/360-degree-images/Model-A/MODEL-A-:frame",
        destination: "/360-degree-images/glyde/glyde-:frame",
        permanent: true,
      },
      {
        source: "/360-degree-images/Model-B/:path*",
        destination: "/360-degree-images/helyx/:path*",
        permanent: true,
      },
      {
        source: "/360-degree-images/Model-T/:path*",
        destination: "/360-degree-images/glyde-x/:path*",
        permanent: true,
      },
      ...getLegacyPathRedirects(),
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

    const productionAssetCache = "public, max-age=31536000, immutable";

    const rules: {
      source: string;
      headers: { key: string; value: string }[];
    }[] = [
      {
        // Apply caching headers to static assets
        source: "/:path*",
        headers: globalHeaders,
      },
      {
        // Crawlers must never hit a failing dynamic route for robots.txt
        source: "/robots.txt",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];

    // Aggressive caching is production-only — in dev, Turbopack renames chunks on
    // every rebuild; immutable headers cause 404s for stale node_modules_*.js hashes.
    if (process.env.NODE_ENV === "production") {
      rules.push(
        {
          source: "/:all*(font|woff|woff2|ttf|eot)",
          headers: [{ key: "Cache-Control", value: productionAssetCache }],
        },
        {
          source: "/:all*(png|jpg|jpeg|webp|avif|svg|ico)",
          headers: [{ key: "Cache-Control", value: productionAssetCache }],
        },
        {
          source: "/uploads/:path*",
          headers: [{ key: "Cache-Control", value: productionAssetCache }],
        },
        {
          source: "/_next/image/:path*",
          headers: [{ key: "Cache-Control", value: productionAssetCache }],
        },
        {
          source: "/_next/static/:path*",
          headers: [{ key: "Cache-Control", value: productionAssetCache }],
        }
      );
    }

    return rules;
  },
};

module.exports = withNextIntl(nextConfig);
