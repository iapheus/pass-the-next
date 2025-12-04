# PassTheNext - Smart & Secure Request Management

PassTheNext is a security solution that works as middleware or as a WAF with a proxy gateway. It's built with TypeScript and ExpressJS.

# Features

- Can be used as middleware or WAF
- Tracking, filtering and blocking incoming requests
  	- Based on commonly used HTTP Headers and IP Address
- Live request monitoring using WebSocket
- MongoDB, PostgreSQL and JSON logging options
- Rate limiting based on API Token and IP Address
  - Sliding and Fixed Rate limiting options
- XSS, SQL Injection and Path Traversal Detection
  - Searches in the request body, headers and url
- Fuzzer detection with specific HTTP status codes
- Customizable both log and error messages
- General and per-route configuration options

# Future Plans

| Feature / Task                                               | Status         |
|--------------------------------------------------------------|----------------|
| Custom error messages for blocked users                      | [Done (v2)](https://github.com/iapheus/pass-the-next) |
| Custom log messages instead of raw data                       | [Done (v2)](https://github.com/iapheus/pass-the-next)	 |
| SQLi and Reflected XSS detection                             | [Done (v2)](https://github.com/iapheus/pass-the-next) 	 |
| Detailed documentation                        | In Progress	 |
| UI for log tracking and customization                        | In Progress	 |
---

## WAF Mode
PassTheNext has the ability to run in WAF (Web Application Firewall) mode. With this feature, you can protect your applications more efficiently compared to middleware usage. In this mode, PassTheNext acts as a proxy gateway, inspecting, filtering, and blocking user requests before they reach your backend. This prevents unnecessary load on the backend servers where your critical services run.

### Features

- Free from ExpressJS dependency, you can use it with any programming language or framework.

	- After running on a NodeJS supported server, you can develop applications in any framework or language at the redirected address.

- The backend address where you perform critical operations remain hidden. Clients will only see the proxy address.

- Requests that are blocked will never reach your backend, preventing unnecessary traffic and avoiding performance loss.

### Request Flow: WAF & Middleware
<p align="center">
  <img src="https://raw.githubusercontent.com/iapheus/pass-the-next/refs/heads/main/examples/images/proxy.png" height="150" style="display:inline-block;"/>
  <img src="https://raw.githubusercontent.com/iapheus/pass-the-next/refs/heads/main/examples/images/middleware.png" height="150" style="display:inline-block;"/>
</p>

### Using as a WAF

- [Check out this example](https://github.com/iapheus/pass-the-next/blob/main/examples/proxy-gateway/server.ts)

## Using as Middleware

After the configuration process, you can use it just like any other middleware.

### 1 – Application-wide

```
app.use(xssDetector());
```

```
app.use(xssDetector({options:{scanFor:['query']}}));
```

### 2- Route specific

```
app.get('/products', xssDetector(), (req,res) => {return res.status(200)})
```

```
app.get('/products', xssDetector({options:{scanFor:['query']}}), (req,res) => {return res.status(200)})
```

### 3- Hybrid

While only the ‘query’ will be scanned in the rest of the application, only the headers will be scanned at the ‘/products’ endpoint.

```
app.use(xssDetector({options:{scanFor:['query']}}));
```

```
app.get('/products', xssDetector({options:{scanFor:['headers']}}), (req,res) => {return res.status(200)})
```

[Check out this example.](https://github.com/iapheus/pass-the-next/blob/main/examples/middleware/server.ts)

For now, these are the available options. Set it once and forget it.

## Feature Configuration

After installing PassTheNext, you need to configure it. You can do this from anywhere in your application, but we recommend placing the configuration in your ```index``` file where the server starts. Each feature has 3 different ways to define settings.

### 1 - Default settings
These are the settings that come by default when the middleware runs. If you do not override them using the methods below, these settings will apply either throughout your entire application when using app.use(), or only for the specific endpoint if you apply them on an endpoint basis.

```app.use(fixedRateLimiter())```

### 2 - Overriding default settings globally in the application

Schema and default settings for Fixed Rate Limiter
```
export interface IFixedRateLimiterOptions {
	timeFrameSeconds: number;
	maxRequest: number;
	retryAfterSeconds: number;
}

let RateLimitOptions: IFixedRateLimiterOptions = {
	timeFrameSeconds: 60,
	maxRequest: 100,
	retryAfterSeconds: 60,
};
```
Override function — this function starts with the name of each feature.
```
setFixedRateLimiterOptions({timeFrameSeconds:120, maxRequest:50})
```
You do not have to provide a full schema to this function; it also accepts partial input. In the example above, we only overrode “timeFrameSeconds” and “maxRequest”, which means that the “retryAfterSeconds” value will remain as the default.

### 3 – Overriding settings specifically for an endpoint

``` app.get('/products',fixedRateLimiter({maxRequest:25}), (req,res) => { return res.status(200) }); ```

In this way, you only override for that specific endpoint. It will not affect the rest of the application.

# License and Attribution
This project uses;
- [Typescript](https://www.npmjs.com/package/typescript)
- [Express](https://www.npmjs.com/package/express)
- [Mongoose](https://www.npmjs.com/package/mongoose)
- [Node-Postgres](https://www.npmjs.com/package/pg)
- [http-proxy-middleware](https://www.npmjs.com/package/http-proxy-middleware)
- [WS](https://www.npmjs.com/package/ws)
- [Dotenv](https://www.npmjs.com/package/dotenv)

[GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/)
