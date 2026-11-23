import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * The "CP" mark from the header, so the tab icon matches the site.
 * ImageResponse can't read CSS variables, so these are the sRGB equivalents
 * of the globals.css tokens — keep them in sync if the palette changes:
 *   --signal oklch(0.55 0.12 40)   → #AB5637
 *   --paper  oklch(0.975 0.012 75) → #FCF6EE
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#AB5637",
          color: "#FCF6EE",
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: 0.5,
          fontFamily: "sans-serif",
          borderRadius: "50%",
        }}
      >
        CP
      </div>
    ),
    size,
  );
}
