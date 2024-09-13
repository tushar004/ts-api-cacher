import { from, Observable } from "rxjs";

export class APIRequestCacher {
  private cache: Map<string, { timestamp: number; data: any }> = new Map();
  private cacheDuration: number;
  private beforeRequestHooks: ((options: RequestInit) => void)[];
  private afterRequestHooks: ((response: any) => void)[];

  constructor(
    cacheDurationInSeconds: number = 3,
    beforeRequestHooks: ((options: RequestInit) => void)[] = [],
    afterRequestHooks: ((response: any) => void)[] = []
  ) {
    this.cacheDuration = cacheDurationInSeconds * 1000; // Convert seconds to milliseconds
    this.beforeRequestHooks = beforeRequestHooks;
    this.afterRequestHooks = afterRequestHooks;
  }

  private getCacheKey(url: string, options: RequestInit): string {
    const headersString = options.headers
      ? JSON.stringify(options.headers)
      : "";
    const method = options.method || "GET";
    const bodyString = options.body ? JSON.stringify(options.body) : "";
    return `${url}:${method}:${headersString}:${bodyString}`;
  }

  private isInCache(cacheKey: string): boolean {
    const cacheEntry = this.cache.get(cacheKey);
    if (!cacheEntry) return false;

    const isExpired = Date.now() - cacheEntry.timestamp > this.cacheDuration;
    if (isExpired) {
      this.cache.delete(cacheKey);
      return false;
    }

    return true;
  }

  private cacheResponse<T>(cacheKey: string, data: T): void {
    this.cache.set(cacheKey, { timestamp: Date.now(), data });
  }

  private executeBeforeRequestHooks(options: RequestInit): void {
    this.beforeRequestHooks.forEach((hook) => hook(options));
  }

  private executeAfterRequestHooks(response: any): void {
    this.afterRequestHooks.forEach((hook) => hook(response));
  }

  /**
   * GET request with caching support.
   */
  get<T>(
    url: string,
    options: RequestInit = {},
    force: boolean = false
  ): Promise<T> {
    return this.fetchWithCache<T>(url, { ...options, method: "GET" }, force);
  }

  /**
   * GET request with caching support returning an Observable.
   */
  getObservable<T>(
    url: string,
    options: RequestInit = {},
    force: boolean = false
  ): Observable<T> {
    return from(this.get<T>(url, options, force));
  }

  /**
   * POST request with caching support.
   */
  post<T>(
    url: string,
    body: any | null,
    options: RequestInit = {},
    force: boolean = false
  ): Promise<T> {
    return this.fetchWithCache<T>(
      url,
      { ...options, method: "POST", body: JSON.stringify(body) },
      force
    );
  }

  /**
   * POST request with caching support returning an Observable.
   */
  postObservable<T>(
    url: string,
    body: any | null,
    options: RequestInit = {},
    force: boolean = false
  ): Observable<T> {
    return from(this.post<T>(url, body, options, force));
  }

  /**
   * PUT request with caching support.
   */
  put<T>(
    url: string,
    body: any | null,
    options: RequestInit = {},
    force: boolean = false
  ): Promise<T> {
    return this.fetchWithCache<T>(
      url,
      { ...options, method: "PUT", body: JSON.stringify(body) },
      force
    );
  }

  /**
   * PUT request with caching support returning an Observable.
   */
  putObservable<T>(
    url: string,
    body: any | null,
    options: RequestInit = {},
    force: boolean = false
  ): Observable<T> {
    return from(this.put<T>(url, body, options, force));
  }

  /**
   * DELETE request with caching support.
   */
  delete<T>(
    url: string,
    options: RequestInit = {},
    force: boolean = false
  ): Promise<T> {
    return this.fetchWithCache<T>(url, { ...options, method: "DELETE" }, force);
  }

  /**
   * DELETE request with caching support returning an Observable.
   */
  deleteObservable<T>(
    url: string,
    options: RequestInit = {},
    force: boolean = false
  ): Observable<T> {
    return from(this.delete<T>(url, options, force));
  }

  /**
   * Common fetch method with caching support.
   */
  private fetchWithCache<T>(
    url: string,
    options: RequestInit,
    force: boolean = false
  ): Promise<T> {
    const cacheKey = this.getCacheKey(url, options);

    if (!force && this.isInCache(cacheKey)) {
      return Promise.resolve(this.cache.get(cacheKey)!.data);
    }

    // Execute before-request hooks, allowing options to be modified
    this.executeBeforeRequestHooks(options);

    return fetch(url, options)
      .then((response) => response.json())
      .then((data) => {
        // Cache the response
        this.cacheResponse(cacheKey, data);

        // Execute after-request hooks
        this.executeAfterRequestHooks(data);

        return data;
      });
  }
}
