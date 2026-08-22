'use client';

import { useState } from 'react';

export default function Home() {
  const [emailInput, setEmailInput] = useState('user@tempmail.com');
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // REPLACE THESE WITH YOUR EXACT STRIPE TEST PAYMENT LINKS
  const PRO_STRIPE_LINK = 'https://buy.stripe.com/test_fZu28r5fE1hXavraik0sU00';
  const GROWTH_STRIPE_LINK = 'https://buy.stripe.com/test_3cIbJ15fEgcR8nj4Y00sU01';

  const handleTestApi = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/verify?email=${encodeURIComponent(emailInput)}`);
      const data = await res.json();
      setApiResponse(data);
    } catch (err) {
      setApiResponse({ error: 'Failed to connect to API endpoint' });
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center px-4 py-16">
      {/* Hero Section */}
      <div className="max-w-4xl text-center space-y-4">
        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-sm font-medium">
          Edge-Accelerated • Sub-50ms Latency
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Anti-Spam & Email Verification API
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
          Protect your SaaS applications from disposable domains, fake signups, and automated bot accounts in real-time.
        </p>
      </div>

      {/* Interactive API Playground */}
      <div className="w-full max-w-2xl mt-12 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold mb-4">Try Live API Endpoint</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Enter email to check..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleTestApi}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Run Test'}
          </button>
        </div>

        {apiResponse && (
          <div className="mt-4 bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm overflow-x-auto text-emerald-400">
            <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Pricing Grid */}
      <div className="w-full max-w-5xl mt-20">
        <h2 className="text-3xl font-bold text-center mb-12">Simple, Predictable Pricing</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Pro Tier Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold">Pro Tier</h3>
              <div className="text-4xl font-extrabold my-4">$9 <span className="text-sm font-normal text-slate-400">/ month</span></div>
              <ul className="space-y-3 text-slate-300 mb-8">
                <li>✓ 15,000 API calls / mo</li>
                <li>✓ Disposable email detection</li>
                <li>✓ Upstash Redis edge acceleration</li>
                <li>✓ Email support</li>
              </ul>
            </div>
            <a
              href={PRO_STRIPE_LINK}
              target="_blank"
              rel="noreferrer"
              className="w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition"
            >
              Subscribe to Pro
            </a>
          </div>

          {/* Growth Tier Card */}
          <div className="bg-slate-900 border-2 border-indigo-500 rounded-2xl p-8 flex flex-col justify-between relative">
            <span className="absolute -top-3 right-6 bg-indigo-500 text-white text-xs px-3 py-1 rounded-full uppercase font-bold">Popular</span>
            <div>
              <h3 className="text-2xl font-bold">Growth Tier</h3>
              <div className="text-4xl font-extrabold my-4">$29 <span className="text-sm font-normal text-slate-400">/ month</span></div>
              <ul className="space-y-3 text-slate-300 mb-8">
                <li>✓ 75,000 API calls / mo</li>
                <li>✓ Priority edge route priority</li>
                <li>✓ Real-time rate limiting</li>
                <li>✓ 24/7 dedicated support</li>
              </ul>
            </div>
            <a
              href={GROWTH_STRIPE_LINK}
              target="_blank"
              rel="noreferrer"
              className="w-full text-center bg-indigo-500 hover:bg-indigo-400 text-white font-semibold py-3 rounded-lg transition"
            >
              Subscribe to Growth
            </a>
          </div>

        </div>
      </div>
    </main>
  );
}