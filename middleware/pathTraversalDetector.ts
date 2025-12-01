import type { NextFunction, Request, Response } from 'express';
import type IBlockerOptions from '../core/access-control/Blocker/BlockerOptions';
import type ILoggerOptions from '../core/access-control/Logger/LoggerOptions';
import {
	getPathTraversalDetectorOptions,
	type IPathTraversalDetectorOptions,
} from '../core/path-traversal-detector/PathTraversalDetectorOptions';
import { getBlockerOptions } from '../core/access-control/Blocker/BlockerOptions';
import { getLoggerOptions } from '../core/access-control/Logger/LoggerOptions';
import { scanForPathTraversal } from '../core/path-traversal-detector/pathTraversalDetector';
import logger from '../core/access-control/Logger/logger';
import { readPreferences } from '../util/fileio';

export default function pathTraversalDetector(params?: {
	options?: Partial<IPathTraversalDetectorOptions>;
	accessControlOptions?: {
		blocker?: Partial<IBlockerOptions>;
		logger?: Partial<ILoggerOptions>;
	};
}) {
	return function (req: Request, res: Response, next: NextFunction) {
		let pathTraversalDetectorOptions: IPathTraversalDetectorOptions =
			getPathTraversalDetectorOptions();
		let blockerOptions: IBlockerOptions = getBlockerOptions();
		let loggerOptions: ILoggerOptions = getLoggerOptions();

		if (params?.options) {
			pathTraversalDetectorOptions = {
				...pathTraversalDetectorOptions,
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

		if (pathTraversalDetectorOptions.scanFor.includes('all')) {
			for (const [field, reqPart] of Object.entries(scanTargets)) {
				if (reqPart && !suspicious) {
					if (scanForPathTraversal(reqPart)) {
						suspicious = true;
						break;
					}
				}
			}
		} else {
			for (const field of pathTraversalDetectorOptions.scanFor) {
				const key = field as keyof typeof scanTargets;
				const reqPart = scanTargets[key];
				if (reqPart && !suspicious) {
					if (scanForPathTraversal(reqPart)) {
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
					{ service: 'Path Traversal Detector' },
					loggerOptions
				);
				!isLogged &&
					console.error('Something is going wrong with the logging.');
			}
			const { success, data } = readPreferences('response');
			if (success && data && (data as any)['pathTraversalDetected']) {
				return res.status(400).json((data as any)['pathTraversalDetected']);
			} else return res.status(400).json('Potential Path Traversal detected!');
		}

		return next();
	};
}
