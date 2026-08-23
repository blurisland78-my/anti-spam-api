import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const redis = Redis.fromEnv();

// Demo rate limiter (5 requests per minute per IP for the /playground demo)
const demoRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  prefix: '@upstash/ratelimit:demo',
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const apiKey = request.headers.get('x-api-key') || searchParams.get('apikey');

  // 1. Validate Input
  if (!email) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Missing required query parameter: email' },
      { status: 400 }
    );
  }

  // Extract domain from provided email
  const domain = email.split('@')[1]?.toLowerCase();

  // 2. Handle Interactive Playground Demo Key
  if (apiKey === 'ak_demo_public') {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success } = await demoRatelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Too Many Requests', message: 'Playground rate limit exceeded. Limit: 5 checks/min per IP.' },
        { status: 429 }
      );
    }

    const isDisposable = domain ? Boolean(await redis.sismember('disposable_domains', domain)) : false;

    return NextResponse.json({
      email,
      domain: domain || null,
      is_disposable: isDisposable,
      risk_score: isDisposable ? 100 : 0,
      recommendation: isDisposable ? 'BLOCK' : 'ALLOW',
      is_demo: true,
    });
  }

  // 3. Handle Production API Key Authentication
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'API key is missing. Pass x-api-key header or ?apikey=' },
      { status: 401 }
    );
  }

  // Look up key metadata checking both 'apikey:' and 'key:' prefixes in Upstash Redis
  let keyData = await redis.hgetall(`apikey:${apiKey}`);
  if (!keyData || Object.keys(keyData).length === 0) {
    keyData = await redis.hgetall(`key:${apiKey}`);
  }

  if (!keyData || Object.keys(keyData).length === 0 || keyData.status === 'inactive') {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Invalid or inactive API key.' },
      { status: 403 }
    );
  }

  // 4. Monthly Usage & Quota Tracking
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const usageKey = `usage:${apiKey}:${currentMonthStr}`;

  const currentUsage = await redis.incr(usageKey);
  if (currentUsage === 1) {
    await redis.expire(usageKey, 60 * 24 * 60 * 60); // 60 days TTL
  }

  const monthlyLimit = parseInt(keyData.monthlyLimit || '25000', 10);
  const remaining = Math.max(0, monthlyLimit - currentUsage);

  if (currentUsage > monthlyLimit) {
    return NextResponse.json(
      {
        error: 'Quota Exceeded',
        message: `Monthly request limit of ${monthlyLimit.toLocaleString()} reached for this billing cycle.`,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit-Monthly': String(monthlyLimit),
          'X-RateLimit-Remaining-Monthly': '0',
        },
      }
    );
  }

  // 5. Perform Disposable Domain Check
  const isDisposable = domain ? Boolean(await redis.sismember('disposable_domains', domain)) : false;

  return NextResponse.json(
    {
      email,
      domain: domain || null,
      is_disposable: isDisposable,
      risk_score: isDisposable ? 100 : 0,
      recommendation: isDisposable ? 'BLOCK' : 'ALLOW',
    },
    {
      status: 200,
      headers: {
        'X-RateLimit-Limit-Monthly': String(monthlyLimit),
        'X-RateLimit-Remaining-Monthly': String(remaining),
      },
    }
  );
}