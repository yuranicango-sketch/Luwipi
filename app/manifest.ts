import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Luwipi",
    short_name: "Luwipi",
    description: "Aulas prontas e currículo em espiral para professores de piano infantil, dos 2 aos 8 anos.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f5f8f6",
    theme_color: "#1f5c4c",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
