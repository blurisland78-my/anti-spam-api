export const spec = {
  openapi: '3.0.0',
  info: {
    title: 'Anti-Spam & Email Verification API',
    version: '1.0.0',
    description: 'High-performance email verification and disposable domain detection API.',
  },
  servers: [
    {
      url: 'https://anti-spam-api.vercel.app',
      description: 'Production Server',
    },
  ],
  paths: {
    '/api/v1/verify': {
      get: {
        summary: 'Verify an Email Address',
        description: 'Checks if an email domain is disposable and calculates a risk score.',
        parameters: [
          {
            name: 'email',
            in: 'query',
            required: true,
            description: 'The email address to verify (e.g., user@example.com)',
            schema: { type: 'string' },
          },
          {
            name: 'apikey',
            in: 'query',
            required: false,
            description: 'Your API Key (or pass x-api-key header)',
            schema: { type: 'string' },
          },
        ],
        security: [{ ApiKeyAuth: [] }],
        responses: {
          '200': {
            description: 'Verification Successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string' },
                    domain: { type: 'string' },
                    is_disposable: { type: 'boolean' },
                    risk_score: { type: 'integer' },
                    recommendation: { type: 'string', enum: ['ALLOW', 'BLOCK'] },
                  },
                },
              },
            },
          },
          '401': { description: 'Missing API Key' },
          '403': { description: 'Invalid API Key' },
          '429': { description: 'Rate Limit Exceeded' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
      },
    },
  },
};