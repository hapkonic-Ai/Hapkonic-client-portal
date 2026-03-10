import { Redis } from '@upstash/redis'

let _redis: Redis | null = null

export function getRedis(): Redis | null {
  if (_redis) return _redis
  const url = process.env['UPSTASH_REDIS_REST_URL']
  const token = process.env['UPSTASH_REDIS_REST_TOKEN']
  if (!url || !token) return null
  _redis = new Redis({ url, token })
  return _redis
}

export async function redisSet(key: string, value: unknown, exSeconds?: number): Promise<void> {
  const r = getRedis()
  if (!r) return
  if (exSeconds) {
    await r.set(key, JSON.stringify(value), { ex: exSeconds })
  } else {
    await r.set(key, JSON.stringify(value))
  }
}

export async function redisGet<T>(key: string): Promise<T | null> {
  const r = getRedis()
  if (!r) return null
  const val = await r.get<string>(key)
  if (!val) return null
  try { return JSON.parse(val) as T } catch { return val as unknown as T }
}

export async function redisDel(key: string): Promise<void> {
  const r = getRedis()
  if (!r) return
  await r.del(key)
}
