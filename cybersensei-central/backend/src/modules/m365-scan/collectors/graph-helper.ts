import { Logger } from '@nestjs/common';

const logger = new Logger('GraphHelper');

export interface GraphResponse<T = any> {
  value: T[];
  '@odata.nextLink'?: string;
}

export async function graphGet<T = any>(
  accessToken: string,
  endpoint: string,
  apiCallsCount: { count: number },
): Promise<T> {
  apiCallsCount.count++;
  const url = endpoint.startsWith('https://') ? endpoint : `https://graph.microsoft.com/v1.0${endpoint}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('Retry-After') || '10', 10);
    logger.warn(`Rate limited, waiting ${retryAfter}s`);
    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
    return graphGet(accessToken, endpoint, apiCallsCount);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Graph API error ${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function graphGetAll<T = any>(
  accessToken: string,
  endpoint: string,
  apiCallsCount: { count: number },
): Promise<T[]> {
  const results: T[] = [];
  let url = endpoint;

  while (url) {
    const data: GraphResponse<T> = await graphGet(accessToken, url, apiCallsCount);
    if (data.value) {
      results.push(...data.value);
    }
    url = data['@odata.nextLink'] || null;
  }

  return results;
}
