import { GraphQLClient } from 'graphql-request';

import { getSdk } from '@src/lib/__generated/sdk';
import { endpoint } from 'codegen';

// Custom fetch that logs detailed error info for failed GraphQL calls
const debugFetch: typeof fetch = async (input: any, init?: any) => {
  const res = await fetch(input, init);
  if (!res.ok) {
    try {
      const text = await res.clone().text();
      // eslint-disable-next-line no-console
      console.error('[Contentful GraphQL Error]');
      // eslint-disable-next-line no-console
      console.error('Status:', res.status, res.statusText);
      // eslint-disable-next-line no-console
      console.error('Request ID:', res.headers.get('x-contentful-request-id'));
      // eslint-disable-next-line no-console
      console.error('Response body:', text);
      try {
        const json = JSON.parse(text);
        // eslint-disable-next-line no-console
        console.error('Parsed error:', JSON.stringify(json, null, 2));
      } catch {
        // Not JSON, that's fine
      }
    } catch {
      // eslint-disable-next-line no-console
      console.error('Contentful GraphQL request failed and response body could not be read');
    }
  }
  return res;
};

const graphQlClient = new GraphQLClient(endpoint, {
  headers: {
    Authorization: `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`,
  },
  fetch: debugFetch,
});

const previewGraphQlClient = new GraphQLClient(endpoint, {
  headers: {
    Authorization: `Bearer ${process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN}`,
  },
  fetch: debugFetch,
});

export const client = getSdk(graphQlClient);
export const previewClient = getSdk(previewGraphQlClient);
