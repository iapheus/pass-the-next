import type { Request, Response, NextFunction } from 'express';

import type IBlockerOptions from '../core/access-control/Blocker/BlockerOptions';
import type ILoggerOptions from '../core/access-control/Logger/LoggerOptions';
import { getBlockerOptions } from '../core/access-control/Blocker/BlockerOptions';
import { getLoggerOptions } from '../core/access-control/Logger/LoggerOptions';
import logger from '../core/access-control/Logger/logger';
import { readPreferences } from '../util/fileio';
import {
	getFuzzerDetectorOptions,
	type IFuzzerDetectorOptions,
} from '../core/fuzzer-detection/FuzzerDetectorOptions';
import fuzzerDetect from '../core/fuzzer-detection/fuzzerDetector';

export default function fuzzerDetector(params?: {
	options?: Partial<IFuzzerDetectorOptions>;
	accessControlOptions?: {
		blocker?: Partial<IBlockerOptions>;
		logger?: Partial<ILoggerOptions>;
	};
}) {
	return function (req: Request, res: Response, next: NextFunction) {
		const clientKey = req.ip!;
		let fuzzerDetectorOptions: IFuzzerDetectorOptions =
			getFuzzerDetectorOptions();
		let blockerOptions: IBlockerOptions = getBlockerOptions();
		let loggerOptions: ILoggerOptions = getLoggerOptions();

		if (params?.options) {
			fuzzerDetectorOptions = {
				...fuzzerDetectorOptions,
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

		const detector = fuzzerDetect(fuzzerDetectorOptions);

		if (detector.isBlocked(clientKey)) {
			if (loggerOptions.active) {
				const isLogged = logger(
					req,
					{ service: 'Fuzzer Detector' },
					loggerOptions
				);
				!isLogged &&
					console.error('Something is going wrong with the logging.');
			}
			const { success, data } = readPreferences('response');
			if (success && data && (data as any)['fuzzerDetected']) {
				return res.status(400).json((data as any)['fuzzerDetected']);
			} else return res.status(400).json('Potential Fuzzer detected!');
		}

		if (fuzzerDetectorOptions.statusCode.includes(res.statusCode)) {
			const blocked = detector.recordFailure(clientKey);
			if (blocked) {
				if (loggerOptions.active) {
					const isLogged = logger(
						req,
						{ service: 'Fuzzer Detector' },
						loggerOptions
					);
					!isLogged &&
						console.error('Something is going wrong with the logging.');
				}
				const { success, data } = readPreferences('response');
				if (success && data && (data as any)['fuzzerDetected']) {
					return res.status(400).json((data as any)['fuzzerDetected']);
				} else return res.status(400).json('Potential Fuzzer detected!');
			}
		}

		return next();
	};
}
