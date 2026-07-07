import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Taypro: Solar Panel Cleaning Robots",
    short_name: "Taypro",
    description:
      "Autonomous waterless solar panel cleaning robots for utility-scale plants in India.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#052638",
    theme_color: "#A8C117",
    lang: "en-IN",
    icons: [
      {
        src: "/tayproasset/taypro-favicon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Get a Quote",
        short_name: "Quote",
        description: "Contact Taypro for a site-specific quote",
        url: "/contact",
        icons: [{ src: "/tayproasset/taypro-favicon.png", sizes: "192x192" }],
      },
      {
        name: "Explore Cleaning Robots",
        short_name: "Robots",
        description: "Browse Taypro solar panel cleaning robots",
        url: "/solar-panel-cleaning-system",
        icons: [{ src: "/tayproasset/taypro-favicon.png", sizes: "192x192" }],
      },
      {
        name: "Read Our Blog",
        short_name: "Blog",
        description: "Solar panel cleaning insights and guides",
        url: "/blog",
        icons: [{ src: "/tayproasset/taypro-favicon.png", sizes: "192x192" }],
      },
    ],
  };
}
