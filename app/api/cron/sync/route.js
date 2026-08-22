import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const REDIS_KEY = 'disposable_domains_set';

const SOURCES = [
  'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/master/disposable_email_blocklist.conf',
  'https://raw.githubusercontent.com/martenson/disposable-email-domains/master/disposable_email_blocklist.conf'
];

export async function GET(request) {
  try {
    const domainSet = new Set([
      'tempmail.com', 'mailinator.com', '10minutemail.com', 
      'guerrillamail.com', 'sharklasers.com', 'trashmail.com'
    ]);

    for (const url of SOURCES) {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        const lines = text.split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim().toLowerCase();
          if (trimmed && !trimmed.startsWith('#')) {
            domainSet.add(trimmed);
          }
        }
      }
    }

    const domainArray = Array.from(domainSet);

    // Save directly as array (Upstash Redis handles serialization automatically)
    await redis.set(REDIS_KEY, domainArray);

    return Response.json({
      success: true,
      total_domains_synced: domainArray.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}