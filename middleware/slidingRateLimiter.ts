import type { NextFunction, Request, Response } from 'express';
import checkSlidingRateLimit from '../core/rate-limiter/sliding/slidingRateLimiter';
import type SlidingRateLimitResponse from '../core/rate-limiter/sliding/SlidingRateLimitResponse';
import type ILoggerOptions from '../core/access-control/Logger/LoggerOptions';
import { readPreferences } from '../util/fileio';
import logger from '../core/access-control/Logger/logger';
import { getLoggerOptions } from '../core/access-control/Logger/LoggerOptions';
import {
	getSlidingRateLimiterOptions,
	type ISlidingRateLimiterOptions,
} from '../core/rate-limiter/sliding/SlidingRateLimiterOptions';

export default function slidingRateLimiter(params?: {
	options?: Partial<ISlidingRateLimiterOptions>;
	log?: Partial<ILoggerOptions>;
}) {
	return function (req: Request, res: Response, next: NextFunction) {
		const { ip, headers } = req;
		let results: SlidingRateLimitResponse | undefined;

		let slidingRateLimitOptions: ISlidingRateLimiterOptions =
			getSlidingRateLimiterOptions();
		let loggerOptions: ILoggerOptions = getLoggerOptions();

		if (params?.options) {
			slidingRateLimitOptions = {
				...slidingRateLimitOptions,
				...params?.options,
			};
		}

		if (params?.log) {
			loggerOptions = {
				...loggerOptions,
				...params?.log,
			};
		}

		if (!!headers.authorization) {
			results = checkSlidingRateLimit(
				headers.authorization,
				slidingRateLimitOptions
			);
		}

		if (!headers.authorization) {
			results = checkSlidingRateLimit(ip!, slidingRateLimitOptions);
		}

		if (results && results.isRateLimited) {
			res.setHeader('Try-After', results.retryAfterSeconds);
			if (loggerOptions.active) {
				const isLogged = logger(
					req,
					{ service: 'Sliding Rate Limiter' },
					loggerOptions
				);
				!isLogged &&
					console.error('Something is going wrong with the logging.');
			}

			const { success, data } = readPreferences('response');
			if (success && data && (data as any)['rateLimit']) {
				return res.status(400).json((data as any)['rateLimit']);
			} else return res.status(400).json('Rate limited!');
		}

		next();
	};
}
