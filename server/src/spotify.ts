import { Router } from "express";
import type { loadConfig } from "./config";
import { limitRequests } from "./middleware/rateLimits";
import type { RedisClient } from "./types/PrismaContext";

type Track = {
  id: string;
  name: string;
  preview_url?: string | null;
  album: { name: string; images: { url: string }[] };
  artists: { id: string; name: string }[];
};

export function spotifyRouter(config: ReturnType<typeof loadConfig>, redis: RedisClient) {
  const router = Router();
  const credentials = config.spotify;
  let cached: { value: string; expires: number } | undefined;
  let pending: Promise<string> | undefined;

  async function accessToken() {
    if (cached && cached.expires > Date.now()) return cached.value;
    if (!credentials) throw new Error("Spotify is not configured");
    pending ??= (async () => {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${credentials.id}:${credentials.secret}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
        signal: AbortSignal.timeout(5000),
        redirect: "error",
      });
      if (!response.ok) throw new Error("Spotify token unavailable");
      const data = await response.json() as { access_token: string; expires_in: number };
      cached = { value: data.access_token, expires: Date.now() + (data.expires_in - 30) * 1000 };
      return cached.value;
    })().finally(() => { pending = undefined; });
    return pending;
  }

  async function spotifyJson<T>(path: string): Promise<T> {
    for (let attempt = 0; attempt < 2; attempt++) {
      const token = await accessToken();
      const response = await fetch(`https://api.spotify.com/v1/${path}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(5000),
        redirect: "error",
      });
      if (response.status === 401 && attempt === 0) {
        if (cached?.value === token) cached = undefined;
        await response.body?.cancel();
        continue;
      }
      if (!response.ok) throw new Error("Spotify data unavailable");
      return await response.json() as T;
    }
    throw new Error("Spotify data unavailable");
  }

  router.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    if (!req.session.userId) {
      res.status(401).json({ error: "Sign in to search Spotify." });
    } else if (!credentials) {
      res.status(503).json({ error: "Spotify search is not configured." });
    } else {
      next();
    }
  }, limitRequests(redis, "spotify", 30));

  router.get("/tracks", async (req, res) => {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!query || query.length > 100) {
      res.status(400).json({ error: "Enter a search of 1 to 100 characters." });
      return;
    }
    try {
      const params = new URLSearchParams({ q: query, type: "track", limit: "5", market: "GB" });
      const data = await spotifyJson<{ tracks?: { items: Track[] } }>(`search?${params}`);
      const tracks = (data.tracks?.items ?? []).flatMap((track) =>
        track?.artists?.[0] ? [{
          id: track.id,
          artist: track.artists[0],
          title: track.name,
          albumName: track.album.name,
          albumUrl: track.album.images[0]?.url ?? "",
          previewUrl: track.preview_url ?? null,
        }] : [],
      );
      res.json(tracks);
    } catch {
      res.status(502).json({ error: "Spotify search is temporarily unavailable." });
    }
  });

  router.get("/artists/:id/genres", async (req, res) => {
    if (!/^[A-Za-z0-9]{22}$/.test(req.params.id)) {
      res.status(400).json({ error: "Invalid artist ID." });
      return;
    }
    try {
      const data = await spotifyJson<{ genres?: string[] }>(`artists/${req.params.id}`);
      res.json((data.genres ?? []).slice(0, 20).filter((genre) => genre.length <= 100));
    } catch {
      res.status(502).json({ error: "Spotify genres are temporarily unavailable." });
    }
  });

  return router;
}
