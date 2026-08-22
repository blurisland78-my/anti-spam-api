import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import validator from 'validator';

const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

const REDIS_KEY = 'disposable_domains_set';

// Primary hardcoded safety net
const FALLBACK_DOMAINS = new Set([
  'tempmail.com', 'mailinator.com', '10minutemail.com', 
  'guerrillamail.com', 'sharklasers.com', 'trashmail.com',
  'yopmail.com', 'dispostable.com', 'getnada.com', 'temp-mail.org'
]);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return Response.json({ error: 'Email parameter is required.' }, { status: 400 });
  }

  if (!validator.isEmail(email)) {
    return Response.json({ error: 'Invalid email format provided.' }, { status: 400 });
  }

  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return Response.json({ error: 'Rate limit exceeded.' }, { status: 429 });
  }

  const domain = email.split('@')[1].toLowerCase().trim();

  // Fetch cached list from Redis
  let cachedData = await redis.get(REDIS_KEY);

  // If stringified JSON, parse it manually; otherwise use directly
  if (typeof cachedData === 'string') {
    try {
      cachedData = JSON.parse(cachedData);
    } catch (e) {
      cachedData = null;
    }
  }

  let blocklist = FALLBACK_DOMAINS;

  if (Array.isArray(cachedData) && cachedData.length > 0) {
    blocklist = new Set(cachedData.map(d => String(d).trim().toLowerCase()));
  }

  // Double check fallback set if domain wasn't found in dynamic set
  const isDisposable = blocklist.has(domain) || FALLBACK_DOMAINS.has(domain);

  return Response.json({
    email,
    domain,
    is_disposable: isDisposable,
    risk_score: isDisposable ? 90 : 10,
    recommendation: isDisposable ? 'BLOCK' : 'ALLOW',
  });
}