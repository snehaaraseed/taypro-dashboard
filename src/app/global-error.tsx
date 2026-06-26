"use client";

/** Root fallback when the locale layout or intl provider fails. */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#fff",
          color: "#052638",
        }}
      >
        <div style={{ maxWidth: "32rem", padding: "2rem", textAlign: "center" }}>
          <p
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#A8C117",
              marginBottom: "0.75rem",
            }}
          >
            Taypro
          </p>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#4b5563", marginBottom: "2rem", lineHeight: 1.6 }}>
            The site hit an unexpected error. Reload to try again, or return to the
            homepage.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                border: "none",
                borderRadius: "0.375rem",
                background: "#052638",
                color: "#fff",
                padding: "0.75rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Reload
            </button>
            <a
              href="/"
              style={{
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
                background: "#fff",
                color: "#052638",
                padding: "0.75rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
