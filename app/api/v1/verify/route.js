import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { rateLimiter } from '@/app/lib/ratelimit';

const redis = Redis.fromEnv();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const apiKey = request.headers.get('x-api-key') || searchParams.get('apikey');

  // 1. API Key Authentication
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'API key is missing. Pass x-api-key header or ?apikey=' },
      { status: 401 }
    );
  }

  const keyRecord = await redis.get(`apikey:${apiKey}`);
  if (!keyRecord) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Invalid or revoked API key.' },
      { status: 403 }
    );
  }

  // 2. Client Identifier (Rate limit per API key instead of IP)
  const { success, limit, remaining, reset } = await rateLimiter.limit(`ratelimit_${apiKey}`);

  if (!success) {
    return NextResponse.json(
      { error: 'Too Many Requests', message: 'Rate limit exceeded.' },
      { status: 429, headers: { 'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString() } }
    );
  }

  // 3. Email Input Check
  if (!email || !email.includes('@')) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Valid email query parameter is required.' },
      { status: 400 }
    );
  }

  // 4. Redis Verification
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