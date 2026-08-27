import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";
import { PLACEHOLDER_MODE } from "@/lib/placeholder";

export default function robots(): MetadataRoute.Robots {
  /*
   * The placeholder pass puts fabricated claims on the page under Chris's real
   * name. A deployment carrying them must not be crawlable — a search result
   * outlives the deployment that produced it. Removed with the placeholder pass.
   */
  if (PLACEHOLDER_MODE) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

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
