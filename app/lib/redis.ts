import { Redis } from "@upstash/redis";

let client: Redis | null = null;

export function getRedis(): Redis {
  if (client) return client;
  const url = process.env.KV_REST_API_URL ?? process.env.KV_URL ?? process.env.REDIS_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.KV_REST_API_READ_ONLY_TOKEN;
  if (!url) throw new Error("Missing Upstash Redis URL (set KV_REST_API_URL, KV_URL, or REDIS_URL)");
  client = new Redis({ url, token });
  return client;
}

export const hasRedis = () => !!(process.env.KV_REST_API_URL ?? process.env.KV_URL ?? process.env.REDIS_URL);
