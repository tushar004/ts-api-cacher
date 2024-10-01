import CryptoJS from "crypto-js";
import { Observable, from } from "rxjs";

export class APIRequestCacher {
  private cache: Map<string, { timestamp: number; data: any }> = new Map();
  private cacheDuration: number;
  private beforeRequestHooks: ((options: RequestInit) => void)[];
  private afterRequestHooks: ((response: any) => void)[];
  private encryptionKey: string | null;
  private encryptRequests: boolean;

  constructor(
    cacheDurationInSeconds: number = 3,
    beforeRequestHooks: ((options: RequestInit) => void)[] = [],
    afterRequestHooks: ((response: any) => void)[] = [],
    encryptionKey: string | null = null, // Optional encryption key
    encryptRequests: boolean = false // Optional flag to enable/disable encryption
  ) {
    this.cacheDuration = cacheDurationInSeconds * 1000; // Convert seconds to milliseconds
    this.beforeRequestHooks = beforeRequestHooks;
    this.afterRequestHooks = afterRequestHooks;
    this.encryptionKey = encryptionKey;
    this.encryptRequests = encryptRequests;
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
   * Encrypts the request body if an encryption key is provided and encryption is enabled.
   */
  private encryptRequestBody(body: any): string | null {
    if (!this.encryptionKey || !this.encryptRequests || !body) return body;

    const encryptedBody = CryptoJS.AES.encrypt(
      JSON.stringify(body),
      this.encryptionKey
    ).toString();
    return encryptedBody;
  }

  /**
   * Decrypts the response body if encryption is enabled.
   */
  private decryptResponseBody(encryptedBody: string): any {
    if (!this.encryptionKey || !this.encryptRequests) return encryptedBody;

    const bytes = CryptoJS.AES.decrypt(encryptedBody, this.encryptionKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  }

  /**
   * GET request with caching and optional encryption support.
   */
  get<T>(
    url: string,
    options: RequestInit = {},
    force: boolean = false
  ): Promise<T> {
    return this.fetchWithCache<T>(url, { ...options, method: "GET" }, force);
  }

  /**
   * GET request with caching and optional encryption support returning an Observable.
   */
  getObservable<T>(
    url: string,
    options: RequestInit = {},
    force: boolean = false
  ): Observable<T> {
    return from(this.get<T>(url, options, force));
  }

  /**
   * POST request with caching and optional encryption support.
   */
  post<T>(
    url: string,
    body: any | null,
    options: RequestInit = {},
    force: boolean = false
  ): Promise<T> {
    const encryptedBody = this.encryptRequestBody(body);
    return this.fetchWithCache<T>(
      url,
      { ...options, method: "POST", body: encryptedBody },
      force
    );
  }

  /**
   * POST request with caching and optional encryption support returning an Observable.
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
   * PUT request with caching and optional encryption support.
   */
  put<T>(
    url: string,
    body: any | null,
    options: RequestInit = {},
    force: boolean = false
  ): Promise<T> {
    const encryptedBody = this.encryptRequestBody(body);
    return this.fetchWithCache<T>(
      url,
      { ...options, method: "PUT", body: encryptedBody },
      force
    );
  }

  /**
   * PUT request with caching and optional encryption support returning an Observable.
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
   * DELETE request with caching and optional encryption support.
   */
  delete<T>(
    url: string,
    options: RequestInit = {},
    force: boolean = false
  ): Promise<T> {
    return this.fetchWithCache<T>(url, { ...options, method: "DELETE" }, force);
  }

  /**
   * DELETE request with caching and optional encryption support returning an Observable.
   */
  deleteObservable<T>(
    url: string,
    options: RequestInit = {},
    force: boolean = false
  ): Observable<T> {
    return from(this.delete<T>(url, options, force));
  }

  /**
   * Common fetch method with caching and optional encryption support.
   */
  private fetchWithCache<T>(
    url: string,
    options: RequestInit,
    force: boolean = false
  ): Promise<T> {
    const cacheKey = this.getCacheKey(url, options);

    if (!force && this.isInCache(cacheKey)) {
      return Promise.resolve(this.cache.get(cacheKey)?.data);
    }

    this.executeBeforeRequestHooks(options);

    return fetch(url, options)
      .then((response) => response.text())
      .then((text) => {
        const responseBody = this.encryptRequests
          ? this.decryptResponseBody(text)
          : JSON.parse(text);
        this.cacheResponse(cacheKey, responseBody);
        this.executeAfterRequestHooks(responseBody);
        return responseBody;
      });
  }
}
