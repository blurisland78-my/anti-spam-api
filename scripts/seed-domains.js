import { Redis } from '@upstash/redis';

// Initialize Redis from environment variables
const redis = Redis.fromEnv();

// Raw text blocklists maintained on GitHub
const SOURCES = [
  'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/master/disposable_email_blocklist.conf',
  'https://raw.githubusercontent.com/martenson/disposable-email-domains/master/disposable_email_blocklist.conf',
];

async function seedDisposableDomains() {
  console.log('Fetching disposable domain blocklists...');
  const domainSet = new Set();

  for (const url of SOURCES) {
    try {
      const response = await fetch(url);
      const text = await response.text();
      const lines = text.split('\n');

      for (const line of lines) {
        const cleanDomain = line.trim().toLowerCase();
        // Ignore empty lines and comment lines
        if (cleanDomain && !cleanDomain.startsWith('#') && cleanDomain.includes('.')) {
          domainSet.add(cleanDomain);
        }
      }
    } catch (err) {
      console.error(`Failed to fetch from ${url}:`, err.message);
    }
  }

  const uniqueDomains = Array.from(domainSet);
  console.log(`Found ${uniqueDomains.length} unique disposable domains.`);

  if (uniqueDomains.length === 0) {
    console.log('No domains found. Exiting.');
    return;
  }

  // Add baseline manual fallbacks
  const fallbacks = ['tempmail.com', 'mailinator.com', '10minutemail.com', 'throwawaymail.com', 'guerrillamail.com'];
  fallbacks.forEach((d) => domainSet.add(d));

  // Upstash SADD in chunks of 500 to stay under payload size limits
  const CHUNK_SIZE = 500;
  const allDomains = Array.from(domainSet);

  console.log('Pushing domains to Upstash Redis set: "disposable_domains"...');

  for (let i = 0; i < allDomains.length; i += CHUNK_SIZE) {
    const chunk = allDomains.slice(i, i + CHUNK_SIZE);
    await redis.sadd('disposable_domains', ...chunk);
    console.log(`Pushed ${i + chunk.length} / ${allDomains.length} domains...`);
  }

  const totalInRedis = await redis.scard('disposable_domains');
  console.log(`✅ Seeding complete! Total domains in "disposable_domains" set: ${totalInRedis}`);
}

seedDisposableDomains().catch((err) => {
  console.error('Fatal seeding error:', err);
});