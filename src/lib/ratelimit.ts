import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

const isDev = process.env.NODE_ENV === 'development'

// AI generation: 10 requests/hour in prod, 1000 in dev (so you don't block yourself while testing)
export const aiLimiter = new Ratelimit({
  redis,
  limiter: isDev
    ? Ratelimit.slidingWindow(1000, '1 h')
    : Ratelimit.slidingWindow(10, '1 h'),
  prefix: 'rl:ai'
})

// Code execution: 30 requests/hour in prod
export const executeLimiter = new Ratelimit({
  redis,
  limiter: isDev
    ? Ratelimit.slidingWindow(1000, '1 h')
    : Ratelimit.slidingWindow(30, '1 h'),
  prefix: 'rl:execute'
})

// PDF/document export: 20 requests/hour in prod
export const exportLimiter = new Ratelimit({
  redis,
  limiter: isDev
    ? Ratelimit.slidingWindow(1000, '1 h')
    : Ratelimit.slidingWindow(20, '1 h'),
  prefix: 'rl:export'
})
