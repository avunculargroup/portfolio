/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The corpus + embeddings are imported directly by the chat route; keeping
  // them out of the client bundle is handled by them only being referenced
  // from server modules.
  experimental: {
    optimizePackageImports: ["@ai-sdk/react"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        // Opens in the browser when visited directly, and saves with a
        // readable name. Must match CV_PDF_PATH / CV_PDF_FILENAME in lib/cv.ts.
        source: "/cv/chris-pollard-cv.pdf",
        headers: [
          {
            key: "Content-Disposition",
            value: 'inline; filename="Chris-Pollard-CV.pdf"',
          },
          // Same URL across versions, so always revalidate.
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
