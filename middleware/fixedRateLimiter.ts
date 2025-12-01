import type { NextFunction, Request, Response } from 'express';
import checkFixedRateLimit from '../core/rate-limiter/fixed/fixedRateLimiter';
import { readPreferences } from '../util/fileio';
import type FixedRateLimitResponse from '../core/rate-limiter/fixed/FixedRateLimitResponse';
import type ILoggerOptions from '../core/access-control/Logger/LoggerOptions';
import { getLoggerOptions } from '../core/access-control/Logger/LoggerOptions';
import logger from '../core/access-control/Logger/logger';
import {
	getFixedRateLimiterOptions,
	type IFixedRateLimiterOptions,
} from '../core/rate-limiter/fixed/FixedRateLimiterOptions';

export default function fixedRateLimiter(params?: {
	options?: Partial<IFixedRateLimiterOptions>;
	log?: Partial<ILoggerOptions>;
}) {
	return function (req: Request, res: Response, next: NextFunction) {
		const { ip, headers } = req;
		let results: FixedRateLimitResponse | undefined;

		let fixedRateLimitOptions: IFixedRateLimiterOptions =
			getFixedRateLimiterOptions();
		let loggerOptions: ILoggerOptions = getLoggerOptions();

		if (params?.options) {
			fixedRateLimitOptions = {
				...fixedRateLimitOptions,
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
			results = checkFixedRateLimit(
				headers.authorization,
				fixedRateLimitOptions
			);
		}

		if (!headers.authorization) {
			results = checkFixedRateLimit(ip!, fixedRateLimitOptions);
		}

		if (results && results.isRateLimited) {
			res.setHeader('Try-After', results.retryAfterSeconds);
			if (loggerOptions.active) {
				const isLogged = logger(
					req,
					{ service: 'Fixed Rate Limiter' },
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
