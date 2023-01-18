module.exports = {
  nextConfig: {
    reactStrictMode: true,
    swcMinify: true,
    images: {
      domains: ["localhost", "im-listening.onrender.com"],
    },
  },
  env: {
    GRAPHQL_API_URL: "https://im-listening.onrender.com/graphql",
  },
};
