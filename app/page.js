'use client';

import { useState } from 'react';

export default function HomePage() {
  const [loading, setLoading] = useState(false);

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
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#111', maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>🛡️ Anti-Spam API</h1>
        <a href="/docs" style={{ color: '#0070f3', textDecoration: 'none', fontWeight: '600' }}>
          API Docs →
        </a>
      </header>

      {/* Hero Section */}
      <section style={{ textAlign: 'center', marginBottom: '80px' }}>
        <h2 style={{ fontSize: '48px', fontWeight: '800', lineHeight: '1.2', marginBottom: '20px' }}>
          Block Fake Emails & Disposable Domains in Real-Time
        </h2>
        <p style={{ fontSize: '18px', color: '#555', maxWidth: '600px', margin: '0 auto 30px' }}>
          High-performance, rate-limited email verification API powered by Redis and Vercel Edge. Protect your signup forms effortlessly.
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <a
            href="/docs"
            style={{
              padding: '12px 24px',
              backgroundColor: '#000',
              color: '#fff',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            Explore Interactive Docs
          </a>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ borderTop: '1px solid #eaeaea', paddingTop: '60px' }}>
        <h3 style={{ fontSize: '32px', textAlign: 'center', marginBottom: '40px' }}>Simple Pricing</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          
          {/* Pro Plan */}
          <div style={{ border: '2px solid #0070f3', borderRadius: '12px', padding: '30px', textAlign: 'center', position: 'relative' }}>
            <span style={{ position: 'absolute', top: '-12px', right: '20px', backgroundColor: '#0070f3', color: '#fff', padding: '2px 10px', borderRadius: '12px', fontSize: '12px' }}>
              POPULAR
            </span>
            <h4 style={{ fontSize: '24px', margin: '0 0 10px 0' }}>Developer Pro</h4>
            <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '10px 0' }}>
              $19 <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#666' }}>/mo</span>
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0', textAlign: 'left', lineHeight: '2' }}>
              <li>✅ 100,000 API Requests/mo</li>
              <li>✅ Disposable Domain Detection</li>
              <li>✅ Real-Time Upstash Redis Engine</li>
              <li>✅ Instant API Key Generation</li>
            </ul>
            <button
              onClick={() => handleCheckout('price_12345')} // Replace with your Stripe Price ID
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#0070f3',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {loading ? 'Processing...' : 'Get API Key'}
            </button>
          </div>

        </div>
      </section>
    </div>
  );
}