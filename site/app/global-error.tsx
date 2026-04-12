"use client"

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ background: "#18181a", color: "#e5e5e5", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Application error
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#999", marginBottom: "1.5rem" }}>
            The app encountered an unexpected error.
          </p>
          <button
            onClick={reset}
            style={{ background: "#5865f2", color: "#fff", border: "none", borderRadius: "8px", padding: "0.5rem 1.25rem", cursor: "pointer", fontSize: "0.875rem" }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  )
}
