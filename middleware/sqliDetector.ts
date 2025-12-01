import type { NextFunction, Request, Response } from 'express';
import type IBlockerOptions from '../core/access-control/Blocker/BlockerOptions';
import type ILoggerOptions from '../core/access-control/Logger/LoggerOptions';
import {
	getSqliDetectorOptions,
	type ISqliDetectorOptions,
} from '../core/sqli-detector/SqliDetectorOptions';
import { getBlockerOptions } from '../core/access-control/Blocker/BlockerOptions';
import { getLoggerOptions } from '../core/access-control/Logger/LoggerOptions';
import { scanForSqli } from '../core/sqli-detector/sqliDetector';
import logger from '../core/access-control/Logger/logger';
import { readPreferences } from '../util/fileio';

export default function sqliDetector(params?: {
	options?: Partial<ISqliDetectorOptions>;
	accessControlOptions?: {
		blocker?: Partial<IBlockerOptions>;
		logger?: Partial<ILoggerOptions>;
	};
}) {
	return function (req: Request, res: Response, next: NextFunction) {
		let sqliDetectorOptions: ISqliDetectorOptions = getSqliDetectorOptions();
		let blockerOptions: IBlockerOptions = getBlockerOptions();
		let loggerOptions: ILoggerOptions = getLoggerOptions();

		if (params?.options) {
			sqliDetectorOptions = {
				...sqliDetectorOptions,
				...params.options,
			};
		}

		if (params?.accessControlOptions?.blocker) {
			blockerOptions = {
				...blockerOptions,
				...params.accessControlOptions.blocker,
			};
		}

		if (params?.accessControlOptions?.logger) {
			loggerOptions = {
				...loggerOptions,
				...params.accessControlOptions.logger,
			};
		}

		const scanTargets = {
			body: req.body,
			query: req.query,
			headers: req.headers,
			params: req.params,
			path: req.path,
			url: req.url,
		};

		let suspicious = false;

		if (sqliDetectorOptions.scanFor.includes('all')) {
			for (const [field, reqPart] of Object.entries(scanTargets)) {
				if (reqPart && !suspicious) {
					if (scanForSqli(reqPart)) {
						suspicious = true;
						break;
					}
				}
			}
		} else {
			for (const field of sqliDetectorOptions.scanFor) {
				const key = field as keyof typeof scanTargets;
				const reqPart = scanTargets[key];
				if (reqPart && !suspicious) {
					if (scanForSqli(reqPart)) {
						suspicious = true;
						break;
					}
				}
			}
		}

		if (suspicious) {
			if (loggerOptions.active) {
				const isLogged = logger(
					req,
					{ service: 'SQLi Detector' },
					loggerOptions
				);
				!isLogged &&
					console.error('Something is going wrong with the logging.');
			}
			const { success, data } = readPreferences('response');
			if (success && data && (data as any)['sqliDetected']) {
				return res.status(400).json((data as any)['sqliDetected']);
			} else return res.status(400).json('Potential SQLi detected!');
		}

		return next();
	};
}
