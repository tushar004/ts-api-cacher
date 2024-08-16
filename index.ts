export default class APIRequestCacher {
  private cache: Map<string, { promise: Promise<any>; timestamp: number }>;
  private cacheDuration: number;

  constructor(cacheDuration: number = 3) {
    this.cache = new Map();
    this.cacheDuration = cacheDuration; // Default cache duration is 3 seconds
  }

  public async request<T>(
    url: string,
    options: RequestInit = {},
    force: boolean = false
  ): Promise<T> {
    const cacheKey = `${options.method || "GET"}:${url}`;

    if (force) {
      return this._makeRequest<T>(url, options, cacheKey);
    }

    if (this.cache.has(cacheKey)) {
      const { promise, timestamp } = this.cache.get(cacheKey)!;
      const timeDiff = (Date.now() - timestamp) / 1000;

      // If the request was made less than the configured cache duration ago, return the cached promise
      if (timeDiff < this.cacheDuration) {
        return promise;
      }
    }

    // If no cache or cache is stale, make a new request
    return this._makeRequest<T>(url, options, cacheKey);
  }

  private async _makeRequest<T>(
    url: string,
    options: RequestInit,
    cacheKey: string
  ): Promise<T> {
    const promise = fetch(url, options)
      .then((response) => response.json() as Promise<T>)
      .catch((error) => {
        console.error("API Request Error:", error);
        throw error;
      });

    this.cache.set(cacheKey, { promise, timestamp: Date.now() });
    return promise;
  }
}
