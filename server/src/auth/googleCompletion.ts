import { randomBytes } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import type { Request } from "express";
import type { RedisClient } from "../types/PrismaContext";
import { destroySession, sessionPrefix } from "./session";

const completionPrefix = "im-listening:google:completion:";
const claimSeconds = 600;
const successorSeconds = 60;
const redisCommand = (redis: RedisClient) => redis.withAbortSignal(AbortSignal.timeout(3000));

declare module "express-serve-static-core" {
  interface Request {
    replacedSessionId?: string;
  }
}

export function generateSessionId(req: Request) {
  // Express has already verified the presented cookie when it replaces a missing session.
  req.replacedSessionId ??= req.sessionID;
  return randomBytes(24).toString("base64url");
}

export async function claimGoogleCompletion(redis: RedisClient, sid: string) {
  const key = completionPrefix + sid;
  const owner = "busy:" + randomBytes(16).toString("hex");
  const claimed = await redisCommand(redis).eval(`
    if redis.call('EXISTS', KEYS[1]) == 0 then return 0 end
    if redis.call('SET', KEYS[2], ARGV[1], 'NX', 'EX', ARGV[2]) then return 1 end
    return 0
  `, { keys: [sessionPrefix + sid, key], arguments: [owner, String(claimSeconds)] });
  if (!claimed) return undefined;

  return async (successor?: string) => {
    const released = await redisCommand(redis).eval(`
      if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end
      if ARGV[2] == '' then
        redis.call('DEL', KEYS[1])
      else
        redis.call('SET', KEYS[1], ARGV[2], 'EX', ARGV[3])
      end
      return 1
    `, { keys: [key], arguments: [owner, successor ?? "", String(successorSeconds)] });
    if (!released) throw new Error("Google session completion expired");
  };
}

export async function logoutSession(req: Request, redis: RedisClient) {
  const deadline = Date.now() + 5000;
  do {
    // A completed rotation leaves a short-lived pointer so logout using the old
    // cookie can also revoke the session issued by a callback that won the race.
    const revoked = await redisCommand(redis).eval(`
      local sid = ARGV[1]
      local sessions = {}
      repeat
        sessions[#sessions + 1] = ARGV[2] .. sid
        sid = redis.call('GET', ARGV[3] .. sid)
        if sid and string.sub(sid, 1, 5) == 'busy:' then return 0 end
      until not sid
      redis.call('DEL', unpack(sessions))
      return 1
    `, { arguments: [req.replacedSessionId ?? req.sessionID, sessionPrefix, completionPrefix] });
    if (revoked) {
      await destroySession(req);
      return;
    }
    await delay(50);
  } while (Date.now() < deadline);
  throw new Error("A sign-in change is still finishing");
}
