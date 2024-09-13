# API Request cacher (TypeScript)

A TypeScript-based API request cacher that supports `GET`, `POST`, `PUT`, and `DELETE` requests with configurable caching to prevent duplicate requests within a short time frame.

## Features

- Supports `GET`, `POST`, `PUT`, and `DELETE` requests.
- **Caching**: Cache API responses for a configurable duration to reduce redundant requests.
- **Supports `Promise` and `Observable`**: Choose between `Promise`-based or `Observable`-based API calls.
- **Pre-request and Post-request Hooks**: Modify the request before it is sent and execute custom logic after receiving the response.
- Force option to bypass caching when needed.

## Installation

Install the package using npm:

```
npm install api-request-cacher-ts
```

## Usage

Usage

1.  ## Importing the APIRequestCacher

    To use the API request handler in your TypeScript project,
    start by importing the APIRequestCacher class:

    ```
    import \* as APIRequestCacher from 'api-request-handler-ts';
    ```

2.  ## Creating an Instance of APIRequestCacher

    When creating an instance of APIRequestCacher, you can configure the cache duration. By default, the cache duration is 3 seconds, but you can change this by passing a different value to the constructor.

    ```
    const apiHandler = new APIRequestCacher(5); // Custom cache duration of 5 seconds
    ```

    // or

    ```
    const apiHandler = new APIRequestCacher(); // Default cache duration of 3 seconds
    ```

3.  ## Basic Usage

    ### Example

    ```
    const apiCacher = new APIRequestCacher(5); // Cache duration set to 5 seconds

    // Using Promises
    apiCacher
      .get<{ data: string }>("https://api.example.com/data")
      .then((response) => console.log("GET Response (Promise):", response))
      .catch((error) => console.error("GET Error (Promise):", error));

    // Using Observables
    apiCacher
      .getObservable<{ data: string }>("https://api.example.com/data")
      .subscribe({
        next: (response) => console.log("GET Response (Observable):", response),
        error: (error) => console.error("GET Error (Observable):", error),
      });
    ```

    ### API Methods

    #### get<T>(url: string, options?: RequestInit, force?: boolean): Promise<T>

    Description: Makes a GET request with caching support.
    Parameters:
    url: The URL for the request.
    options: Optional RequestInit object to configure the request.
    force: When true, bypasses the cache and makes a fresh request.
    Returns: A Promise resolving to the response.

    #### getObservable<T>(url: string, options?: RequestInit, force?: boolean): Observable<T>

    Description: Makes a GET request with caching support, returning an Observable.
    Parameters: Same as get.
    Returns: An Observable emitting the response.

    ##### post<T>(url: string, body: any, options?: RequestInit, force?: boolean): Promise<T>

    Description: Makes a POST request with caching support.
    Parameters:
    url: The URL for the request.
    body: The body of the request.
    options: Optional RequestInit object to configure the request.
    force: When true, bypasses the cache and makes a fresh request.
    Returns: A Promise resolving to the response.

    #### postObservable<T>(url: string, body: any, options?: RequestInit, force?: boolean): Observable<T>

    Description: Makes a POST request with caching support, returning an Observable.
    Parameters: Same as post.
    Returns: An Observable emitting the response.

    #### put<T>(url: string, body: any, options?: RequestInit, force?: boolean): Promise<T>

    Description: Makes a PUT request with caching support.
    Parameters: Same as post.
    Returns: A Promise resolving to the response.

    #### putObservable<T>(url: string, body: any, options?: RequestInit, force?: boolean): Observable<T>

    Description: Makes a PUT request with caching support, returning an Observable.
    Parameters: Same as put.
    Returns: An Observable emitting the response.

    #### delete<T>(url: string, options?: RequestInit, force?: boolean): Promise<T>

    Description: Makes a DELETE request with caching support.
    Parameters: Same as get.
    Returns: A Promise resolving to the response.

    #### deleteObservable<T>(url: string, options?: RequestInit, force?: boolean): Observable<T>

    Description: Makes a DELETE request with caching support, returning an Observable.
    Parameters: Same as get.
    Returns: An Observable emitting the response.

4.  ## Force API Request (Bypassing Cache)

    If you want to force an API request regardless of caching, pass true as the third argument.

    ```
    apiHandler
      .request<{ data: string }>("https://api.example.com/data", {}, true)
      .then((response) => console.log(response.data))
      .catch((error) => console.error(error));
    ```

5.  ## Setting Up Hooks

    Hooks allow you to execute custom functions before and after the API requests are made.

    ### Hooks allow you to execute custom functions before and after the API requests are made.

    #### Example

    // Define hooks

    ```
    const beforeRequestHook = () => console.log("Before Request");
    const afterRequestHook = (response: any) =>
    console.log("After Request, Response:", response);
    ```

    // Create an instance with hooks

    ```
    const apiCacherWithHooks = new APIRequestCacher(
    5,
    [beforeRequestHook],
    [afterRequestHook]
    );
    ```

    // Example usage with hooks

    ```
    apiCacherWithHooks
    .get<{ data: string }>("https://api.example.com/data")
    .then((response) =>
    console.log("GET Response (Promise) with Hooks:", response)
    )
    .catch((error) => console.error("GET Error (Promise) with Hooks:", error));
    ```

    // Modifying the Request Headers or Body in Hooks

    ```
    import { APIRequestCacher } from "api-request-cacher-ts";

    // Hook to modify the request (e.g., adding a token to headers)
    const addAuthToken = (options: RequestInit) => {
    if (!options.headers) {
    options.headers = {};
    }
    (options.headers as Record<string, string>)["Authorization"] =
    "Bearer myToken";
    };

    // Hook to log the response after the request is made
    const logResponse = (response: any) => console.log("Response:", response);

    // Create an APIRequestCacher instance with hooks
    const apiCacher = new APIRequestCacher(5, [addAuthToken], [logResponse]);

    // Make a GET request, headers will include the Authorization token
    apiCacher
    .get<{ data: string }>("https://api.example.com/data")
    .then((response) => console.log("GET Response:", response))
    .catch((error) => console.error("Error:", error));
    ```

    // Observable Usage

    ```
    import { APIRequestCacher } from "api-request-cacher-ts";

    // Hook to modify the request (e.g., adding a token to headers)
    const addCustomHeader = (options: RequestInit) => {
    if (!options.headers) {
    options.headers = {};
    }
    (options.headers as Record<string, string>)["X-Custom-Header"] =
    "CustomValue";
    };

    // Hook to log the response
    const logResponse = (response: any) =>
    console.log("Response after API call:", response);

    // Create an instance of APIRequestCacher with hooks
    const apiCacher = new APIRequestCacher(3, [addCustomHeader], [logResponse]);

    // Making a GET request using Observable
    apiCacher
    .getObservable<{ data: string }>("https://api.example.com/data")
    .subscribe({
    next: (response) => console.log("GET Response (Observable):", response),
    error: (error) => console.error("Error:", error),
    });
    ```

## Configuration

```
constructor(
     cacheDurationInSeconds: number = 3,
     beforeRequestHooks: (() => void)[] = [],
     afterRequestHooks: ((response: any) => void)[] = []
     )
```

cacheDurationInSeconds: Duration (in seconds) to cache the API responses. Default is 3.
beforeRequestHooks: Array of functions to be executed before each API call.
afterRequestHooks: Array of functions to be executed after each API call, with the response passed as an argument.
