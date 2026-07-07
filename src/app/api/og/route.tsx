import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "Taypro - Solar Panel Cleaning Robots";
    const type = searchParams.get("type") || "default";
    const meta = searchParams.get("meta") || "Operations & Maintenance";
    const author = searchParams.get("author") || "Taypro Team";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#052638",
            padding: "80px",
            justifyContent: "space-between",
            boxSizing: "border-box",
            position: "relative",
          }}
        >
          {/* Background Radial Glow */}
          <div
            style={{
              position: "absolute",
              top: "-150px",
              right: "-150px",
              width: "500px",
              height: "500px",
              borderRadius: "250px",
              background: "radial-gradient(circle, rgba(168,193,23,0.15) 0%, rgba(5,38,56,0) 70%)",
            }}
          />

          {/* Top Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            {/* Logo Brand Name */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "36px",
                  fontWeight: "bold",
                  color: "#FFFFFF",
                  letterSpacing: "0.05em",
                }}
              >
                TAYPRO
              </span>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "4px",
                  backgroundColor: "#A8C117",
                  marginLeft: "8px",
                }}
              />
            </div>

            {/* Tag */}
            <div
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#A8C117",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                border: "1.5px solid rgba(168,193,23,0.3)",
                padding: "6px 16px",
                borderRadius: "20px",
              }}
            >
              {type}
            </div>
          </div>

          {/* Main Body (Title) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              maxWidth: "950px",
              marginTop: "40px",
              marginBottom: "40px",
            }}
          >
            {/* Meta Category Info */}
            <div
              style={{
                fontSize: "20px",
                color: "rgba(255,255,255,0.6)",
                marginBottom: "16px",
                letterSpacing: "0.02em",
              }}
            >
              {meta}
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: "64px",
                fontWeight: "bold",
                color: "#FFFFFF",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </div>
          </div>

          {/* Footer (Author/Copyright) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              {/* Author Name */}
              <span
                style={{
                  fontSize: "18px",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                By {author}
              </span>
            </div>

            {/* Domain name */}
            <span
              style={{
                fontSize: "18px",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              taypro.in
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error: any) {
    console.error("OG Image generation failed:", error);
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
