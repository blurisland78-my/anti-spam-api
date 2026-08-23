import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const redis = Redis.fromEnv();

// Popular disposable email domains
const disposableDomains = [
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'dispostable.com',
  'trashmail.com',
  'yopmail.com',
  'getnada.com',
  'throwawaymail.com',
  'temp-mail.org',
  'sharklasers.com',
  'guerrillamail.block',
  'guerrillamail.net',
  'guerrillamail.org',
  'grr.la',
  'guerrillamail.biz',
  'spam4.me',
  'disposablemail.com',
  'maildrop.cc',
  'crazymailing.com',
  'burnermail.io',
  'fakemailgenerator.com',
];

async function seed() {
  console.log('Seeding disposable domains into Upstash Redis...');
  
  if (disposableDomains.length === 0) {
    console.log('No domains to seed.');
    return;
  }

  // Add domains to Upstash Redis set 'disposable_domains'
  const added = await redis.sadd('disposable_domains', ...disposableDomains);
  console.log(`Successfully added ${added} new domains to 'disposable_domains' set.`);

  const total = await redis.scard('disposable_domains');
  console.log(`Total disposable domains in Redis: ${total}`);
}

seed().catch(console.error);