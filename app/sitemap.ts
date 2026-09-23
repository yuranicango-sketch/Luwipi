import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.APP_URL || "https://luwipi.vercel.app";
  return ["/", "/privacidade", "/termos"].map((path) => ({ url: `${base}${path}`, changeFrequency: path === "/" ? "weekly" : "monthly" }));
}
