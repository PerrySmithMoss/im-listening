import "dotenv/config";

export class ConfigError extends Error {}

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new ConfigError(`Missing environment variable: ${name}`);
  return value;
}

function integer(name: string, fallback: number, min: number, max: number) {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new ConfigError(`Invalid environment variable: ${name}`);
  }
  return value;
}

function parseUrl(name: string, protocols: string[], fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (!value) throw new ConfigError(`Missing environment variable: ${name}`);
  try {
    const url = new URL(value);
    if (protocols.includes(url.protocol)) return url;
  } catch {
    // Do not include connection strings in errors.
  }
  throw new ConfigError(`Invalid environment variable: ${name}`);
}

function loadSmtpConfig(production: boolean) {
  const { SMTP_HOST: host, SMTP_FROM: from, SMTP_USER: user, SMTP_PASSWORD: password } = process.env;
  if (!production && !host && !from && !user && !password) return undefined;
  if (Boolean(user) !== Boolean(password)) {
    throw new ConfigError("Configure both SMTP_USER and SMTP_PASSWORD when using SMTP authentication");
  }

  return {
    host: required("SMTP_HOST"),
    port: integer("SMTP_PORT", 1025, 1, 65535),
    secure: process.env.SMTP_SECURE === "true",
    requireTLS: production || Boolean(user),
    auth: user && password ? { user, pass: password } : undefined,
    from: required("SMTP_FROM"),
  };
}

export function loadConfig() {
  const production = process.env.NODE_ENV === "production";
  const clientUrl = parseUrl("CLIENT_ORIGIN", ["http:", "https:"], production ? undefined : "http://localhost:3100");
  if (clientUrl.href !== clientUrl.origin + "/" || (production && clientUrl.protocol !== "https:")) {
    throw new ConfigError("CLIENT_ORIGIN must be a web origin and must use HTTPS in production");
  }
  const secret = required("SESSION_SECRET");
  if (Buffer.byteLength(secret) < 32) throw new ConfigError("SESSION_SECRET must be at least 32 bytes");
  const sameSite = process.env.COOKIE_SAME_SITE ?? "lax";
  if (sameSite !== "lax") {
    throw new ConfigError("Sessions require SameSite=Lax");
  }
  const googleConfigured = production || process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_SECRET;
  const google = googleConfigured ? {
    id: required("GOOGLE_CLIENT_ID"),
    secret: required("GOOGLE_CLIENT_SECRET"),
    redirectUri: new URL("/api/auth/google/callback", clientUrl).href,
  } : undefined;
  if (google && clientUrl.protocol !== "https:" &&
      !["localhost", "127.0.0.1", "[::1]"].includes(clientUrl.hostname)) {
    throw new ConfigError("Google sign-in requires HTTPS outside local development");
  }
  const spotifyId = process.env.SPOTIFY_CLIENT_ID;
  const spotifySecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (Boolean(spotifyId) !== Boolean(spotifySecret)) {
    throw new ConfigError("Configure both SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET");
  }

  return {
    production,
    databaseUrl: parseUrl("DATABASE_URL", ["postgresql:", "postgres:"]),
    redisUrl: parseUrl("REDIS_URL", ["redis:", "rediss:"]).href,
    clientOrigin: clientUrl.origin,
    port: integer("PORT", 5050, 1, 65535),
    host: process.env.HOST ?? (production ? "0.0.0.0" : "127.0.0.1"),
    trustProxyHops: integer("TRUST_PROXY_HOPS", 0, 0, 10),
    secret,
    cookieName: production ? "__Host-im-listening" : "im-listening",
    cookie: { path: "/", httpOnly: true, secure: production, sameSite },
    smtp: loadSmtpConfig(production),
    google,
    spotify: spotifyId && spotifySecret ? { id: spotifyId, secret: spotifySecret } : undefined,
  } as const;
}
