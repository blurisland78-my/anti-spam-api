import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import Stripe from 'stripe';

const redis = Redis.fromEnv();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // Retrieve Stripe session details
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Unpaid or invalid session' }, { status: 403 });
    }

    const email = session.customer_details?.email;

    // Check if key mapping already exists for this customer email
    let apiKey = await redis.get(`customer_key:${email}`);

    // Fallback: If webhook was delayed, look up or return key created for customer
    if (!apiKey) {
      // Find key by scanning or return fallback
      apiKey = await redis.get(`session_key:${sessionId}`);
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Key processing', message: 'Your key is being generated. Please refresh in a few seconds.' },
        { status: 202 }
      );
    }

    return NextResponse.json({ apiKey, email });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve API key' }, { status: 500 });
  }
}