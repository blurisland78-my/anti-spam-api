'use client';

import { useState } from 'react';

export default function PlaygroundPage() {
  const [email, setEmail] = useState('user@tempmail.com');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // Calls API using the built-in demo key
      const res = await fetch(`/api/v1/verify?email=${encodeURIComponent(email)}&apikey=ak_demo_public`);
      const data = await res.json();
      setResult({ status: res.status, body: data });
    } catch (err) {
      setResult({ status: 500, body: { error: 'Failed to execute request' } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0a0f1d', color: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: '18px' }}>← Anti-Spam API</a>
          <a href="/docs" style={{ color: '#38bdf8', textDecoration: 'none' }}>API Docs</a>
        </header>

        <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '10px' }}>API Interactive Playground</h1>
        <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Test email verification in real-time. No registration required (Limited to 5 checks/min per IP).</p>

        <form onSubmit={handleTest} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email (e.g. test@tempmail.com)"
            required
            style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', fontSize: '16px' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '14px 28px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        {result && (
          <div style={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ fontWeight: '600', color: '#94a3b8' }}>Response Output</span>
              <span style={{ color: result.status === 200 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>Status: {result.status}</span>
            </div>
            <pre style={{ backgroundColor: '#0a0f1d', padding: '15px', borderRadius: '8px', overflowX: 'auto', color: '#38bdf8', fontSize: '14px', margin: 0 }}>
              {JSON.stringify(result.body, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}