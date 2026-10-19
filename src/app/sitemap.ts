import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getContent } from "@/lib/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // lastModified tracks the last save in /admin, so crawlers know when content really changed
  const { updatedAt } = await getContent();
  return [
    {
      url: SITE_URL,
      lastModified: updatedAt ?? new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
