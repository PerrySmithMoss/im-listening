module.exports = {
  nextConfig: {
    reactStrictMode: true,
    swcMinify: true,
    images: {
      domains: ["localhost", "im-listening.up.railway.app"],
    },
  },
  env: {
    GRAPHQL_API_URL: "http://localhost:5000/graphql",
  },
};
