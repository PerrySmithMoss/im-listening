import type { Request, Response } from "express";

export const idleSessionMs = 24 * 60 * 60_000;
export const absoluteSessionMs = 7 * idleSessionMs;

export async function saveSession(req: Request) {
  try {
    await new Promise<void>((resolve, reject) =>
      req.session.save((error) => error ? reject(error) : resolve()),
    );
  } catch (error) {
    await destroySession(req);
    throw error;
  }
}

export function regenerateSession(req: Request) {
  return new Promise<void>((resolve, reject) =>
    req.session.regenerate((error) => error ? reject(error) : resolve()),
  );
}

export function destroySession(req: Request) {
  return new Promise<void>((resolve, reject) =>
    req.session.destroy((error) => error ? reject(error) : resolve()),
  );
}

export async function establishSession(req: Request, id: number, version: number) {
  await regenerateSession(req);
  req.session.userId = id;
  req.session.sessionVersion = version;
  req.session.authenticatedAt = Date.now();
  await saveSession(req);
}

export function requireWriteOrigin(req: Request, res: Response, origin: string) {
  if (req.get("origin") === origin && req.is("application/json")) return true;
  res.status(403).json({ error: "Request origin or content type is not allowed." });
  return false;
}
