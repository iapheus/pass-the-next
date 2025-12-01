import type { NextFunction, Request, Response } from 'express';
import scanForXss from '../core/xss-detector/xssDetector';
import {
	getXssDetectorOptions,
	type IXssDetectorOptions,
} from '../core/xss-detector/XssDetectorOptions';
import type IBlockerOptions from '../core/access-control/Blocker/BlockerOptions';
import type ILoggerOptions from '../core/access-control/Logger/LoggerOptions';
import { getBlockerOptions } from '../core/access-control/Blocker/BlockerOptions';
import { getLoggerOptions } from '../core/access-control/Logger/LoggerOptions';
import { readPreferences } from '../util/fileio';
import logger from '../core/access-control/Logger/logger';

export default function xssDetector(params?: {
	options?: Partial<IXssDetectorOptions>;
	accessControlOptions?: {
		blocker?: Partial<IBlockerOptions>;
		logger?: Partial<ILoggerOptions>;
	};
}) {
	return function (req: Request, res: Response, next: NextFunction) {
		let xssDetectorOptions: IXssDetectorOptions = getXssDetectorOptions();
		let blockerOptions: IBlockerOptions = getBlockerOptions();
		let loggerOptions: ILoggerOptions = getLoggerOptions();

		if (params?.options) {
			xssDetectorOptions = {
				...xssDetectorOptions,
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

		if (xssDetectorOptions.scanFor.includes('all')) {
			for (const [field, reqPart] of Object.entries(scanTargets)) {
				if (reqPart && !suspicious) {
					if (scanForXss(reqPart)) {
						suspicious = true;
						break;
					}
				}
			}
		} else {
			for (const field of xssDetectorOptions.scanFor) {
				const key = field as keyof typeof scanTargets;
				const reqPart = scanTargets[key];
				if (reqPart && !suspicious) {
					if (scanForXss(reqPart)) {
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
					{ service: 'Xss Detector' },
					loggerOptions
				);
				!isLogged &&
					console.error('Something is going wrong with the logging.');
			}
			const { success, data } = readPreferences('response');
			if (success && data && (data as any)['xssDetected']) {
				return res.status(400).json((data as any)['xssDetected']);
			} else return res.status(400).json('Potential XSS detected!');
		}

		return next();
	};
}
