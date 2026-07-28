import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The agent endpoint is a POST-only public API; there is nothing to index
        // and crawling it would burn budget.
        disallow: "/api/",
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
