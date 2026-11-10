/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    const upstream = process.env.GRAPHQL_INTERNAL_URL;
    if (!upstream || process.env.NEXT_PUBLIC_GRAPHQL_API_URL !== "/api/graphql") return [];
    return [
      { source: "/api/graphql", destination: upstream },
      { source: "/api/auth/google/:path*", destination: new globalThis.URL("auth/google/:path*", upstream).href },
      { source: "/api/spotify/:path*", destination: new globalThis.URL("spotify/:path*", upstream).href },
    ];
  },
  async headers() {
    return [{
      source: "/api/auth/google/:path*",
      headers: [{ key: "Cache-Control", value: "no-store" }],
    }, {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "no-referrer" },
      ],
    }];
  },
};
