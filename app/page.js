'use client';

import { useState } from 'react';

export default function HomePage() {
  const [loading, setLoading] = useState(false);

  // Replace priceId values with your real Stripe Price IDs
  const PRICING_PLANS = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$9',
      period: '/mo',
      requests: '25,000 requests/mo',
      priceId: 'price_STARTER_ID',
      popular: false,
      features: ['25,000 API Requests/mo', 'Disposable Domain Detection', 'Upstash Redis O(1) Speed', 'Standard Support'],
    },
    {
      id: 'pro',
      name: 'Developer Pro',
      price: '$19',
      period: '/mo',
      requests: '100,000 requests/mo',
      priceId: 'price_PRO_ID',
      popular: true,
      features: ['100,000 API Requests/mo', 'Disposable Domain Detection', 'MX Record Verification', 'Priority Rate Limiting', '24/7 Email Support'],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$29',
      period: '/mo',
      requests: '300,000 requests/mo',
      priceId: 'price_ENTERPRISE_ID',
      popular: false,
      features: ['300,000 API Requests/mo', 'All Pro Features Included', 'Dedicated Redis Cluster', 'Custom Rate Limits', 'Direct Developer Access'],
    },
  ];

  const handleCheckout = async (priceId) => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to initiate checkout.');
      }
    } catch (err) {
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0a0f1d', color: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Navigation Header */}
      <nav style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🛡️</span>
          <span style={{ fontWeight: '800', fontSize: '20px', letterSpacing: '-0.5px', color: '#ffffff' }}>Anti-Spam API</span>
        </div>
        <a href="/docs" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: '600', fontSize: '15px' }}>
          API Docs →
        </a>
      </nav>

      {/* Hero Section */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 20px 60px', textAlign: 'center' }}>
        <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          ⚡ Next.js + Upstash Redis Powered
        </span>
        <h1 style={{ fontSize: '52px', fontWeight: '800', marginTop: '24px', marginBottom: '20px', lineHeight: '1.15', letterSpacing: '-1px' }}>
          Block Fake Emails & Disposable Domains in Real-Time
        </h1>
        <p style={{ fontSize: '19px', color: '#94a3b8', maxWidth: '640px', margin: '0 auto 36px', lineHeight: '1.6' }}>
          High-performance email verification API with sub-millisecond O(1) Redis lookups. Stop fraudulent registrations effortlessly.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <a
            href="#pricing"
            style={{ padding: '14px 28px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}
          >
            Get API Key
          </a>
          <a
            href="/playground"
            style={{ padding: '14px 28px', backgroundColor: '#1e293b', color: '#e2e8f0', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', border: '1px solid #334155' }}
          >
            Try Live Demo
          </a>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 20px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700' }}>Flexible Pricing Plans</h2>
          <p style={{ color: '#94a3b8', marginTop: '10px' }}>Choose the rate limit and capacity that fits your application scale.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              style={{
                backgroundColor: '#0f172a',
                borderRadius: '16px',
                padding: '36px 28px',
                border: plan.popular ? '2px solid #3b82f6' : '1px solid #1e293b',
                position: 'relative',
                boxShadow: plan.popular ? '0 10px 30px -10px rgba(59, 130, 246, 0.3)' : 'none',
              }}
            >
              {plan.popular && (
                <span style={{ position: 'absolute', top: '-14px', right: '24px', backgroundColor: '#2563eb', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px' }}>
                  MOST POPULAR
                </span>
              )}
              <h3 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>{plan.name}</h3>
              <div style={{ margin: '20px 0', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '42px', fontWeight: '800' }}>{plan.price}</span>
                <span style={{ color: '#64748b', fontSize: '16px' }}>{plan.period}</span>
              </div>
              <p style={{ color: '#38bdf8', fontSize: '14px', fontWeight: '600', marginBottom: '24px' }}>{plan.requests}</p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {plan.features.map((feature, idx) => (
                  <li key={idx} style={{ color: '#cbd5e1', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#10b981' }}>✓</span> {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.priceId)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: plan.popular ? '#2563eb' : '#1e293b',
                  color: '#fff',
                  border: plan.popular ? 'none' : '1px solid #334155',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '15px',
                }}
              >
                {loading ? 'Processing...' : `Get ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}