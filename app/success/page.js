'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [apiKey, setApiKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      setErrorMsg('No checkout session found.');
      return;
    }

    let attempts = 0;
    const fetchKey = async () => {
      try {
        const res = await fetch(`/api/get-key?session_id=${sessionId}`);
        const data = await res.json();

        if (res.ok && data.apiKey) {
          setApiKey(data.apiKey);
          setLoading(false);
        } else if (res.status === 202 && attempts < 5) {
          // Retry up to 5 times if webhook is still processing
          attempts++;
          setTimeout(fetchKey, 2000);
        } else {
          setErrorMsg(data.message || 'Could not retrieve key.');
          setLoading(false);
        }
      } catch (err) {
        setErrorMsg('Error fetching your API key.');
        setLoading(false);
      }
    };

    fetchKey();
  }, [sessionId]);

  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto', backgroundColor: '#0f172a', padding: '40px', borderRadius: '16px', border: '1px solid #1e293b', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
      <h1 style={{ fontSize: '30px', fontWeight: '800', marginBottom: '8px' }}>Payment Successful!</h1>
      <p style={{ color: '#94a3b8', marginBottom: '32px' }}>Thank you for subscribing. Your API access is now active.</p>

      {loading ? (
        <div style={{ padding: '30px', color: '#38bdf8' }}>Generating your secure API key...</div>
      ) : errorMsg ? (
        <div style={{ color: '#ef4444', padding: '20px' }}>{errorMsg}</div>
      ) : (
        <>
          <div style={{ backgroundColor: '#0a0f1d', padding: '24px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '24px', textAlign: 'left' }}>
            <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '700', letterSpacing: '0.5px' }}>YOUR LIVE API KEY</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '10px' }}>
              <code style={{ fontSize: '14px', color: '#10b981', wordBreak: 'break-all', fontFamily: 'monospace' }}>{apiKey}</code>
              <button
                onClick={handleCopy}
                style={{ padding: '10px 18px', backgroundColor: copied ? '#10b981' : '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {copied ? '✓ Copied' : 'Copy Key'}
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '8px', textAlign: 'left', color: '#fca5a5', fontSize: '14px', lineHeight: '1.5' }}>
            ⚠️ <strong>Important:</strong> Please copy and store this API key safely in your application environment (e.g., <code>.env</code> file). For security reasons, this key will not be displayed again.
          </div>

          <div style={{ marginTop: '32px' }}>
            <a href="/docs" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: '600' }}>
              View API Documentation & Integration Code →
            </a>
          </div>
        </>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div style={{ backgroundColor: '#0a0f1d', color: '#f8fafc', minHeight: '100vh', padding: '60px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <Suspense fallback={<div style={{ textAlign: 'center', color: '#94a3b8' }}>Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}