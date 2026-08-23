import ReactSwagger from './ReactSwagger';
import { spec } from './spec';

export const metadata = {
  title: 'API Documentation | Anti-Spam API',
  description: 'Interactive Swagger documentation for the Anti-Spam and Email Verification API.',
};

export default function DocsPage() {
  return (
    <main style={{ padding: '20px', backgroundColor: '#fff', minHeight: '100vh' }}>
      <ReactSwagger spec={spec} />
    </main>
  );
}