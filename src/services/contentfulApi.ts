const CONTENTFUL_MANAGEMENT_API_BASE = 'https://api.contentful.com/spaces';

type SemanticSearchOptions = {
  contentTypeIds?: string[];
};

export class ContentfulApiService {
  private readonly spaceId: string;
  private readonly cmaToken: string;
  private readonly environmentId: string;
  private readonly baseUrl: string;

  constructor(spaceId: string, cmaToken: string, environmentId: string = 'master') {
    this.spaceId = spaceId;
    this.cmaToken = cmaToken;
    this.environmentId = environmentId;
    this.baseUrl = `${CONTENTFUL_MANAGEMENT_API_BASE}/${spaceId}/environments/${environmentId}`;
  }

  async semanticSearch(query: string, options: SemanticSearchOptions = {}) {
    const filter: { entityType: 'Entry'; contentTypeIds?: string[] } = { entityType: 'Entry' };
    if (Array.isArray(options.contentTypeIds) && options.contentTypeIds.length > 0) {
      filter.contentTypeIds = options.contentTypeIds;
    } else {
      filter.contentTypeIds = ['page'];
    }

    const requestBody = { query, filter } as const;

    const url = `${this.baseUrl}/semantic/search`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.cmaToken}`,
        'Content-Type': 'application/vnd.contentful.management.v1+json',
        'x-contentful-enable-alpha-feature': 'semantic-service',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Contentful API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

export default ContentfulApiService;
