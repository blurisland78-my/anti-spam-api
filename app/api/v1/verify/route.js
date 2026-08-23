import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const redis = Redis.fromEnv();

// Demo rate limiter (5 req/min per IP for public playground)
const demoRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  prefix: '@upstash/ratelimit:demo',
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const apiKey = request.headers.get('x-api-key') || searchParams.get('apikey');

  if (!email) {
    return NextResponse.json({ error: 'Bad Request', message: 'Missing email parameter' }, { status: 400 });
  }

  // --- 1. HANDLE PUBLIC DEMO KEY (Playground Testing) ---
  if (apiKey === 'ak_demo_public') {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success } = await demoRatelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: 'Too Many Requests', message: 'Demo rate limit reached. Limit: 5 checks/min per IP.' },
        { status: 429 }
      );
    }
  } 
  // --- 2. HANDLE STANDARD PAID API KEYS ---
  else {
    if (!apiKey) {
      return NextResponse.json({ error: 'Unauthorized', message: 'API key is missing.' }, { status: 401 });
    }

    const keyData = await redis.hgetall(`key:${apiKey}`);
    if (!keyData || keyData.status !== 'active') {
      return NextResponse.json({ error: 'Forbidden', message: 'Invalid or inactive API key.' }, { status: 403 });
    }

    // Monthly Quota Check
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
        { error: 'Quota Exceeded', message: `Monthly limit of ${monthlyLimit.toLocaleString()} requests reached.` },
        { status: 429, headers: { 'X-RateLimit-Limit-Monthly': String(monthlyLimit), 'X-RateLimit-Remaining-Monthly': '0' } }
      );
    }

    // Process Email Verification
    const domain = email.split('@')[1]?.toLowerCase();
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

  // Fallback Disposable Lookup for Demo
  const domain = email.split('@')[1]?.toLowerCase();
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