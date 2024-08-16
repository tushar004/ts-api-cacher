# API Request cacher (TypeScript)

A TypeScript-based API request cacher that supports `GET`, `POST`, `PUT`, and `DELETE` requests with configurable caching to prevent duplicate requests within a short time frame.

## Features

- Supports `GET`, `POST`, `PUT`, and `DELETE` requests.
- Configurable caching to prevent duplicate API calls within a specified duration.
- Force option to bypass caching when needed.

## Installation

Install the package using npm:

npm install api-request-cacher-ts

## Usage

Usage

1. Importing the APIRequestCacher

   To use the API request handler in your TypeScript project, start by importing the APIRequestCacher class:
   import \* as APIRequestCacher from 'api-request-handler-ts';

2. Creating an Instance of APIRequestCacher

   When creating an instance of APIRequestCacher, you can configure the cache duration. By default, the cache duration is 3 seconds, but you can change this by passing a different value to the constructor.

   const apiHandler = new APIRequestCacher(5); // Custom cache duration of 5 seconds
   // or
   const apiHandler = new APIRequestCacher(); // Default cache duration of 3 seconds

3. Making API Requests

   GET Request
   Perform a GET request to fetch data from an API.

   apiHandler.request<{ data: string }>('https://api.example.com/data')
   .then(response => console.log(response.data))
   .catch(error => console.error(error));

   POST Request
   Perform a POST request to send data to an API.
   apiHandler.request<{ success: boolean }>('https://api.example.com/data', {
   method: 'POST',
   headers: {
   'Content-Type': 'application/json',
   },
   body: JSON.stringify({ key: 'value' })
   })
   .then(response => console.log(response.success))
   .catch(error => console.error(error));

   PUT Request
   Perform a PUT request to update data on the server.
   apiHandler.request<{ updated: boolean }>('https://api.example.com/data/1', {
   method: 'PUT',
   headers: {
   'Content-Type': 'application/json',
   },
   body: JSON.stringify({ key: 'newValue' })
   })
   .then(response => console.log(response.updated))
   .catch(error => console.error(error));

   DELETE Request
   Perform a DELETE request to remove data from the server.
   apiHandler.request<{ deleted: boolean }>('https://api.example.com/data/1', {
   method: 'DELETE',
   })
   .then(response => console.log(response.deleted))
   .catch(error => console.error(error));

4. Force API Request (Bypassing Cache)

   If you want to force an API request regardless of caching, pass true as the third argument.
   apiHandler.request<{ data: string }>('https://api.example.com/data', {}, true)
   .then(response => console.log(response.data))
   .catch(error => console.error(error));

## Configuration

Cache Duration: You can configure the cache duration (in seconds) when creating an instance of APIRequestHandler. This determines how long a response is cached before a new request is made.

Force Option: The force parameter, when set to true, bypasses the cache and makes a new API call.
