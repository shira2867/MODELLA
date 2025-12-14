import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.modella.life";

  const pages = [
    "/home",
    "/about",
    "/mycloset",
    "/newcloth",
    "/mylooks",
    "/stylefeed",
    "/checklist",
  ];

  return pages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: page === "/home" ? 1 : 0.8,
  }));
}
