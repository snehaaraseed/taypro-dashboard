import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Taypro: Solar Panel Cleaning Robots",
    short_name: "Taypro",
    description:
      "Autonomous waterless solar panel cleaning robots for utility-scale plants in India.",
    start_url: "/",
    display: "standalone",
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
    ],
  };
}
