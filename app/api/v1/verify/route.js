import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client directly
const redis = Redis.fromEnv();

export async function GET(request) {
  try {
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

    const domain = email.includes('@') ? email.split('@')[1].toLowerCase() : null;

    // 2. Playground Demo Key
    if (apiKey === 'ak_demo_public') {
      let isDisposable = false;
      try {
        if (domain) {
          isDisposable = Boolean(await redis.sismember('disposable_domains', domain));
        }
      } catch (e) {
        console.error('Demo lookup error:', e);
      }

      return NextResponse.json({
        email,
        domain,
        is_disposable: isDisposable,
        risk_score: isDisposable ? 100 : 0,
        recommendation: isDisposable ? 'BLOCK' : 'ALLOW',
        is_demo: true,
      });
    }

    // 3. Require API Key
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'API key is missing. Pass x-api-key header or ?apikey=' },
        { status: 401 }
      );
    }

    // 4. Robust Key Lookup Across Multiple Formats
    let keyData = null;
    
    // Check apikey:prefix
    try {
      keyData = await redis.hgetall(`apikey:${apiKey}`);
    } catch (e) {}

    // Check key:prefix if first lookup returned empty
    if (!keyData || typeof keyData !== 'object' || Object.keys(keyData).length === 0) {
      try {
        keyData = await redis.hgetall(`key:${apiKey}`);
      } catch (e) {}
    }

    // Check raw key if still empty
    if (!keyData || typeof keyData !== 'object' || Object.keys(keyData).length === 0) {
      try {
        keyData = await redis.hgetall(apiKey);
      } catch (e) {}
    }

    // Validate key existence and active status
    const keyExists = keyData && typeof keyData === 'object' && Object.keys(keyData).length > 0;
    
    if (!keyExists || keyData.status === 'inactive') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Invalid or inactive API key.' },
        { status: 403 }
      );
    }

    // 5. Monthly Usage Counter & Headers
    let monthlyLimit = 25000;
    if (keyData.monthlyLimit) {
      monthlyLimit = parseInt(String(keyData.monthlyLimit), 10) || 25000;
    }

    let remaining = monthlyLimit;
    try {
      const now = new Date();
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const usageKey = `usage:${apiKey}:${currentMonthStr}`;

      const currentUsage = await redis.incr(usageKey);
      if (currentUsage === 1) {
        await redis.expire(usageKey, 60 * 24 * 60 * 60); // 60 days TTL
      }

      remaining = Math.max(0, monthlyLimit - currentUsage);

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
    } catch (usageErr) {
      console.error('Usage counter error:', usageErr);
    }

    // 6. Check Disposable Set
    let isDisposable = false;
    try {
      if (domain) {
        isDisposable = Boolean(await redis.sismember('disposable_domains', domain));
      }
    } catch (domainErr) {
      console.error('Domain check error:', domainErr);
    }

    return NextResponse.json(
      {
        email,
        domain,
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
  } catch (fatalError) {
    console.error('Fatal API Route Error:', fatalError);
    return NextResponse.json(
      { error: 'Internal Server Error', message: fatalError.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}