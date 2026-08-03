import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** The "CP" mark from the header, so the tab icon matches the site. */
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
          background: "#6B8556",
          color: "#FAF8F3",
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
