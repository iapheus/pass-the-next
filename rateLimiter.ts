import type { NextFunction, Request, Response } from 'express';
import {generalRateLimitOptions} from './config/general-cfg.js';

export interface RateLimiterOptions {
	timeFrame?: number;
	maxRequest?: number;
	isToken?:boolean;
}

export function rateLimiter(options: RateLimiterOptions = {}) {
	const windowMs  = options.timeFrame ?? generalRateLimitOptions?.timeFrame == undefined ?  60000: generalRateLimitOptions?.timeFrame;
	const max   = options.maxRequest ?? generalRateLimitOptions?.maxRequest == undefined ? 5 : generalRateLimitOptions?.maxRequest;
	const isToken = options.isToken ?? generalRateLimitOptions?.isToken == undefined ? false : generalRateLimitOptions?.isToken;

	const store = new Map<string, { count: number; windowStart: number }>();

	return function (req: Request, res: Response, next: NextFunction) {
		const now = Date.now();
		const authToken = req.headers['authorization'] != undefined ? req.headers['authorization'] : undefined;
		const key = isToken && authToken != undefined ? req.headers['authorization'] : req.ip;

		if(isToken && authToken == undefined ) console.log('Authorization header is missing, rate limiting will continue with IP Address')

		let entry = store.get(key);
		if (!entry) {
			entry = { count: 1, windowStart: now };
			store.set(key, entry);
		} else {
			if (now - entry.windowStart > windowMs) {
				entry.count = 1;
				entry.windowStart = now;
			} else {
				entry.count++;
			}
		}

		if (entry.count > max) {
			const retryAfter    = Math.ceil((windowMs - (now - entry.windowStart)) / 1000);
			res.set('Retry-After', String(retryAfter));
			return res
			  .status(429)
			  .json({ status: false, message: 'Too many requests. Please try again later.' });
		}

		next();
	};
}
