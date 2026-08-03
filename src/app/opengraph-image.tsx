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
          background: "#FAF8F3",
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
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#6B8556",
              fontSize: 26,
              fontWeight: 700,
              color: "#FAF8F3",
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
              border: "2px solid #6B8556",
              borderRadius: 100,
              padding: "8px 20px",
              fontSize: 20,
              color: "#52693F",
              letterSpacing: 2,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                background: "#6B8556",
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
              fontSize: 72,
              fontWeight: 500,
              color: "#3A332C",
              lineHeight: 1.1,
              letterSpacing: -1,
            }}
          >
            I lead AI delivery — and&nbsp;
            <span style={{ color: "#52693F" }}>build the systems</span>
            &nbsp;myself.
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 30,
              color: "#756D64",
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
            borderTop: "2px solid #DDD6CC",
            paddingTop: 28,
            fontSize: 26,
            color: "#3A332C",
          }}
        >
          <div style={{ display: "flex", fontWeight: 600 }}>{SITE.name}</div>
          <div style={{ display: "flex", color: "#756D64", letterSpacing: 2 }}>
            {SITE.role.toUpperCase()} · MELBOURNE
          </div>
        </div>
      </div>
    ),
    size,
  );
}
