// Pages that may embed this site in a frame.
const frameAncestors = [
  "'self'",
  "https://jakezohdi.dev",
  "https://studio-zohdi-llc.com",
  "https://www.studio-zohdi-llc.com",
]

// Baseline security headers, sent on every route.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: `frame-ancestors ${frameAncestors.join(" ")}` },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Don't let `next dev` write an AGENTS.md into the repo when it detects an AI coding agent.
  agentRules: false,
  experimental: {
    // Don't let `next build` fetch npm security advisories when it detects an AI coding agent.
    agentUpgrade: false,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}

module.exports = nextConfig
