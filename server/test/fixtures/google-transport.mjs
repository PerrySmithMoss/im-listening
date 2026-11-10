// Child-process test preload. Production still uses discovery and JWKS at the
// real Google URLs, while these tests route only those requests to a mock.
const endpoints = new Map([
  ["https://accounts.google.com/.well-known/openid-configuration", "/discovery"],
  ["https://oauth2.googleapis.com/token", "/token"],
  ["https://www.googleapis.com/oauth2/v3/certs", "/jwks"],
]);
const fetchReal = globalThis.fetch;
const now = Date.now;
let advanceMs = 0;
Date.now = () => now() + advanceMs;
globalThis.fetch = async (input, init) => {
  const path = endpoints.get(String(input));
  if (!path) return fetchReal(input, init);
  const response = await fetchReal(new URL(path, process.env.TEST_GOOGLE_URL), init);
  if (response.headers.has("x-test-clock-offset")) {
    advanceMs = Number(response.headers.get("x-test-clock-offset"));
  }
  return response;
};
