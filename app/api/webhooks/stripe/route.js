import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';
import Stripe from 'stripe';

const redis = Redis.fromEnv();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Map Stripe Price IDs to monthly request limits
// Ensure these environment variables match your Stripe Dashboard Price IDs
const PLAN_LIMITS = {
  [process.env.STRIPE_PRICE_STARTER]: 25000,
  [process.env.STRIPE_PRICE_PRO]: 100000,
  [process.env.STRIPE_PRICE_ENTERPRISE]: 300000,
};

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;

  // 1. Verify Webhook Signature
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // 2. Handle Successful Checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerEmail = session.customer_details?.email;

    if (!customerEmail) {
      console.error('Checkout session missing customer email.');
      return NextResponse.json({ received: true });
    }

    // Generate secure live API key format: ak_live_<64-char-hex>
    const apiKey = `ak_live_${crypto.randomBytes(32).toString('hex')}`;

    // Determine plan limit based on purchased item
    let monthlyLimit = 25000; // Default fallback
    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const priceId = lineItems.data[0]?.price?.id;
      if (priceId && PLAN_LIMITS[priceId]) {
        monthlyLimit = PLAN_LIMITS[priceId];
      }
    } catch (err) {
      console.error('Failed to fetch line items, defaulting to 25,000:', err);
    }

    try {
      // Create primary API key record (Hash)
      await redis.hset(`apikey:${apiKey}`, {
        status: 'active',
        email: customerEmail,
        monthlyLimit: monthlyLimit,
        stripeCustomerId: session.customer || '',
        stripeSubscriptionId: session.subscription || '',
        createdAt: Date.now(),
      });

      // Save fast-lookup references for /api/get-key (Success Page)
      await redis.set(`customer_key:${customerEmail}`, apiKey);
      await redis.set(`session_key:${session.id}`, apiKey);

      console.log(`[Stripe Webhook] Successfully generated API Key for ${customerEmail}: ${apiKey}`);
    } catch (dbError) {
      console.error('Failed to store API Key in Upstash Redis:', dbError);
      return NextResponse.json(
        { error: 'Database error while provisioning key' },
        { status: 500 }
      );
    }
  }

  // 3. Handle Subscription Cancellation / Invalidation
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    try {
      // Find keys associated with this Stripe customer and mark inactive
      const customer = await stripe.customers.retrieve(customerId);
      if (customer?.email) {
        const apiKey = await redis.get(`customer_key:${customer.email}`);
        if (apiKey) {
          await redis.hset(`apikey:${apiKey}`, { status: 'inactive' });
          console.log(`[Stripe Webhook] Deactivated key for unsubscribed user: ${customer.email}`);
        }
      }
    } catch (err) {
      console.error('Error handling subscription cancellation:', err);
    }
  }

  return NextResponse.json({ received: true });
}