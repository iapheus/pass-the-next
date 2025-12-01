import express from 'express';

import { accessControl } from '../middleware/accessControl';
import fixedRateLimiter from '../middleware/fixedRateLimiter';
import slidingRateLimiter from '../middleware/slidingRateLimiter';
import sqliDetector from '../middleware/sqliDetector';
import xssDetector from '../middleware/xssDetector';
import pathTraversalDetector from '../middleware/pathTraversalDetector';
import fuzzerDetector from '../middleware/fuzzerDetector';
import { setLoggerOptions } from '../core/access-control/Logger/LoggerOptions';

import dotenv from 'dotenv';
dotenv.config({ quiet: true });

const app = express();

app.use(fixedRateLimiter());
app.use(slidingRateLimiter());
app.use(sqliDetector());
app.use(xssDetector());
app.use(pathTraversalDetector());
app.use(fuzzerDetector());

setLoggerOptions({ logMode: ['console', 'json'] });

app.listen(3434, () => {
	console.log('Gateway active!');
});

app.get(
	'/admin',
	accessControl({
		blocker: { action: 'both', onlyAllow: { 'IP Address': '::1' } },
	}),
	(req, res) => {
		return res.status(200).json({ success: true });
	}
);
