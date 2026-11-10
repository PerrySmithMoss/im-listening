import { createHash } from "node:crypto";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import { GraphQLError } from "graphql";
import { RedisStore } from "rate-limit-redis";
import type { RedisClient } from "../types/PrismaContext";

function store(redis: RedisClient, name: string) {
  return new RedisStore({
    prefix: `im-listening:rate:${name}:`,
    sendCommand: (...args) => redis.withAbortSignal(AbortSignal.timeout(3000)).sendCommand(args),
  });
}

export const limitRequests = (redis: RedisClient, name: string, limit: number) =>
  rateLimit({
    limit,
    windowMs: 60_000,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    store: store(redis, name),
  });

const authLimits = {
  login: { account: 30, ip: 60, windowMs: 15 * 60_000 },
  register: { account: 10, ip: 20, windowMs: 60 * 60_000 },
  reset: { account: 5, ip: 30, windowMs: 60 * 60_000 },
  googleEmail: { account: 3, ip: 15, windowMs: 15 * 60_000 },
  googleCode: { account: 12, ip: 30, windowMs: 15 * 60_000 },
  googleManage: { account: 10, ip: 30, windowMs: 15 * 60_000 },
  change: { account: 10, ip: 30, windowMs: 60 * 60_000 },
};

export function createAuthLimiter(redis: RedisClient) {
  async function increment(key: string, windowMs: number) {
    const [hits] = await redis.multi().incr(key).pExpire(key, windowMs, "NX").execTyped();
    return hits;
  }

  return async (action: keyof typeof authLimits, ip: string, identifier: string) => {
    const limits = authLimits[action];
    const accountKey = createHash("sha256").update(identifier).digest("hex");
    const prefix = `im-listening:rate:${action}`;
    const [address, account] = await Promise.all([
      increment(`${prefix}:ip:${ipKeyGenerator(ip)}`, limits.windowMs),
      increment(`${prefix}:account:${accountKey}`, limits.windowMs),
    ]);
    if (address > limits.ip || account > limits.account) {
      throw new GraphQLError("Too many attempts. Please try again later.", {
        extensions: { code: "RATE_LIMITED" },
      });
    }
  };
}
