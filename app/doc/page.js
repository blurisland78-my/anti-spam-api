import ReactSwagger from './ReactSwagger';

export const metadata = {
  title: 'API Documentation | Anti-Spam API',
  description: 'Interactive Swagger documentation for the Anti-Spam and Email Verification API.',
};

export default async function DocsPage() {
  // Fetch spec directly during SSR or provide static object
  const res = await fetch('https://anti-spam-api.vercel.app/api/docs/swagger.json', {
    cache: 'no-store',
  }).catch(() => null);

  const spec = res ? await res.json() : {};

  return (
    <main style={{ padding: '20px', backgroundColor: '#fff', minHeight: '100vh' }}>
      <ReactSwagger spec={spec} />
    </main>
  );
}