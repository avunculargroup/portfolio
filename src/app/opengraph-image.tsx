import { ImageResponse } from "next/og";
import { SITE } from "@/lib/config";

export const runtime = "nodejs";
export const alt = `${SITE.name} — ${SITE.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/*
 * Static OG card. Recruiters share these links internally, so it carries the
 * positioning rather than just the name. Uses the fixed tokens from spec §7
 * and no external assets.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F3F4F6",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top row: mark + live agent tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "3px solid #14161C",
              borderRadius: 8,
              padding: "6px 16px",
              fontSize: 32,
              fontWeight: 700,
              color: "#14161C",
              letterSpacing: 1,
            }}
          >
            CP
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              border: "2px solid #E0972B",
              borderRadius: 100,
              padding: "8px 20px",
              fontSize: 20,
              color: "#8A5A10",
              letterSpacing: 2,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                background: "#E0972B",
              }}
            />
            LIVE AGENT
          </div>
        </div>

        {/* Thesis */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 76,
              fontWeight: 700,
              color: "#14161C",
              lineHeight: 1.08,
              letterSpacing: -2,
            }}
          >
            I lead AI delivery — and&nbsp;
            <span style={{ color: "#A86D15" }}>build the systems</span>
            &nbsp;myself.
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 30,
              color: "#5C6270",
              lineHeight: 1.4,
              maxWidth: 900,
            }}
          >
            A decade turning roadmaps into shipped software, now pointed at
            agentic AI.
          </div>
        </div>

        {/* Footer rule */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid #DBDEE4",
            paddingTop: 28,
            fontSize: 26,
            color: "#14161C",
          }}
        >
          <div style={{ display: "flex", fontWeight: 600 }}>{SITE.name}</div>
          <div style={{ display: "flex", color: "#5C6270", letterSpacing: 2 }}>
            {SITE.role.toUpperCase()} · MELBOURNE
          </div>
        </div>
      </div>
    ),
    size,
  );
}
