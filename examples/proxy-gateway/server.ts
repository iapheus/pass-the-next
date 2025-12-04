import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import {
	accessControl,
	fixedRateLimiter,
	slidingRateLimiter,
	sqliDetector,
	xssDetector,
	pathTraversalDetector,
	fuzzerDetector,
	setLoggerOptions,
	setFixedRateLimiterOptions,
	setSlidingRateLimiterOptions,
} from '../../index';

import dotenv from 'dotenv';
dotenv.config({ quiet: true });

const app = express();

app.use(fixedRateLimiter());
app.use(slidingRateLimiter());
app.use(sqliDetector());
app.use(xssDetector({ options: { scanFor: ['headers'] } }));
app.use(pathTraversalDetector());
app.use(fuzzerDetector());

setLoggerOptions({ logMode: ['console', 'json'] });
setFixedRateLimiterOptions({});
setSlidingRateLimiterOptions({ maxRequest: 5 });

const proxy = createProxyMiddleware({
	target: 'http://localhost:5000',
	changeOrigin: true,
	pathRewrite: { '^/api': '' },
});

app.use('/api', proxy);

app.listen(3434, () => {
	console.log('Gateway listening on port 3434.');
});

app.get(
	'/admin',
	accessControl({
		blocker: { action: 'both', onlyAllow: { 'IP Address': '::1' } },
		logger: { logMode: ['console', 'json'] },
	}),
	(req, res) => {
		return res.status(200).json({ success: true });
	}
);
