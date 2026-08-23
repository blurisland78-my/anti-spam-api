import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const redis = Redis.fromEnv();

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle successful subscription or purchase
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerEmail = session.customer_details?.email;

    // 1. Generate secure API key (e.g., ak_live_32chars)
    const rawToken = crypto.randomBytes(24).toString('hex');
    const apiKey = `ak_live_${rawToken}`;

    // 2. Store Key Info in Upstash Redis
    const keyData = {
      email: customerEmail,
      status: 'active',
      createdAt: new Date().toISOString(),
      plan: 'pro', // Adjust based on line items or metadata
    };

    // Save key mapping in Redis: key = "apikey:ak_live_..."
    await redis.set(`apikey:${apiKey}`, JSON.stringify(keyData));

    // Also map user email to their API key
    if (customerEmail) {
      await redis.set(`user:${customerEmail}:apikey`, apiKey);
    }

    console.log(`[Stripe Webhook] API Key generated for ${customerEmail}: ${apiKey}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}