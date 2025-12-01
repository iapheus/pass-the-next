import type { NextFunction, Request, Response } from 'express';
import type ILoggerOptions from '../core/access-control/Logger/LoggerOptions';
import type IBlockerOptions from '../core/access-control/Blocker/BlockerOptions';
import { getBlockerOptions } from '../core/access-control/Blocker/BlockerOptions';
import logger from '../core/access-control/Logger/logger';
import { readPreferences } from '../util/fileio';
import { getLoggerOptions } from '../core/access-control/Logger/LoggerOptions';
import type IHttpHeaders from '../core/access-control/Blocker/IHttpHeaders';

export function accessControl(params?: {
	blocker?: Partial<IBlockerOptions>;
	logger?: Partial<ILoggerOptions>;
}) {
	return function (req: Request, res: Response, next: NextFunction) {
		let config: IBlockerOptions = getBlockerOptions();
		let loggerOptions: ILoggerOptions = getLoggerOptions();
		if (params?.blocker) {
			config = {
				...config,
				...params?.blocker,
			};
		}

		if (params?.logger) {
			loggerOptions = {
				...loggerOptions,
				...params?.logger,
			};
		}

		if (!config.active) return console.warn('Blocker is not active!');

		// Block If Match
		for (const eachRule of config.blockIfMatch) {
			for (const [key, value] of Object.entries(eachRule)) {
				const headerKey = key.toLowerCase();
				const reqHeaderValue = req.headers[headerKey];
				const ruleValueString = String(value);

				if (reqHeaderValue && String(reqHeaderValue) === ruleValueString) {
					if (loggerOptions.active) {
						const action = config.action;

						if (action === 'log' || action === 'both') {
							logger(
								req,
								{ service: 'Blocker - Block If Match', rule: key },
								loggerOptions
							);
						}

						if (action === 'block' || action === 'both') {
							const { success, data } = readPreferences('response');

							if (success && data && (data as any)['blocker']) {
								return res.status(400).json((data as any)['blocker']);
							} else {
								return res
									.status(400)
									.json({ success: false, error: 'Blocked!' });
							}
						}
					}
				}
			}
		}

		// Only Allow
		if (config?.onlyAllow) {
			const { success, data } = readPreferences('response');
			for (const [key, value] of Object.entries(config.onlyAllow)) {
				const lowerKey = key.toLowerCase();
				if (lowerKey == 'ip address' && req.ip != value) {
					if (loggerOptions.active) {
						const action = config.action;

						if (action == 'log' || action == 'both') {
							logger(
								req,
								{ service: 'Blocker - Only Allow', rule: 'IP Address' },
								loggerOptions
							);
						}
						if (action === 'block' || action === 'both') {
							const { success, data } = readPreferences('response');

							if (success && data && (data as any)['blocker']) {
								return res.status(400).json((data as any)['blocker']);
							} else {
								return res
									.status(400)
									.json({ success: false, error: 'Blocked!' });
							}
						}
					}
				}

				if (lowerKey == 'method') {
					type HttpMethod = NonNullable<IHttpHeaders['Method']>[number];
					if (!(value as HttpMethod[]).includes(req.method as HttpMethod)) {
						if (loggerOptions.active) {
							const action = config.action;

							if (action == 'log' || action == 'both') {
								logger(
									req,
									{ service: 'Blocker - Only Allow', rule: 'Method' },
									loggerOptions
								);
							}

							if (action === 'block' || action === 'both') {
								const { success, data } = readPreferences('response');

								if (success && data && (data as any)['blocker']) {
									return res.status(400).json((data as any)['blocker']);
								} else {
									return res
										.status(400)
										.json({ success: false, error: 'Blocked!' });
								}
							}
						}
						if (success && data && (data as any)['methodNotAllowed']) {
							return res.status(405).json((data as any)['methodNotAllowed']);
						} else
							return res
								.status(405)
								.json({ success: false, error: 'Method not allowed!' });
					}
				}

				if (lowerKey == 'content-length') {
					const [expected, comparator] = value as [string | number, string];
					const actual = Number(req.headers['content-length'] || 0);

					let allowed = false;
					switch (comparator) {
						case '=':
							allowed = Number(expected) == actual;
							break;
						case '<':
							allowed = Number(expected) < actual;
							break;
						case '>':
							allowed = Number(expected) > actual;
							break;
						case '<=':
							allowed = Number(expected) <= actual;
							break;
						case '>=':
							allowed = Number(expected) >= actual;
							break;
					}

					if (!allowed) {
						if (loggerOptions.active) {
							const action = config.action;

							if (action == 'log' || action == 'both') {
								logger(
									req,
									{ service: 'Blocker - Only Allow', rule: 'Content-Length' },
									loggerOptions
								);
							}

							if (action === 'block' || action === 'both') {
								const { success, data } = readPreferences('response');

								if (success && data && (data as any)['blocker']) {
									return res.status(400).json((data as any)['blocker']);
								} else {
									return res
										.status(400)
										.json({ success: false, error: 'Blocked!' });
								}
							}
						}
						if (success && data && (data as any)['contentLength']) {
							return res.status(400).json((data as any)['contentLength']);
						} else
							return res
								.status(400)
								.json({ success: false, error: 'Invalid content length!' });
					}
				}

				const headerValue = req.headers[lowerKey];
				if (headerValue && Array.isArray(value)) {
					if (!(value as string[]).includes(headerValue as string)) {
						if (loggerOptions.active) {
							const action = config.action;

							if (action == 'log' || action == 'both') {
								logger(
									req,
									{ service: 'Blocker - Only Allow', rule: lowerKey },
									loggerOptions
								);
							}

							if (action === 'block' || action === 'both') {
								const { success, data } = readPreferences('response');

								if (success && data && (data as any)['blocker']) {
									return res.status(400).json((data as any)['blocker']);
								} else {
									return res
										.status(400)
										.json({ success: false, error: 'Blocked!' });
								}
							}
						}
						if (success && data && (data as any)['dynamicBlocker']) {
							return res.status(400).json((data as any)['dynamicBlocker']);
						} else
							return res
								.status(400)
								.json({ success: false, error: 'Forbidden header!' });
					}
				}
			}
		}

		return next();
	};
}
