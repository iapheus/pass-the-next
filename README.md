# PassTheNext - Smart & Secure Request Management

PassTheNext is a security middleware built with TypeScript for ExpressJS.

# Features

- Tracking and filtering incoming requests
- Live request monitoring using WebSocket
- JSON and MongoDB logging options
- Rate limiting based on API Token and IP Address
- General and per-route configuration options

# Future Plans

| Feature / Task                                               | Status         |
|--------------------------------------------------------------|----------------|
| Custom error messages for blocked users                      | In Progress   |
| Custom log messages instead of raw data                       | In Progress	 |
| SQLi and Reflected XSS detection                             | Not Started 	 |
---

## How to use in your APIs?

After installing PassTheNext, you need to configure it. You can do this from anywhere in your application, but we recommend placing the configuration in your ```index``` file where the server starts. If you prefer a global setup over route-specific usage—you can actually use both—you can start using it this way. Based on your configuration, the middleware can log, block, or simply wait. If you want to set route-specific configurations, for example:

- For ```GET /product/1```, you can set the rateLimit to allow 25 requests per user every 60 seconds.
- For ```POST /user/```, you might allow only 1 request per IP every 60 seconds.

We wouldn’t want malicious users creating hundreds of accounts per second, right?

```
// This is a global setting. If you don’t define specific rules for your endpoints, for example, the rate limit will be set to 5 requests per 60 seconds for all of them.

generalConfig({
	socketOptions: { socket: true, socketPort: 9009 },
	logOptions: { log: true, logMode: ['realtime', 'mongodb'] },
	mongodb: {
		connString: process.env.MONGODB_URL,
		dbName: process.env.MONGODB_NAME,
	},
	rateLimit: { maxRequest: 5, timeFrame: 60000 },
});
```
```
// Overrides the global setting and limits this specific endpoint to 1 request per 60 seconds.

app.get('/fetchBulkData', rateLimiter({maxRequest:1, timeFrame:60000}), (req, res) => {
	res.status(200).json({ success: true, data });
});
```
## What configurations can I make with this middleware?

PassTheNext has two configuration functions (for now). One is ```generalConfig```, which sets default values and controls middleware features across the API. The other is ```setRequestConfig```, which lets you define general settings for incoming requests. It takes the following values:

```
interface generalConfigOptions {
	socketOptions: { socket: boolean; socketPort: number };
	logOptions: { log: boolean; logMode: Array<'json' | 'mongodb' | 'realtime'> };
	mongodb?: { connString: string; dbName: string };
	rateLimit?: RateLimiterOptions;
}
```
❗The Rate Limiter is not a separate function❗ You use it as a value inside the general config function but you can define it as its own object and pass it in as an argument.
```
interface RateLimiterOptions {
	timeFrame?: number;
	maxRequest?: number;
	isToken?: boolean;
}
```
```
interface requestOptions {
  details: [];
  filters: Record<string, any>;
  actions: [];
}
```
For now, these are the available options. Set it once and forget it.

# License
[GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/)
