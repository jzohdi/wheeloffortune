/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Don't let `next dev` write an AGENTS.md into the repo when it detects an AI coding agent.
  agentRules: false,
  experimental: {
    // Don't let `next build` fetch npm security advisories when it detects an AI coding agent.
    agentUpgrade: false,
  },
}

module.exports = nextConfig
