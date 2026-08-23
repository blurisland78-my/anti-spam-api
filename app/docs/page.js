'use client';

import { useState } from 'react';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState('curl');
  const [copiedCode, setCopiedCode] = useState(false);

  const codeSnippets = {
    curl: `curl -X GET "https://anti-spam-api.vercel.app/api/v1/verify?email=test@tempmail.com" \\
  -H "x-api-key: YOUR_API_KEY"`,
    node: `const response = await fetch("https://anti-spam-api.vercel.app/api/v1/verify?email=test@tempmail.com", {
  method: "GET",
  headers: {
    "x-api-key": "YOUR_API_KEY"
  }
});

const data = await response.json();
console.log(data);`,
    python: `import requests

url = "https://anti-spam-api.vercel.app/api/v1/verify"
params = {"email": "test@tempmail.com"}
headers = {"x-api-key": "YOUR_API_KEY"}

response = requests.get(url, headers=headers, params=params)
data = response.json()

print(data)`
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div style={{ backgroundColor: '#0a0f1d', color: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header / Nav */}
      <nav style={{ borderBottom: '1px solid #1e293b', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ color: '#fff', fontSize: '20px', fontWeight: '800', textDecoration: 'none' }}>
          🛡️ AntiSpam<span style={{ color: '#38bdf8' }}>API</span>
        </a>
        <a href="/#pricing" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
          Get API Key →
        </a>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 20px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '12px' }}>Developer Documentation</h1>
        <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '40px' }}>
          Integrate real-time disposable email verification into your registration flow in under 5 minutes.
        </p>

        {/* Endpoint Section */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>GET /api/v1/verify</h2>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px 20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ backgroundColor: '#10b981', color: '#042f2e', fontWeight: '800', fontSize: '12px', padding: '4px 8px', borderRadius: '4px' }}>GET</span>
            <code style={{ color: '#f8fafc', fontSize: '14px', fontFamily: 'monospace' }}>https://anti-spam-api.vercel.app/api/v1/verify</code>
          </div>
        </section>

        {/* Query Parameters */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Request Parameters</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#0f172a', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1e293b' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '13px' }}>
                <th style={{ padding: '12px 16px' }}>Parameter</th>
                <th style={{ padding: '12px 16px' }}>Type</th>
                <th style={{ padding: '12px 16px' }}>Location</th>
                <th style={{ padding: '12px 16px' }}>Description</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '14px' }}>
              <tr style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '12px 16px', color: '#38bdf8', fontFamily: 'monospace' }}>email</td>
                <td style={{ padding: '12px 16px', color: '#94a3b8' }}>string</td>
                <td style={{ padding: '12px 16px', color: '#94a3b8' }}>Query</td>
                <td style={{ padding: '12px 16px' }}>The target email address to verify (e.g. <code>user@domain.com</code>).</td>
              </tr>
              <tr>
                <td style={{ padding: '12px 16px', color: '#38bdf8', fontFamily: 'monospace' }}>x-api-key</td>
                <td style={{ padding: '12px 16px', color: '#94a3b8' }}>string</td>
                <td style={{ padding: '12px 16px', color: '#94a3b8' }}>Header / Query</td>
                <td style={{ padding: '12px 16px' }}>Your production key (<code>x-api-key</code> header) or demo key (<code>ak_demo_public</code>).</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Code Snippets Switcher */}
        <section style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Code Example</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['curl', 'node', 'python'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    backgroundColor: activeTab === tab ? '#2563eb' : '#1e293b',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', position: 'relative' }}>
            <button
              onClick={() => handleCopy(codeSnippets[activeTab])}
              style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '#334155', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
            >
              {copiedCode ? '✓ Copied' : 'Copy'}
            </button>
            <pre style={{ margin: 0, color: '#10b981', fontFamily: 'monospace', fontSize: '14px', overflowX: 'auto', lineHeight: '1.6' }}>
              {codeSnippets[activeTab]}
            </pre>
          </div>
        </section>

        {/* Response JSON Schema */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>JSON Response Format</h2>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
            <pre style={{ margin: 0, color: '#38bdf8', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.6' }}>
{`{
  "email": "user@tempmail.com",
  "domain": "tempmail.com",
  "is_disposable": true,
  "risk_score": 100,
  "recommendation": "BLOCK"
}`}
            </pre>
          </div>
        </section>

        {/* HTTP Status Codes */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Response Status Codes</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#0f172a', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1e293b' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '13px' }}>
                <th style={{ padding: '12px 16px' }}>Status Code</th>
                <th style={{ padding: '12px 16px' }}>Description</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '14px' }}>
              <tr style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '12px 16px', color: '#10b981', fontWeight: '700' }}>200 OK</td>
                <td style={{ padding: '12px 16px' }}>Verification completed successfully.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '12px 16px', color: '#f59e0b', fontWeight: '700' }}>400 Bad Request</td>
                <td style={{ padding: '12px 16px' }}>Missing required query parameter (e.g. <code>email</code>).</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '12px 16px', color: '#ef4444', fontWeight: '700' }}>401 Unauthorized</td>
                <td style={{ padding: '12px 16px' }}>API key missing in headers or query parameters.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '12px 16px', color: '#ef4444', fontWeight: '700' }}>403 Forbidden</td>
                <td style={{ padding: '12px 16px' }}>Invalid or revoked API key.</td>
              </tr>
              <tr>
                <td style={{ padding: '12px 16px', color: '#ef4444', fontWeight: '700' }}>429 Quota Exceeded</td>
                <td style={{ padding: '12px 16px' }}>Monthly request allocation reached for current billing cycle.</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}