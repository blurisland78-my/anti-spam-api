export default function SuccessPage({ searchParams }) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '100px 20px' }}>
      <h1 style={{ fontSize: '48px', color: '#10B981' }}>🎉 Payment Successful!</h1>
      <p style={{ fontSize: '18px', margin: '20px 0' }}>
        Thank you for purchasing the Anti-Spam API. Your API key has been automatically generated and bound to your account.
      </p>
      <p style={{ fontSize: '16px', color: '#666' }}>
        Check your email for confirmation, or head over to the documentation to start using your key.
      </p>
      <a
        href="/docs"
        style={{
          display: 'inline-block',
          marginTop: '30px',
          padding: '12px 24px',
          backgroundColor: '#000',
          color: '#fff',
          borderRadius: '6px',
          textDecoration: 'none',
        }}
      >
        Go to API Documentation
      </a>
    </div>
  );
}