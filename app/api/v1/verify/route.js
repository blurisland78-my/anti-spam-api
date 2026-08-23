import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { rateLimiter } from '@/lib/ratelimit'; // Ensure lib/ratelimit.js exists

const redis = Redis.fromEnv();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  // 1. Identify Client (IP Address or fallback)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

  // 2. Enforce Rate Limit (10 requests / 10 seconds)
  const { success, limit, remaining, reset } = await rateLimiter.limit(`ratelimit_${ip}`);

  if (!success) {
    return NextResponse.json(
      {
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // 3. Input Validation
  if (!email || !email.includes('@')) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Valid email query parameter is required.' },
      { status: 400 }
    );
  }

  // 4. Verification Logic
  const domain = email.split('@')[1].toLowerCase();
  const isDisposable = await redis.sismember('disposable_domains', domain);

  return NextResponse.json(
    {
      email,
      domain,
      is_disposable: Boolean(isDisposable),
      risk_score: isDisposable ? 90 : 0,
      recommendation: isDisposable ? 'BLOCK' : 'ALLOW',
    },
    {
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
      },
    }
  );
}