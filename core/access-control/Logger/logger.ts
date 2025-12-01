import type { Request } from 'express';
import { saveLog } from '../../../util/fileio';
import type ILoggerOptions from './LoggerOptions';
import { getLoggerOptions } from './LoggerOptions';
import prettyConsole from '../../../util/prettyConsole';
import saveMongoLog from '../database/MongoDB/SaveMongoLog';
import savePostgreLog from '../database/PostgreSQL/SavePostgreLog';
import broadcast from '../WebSocket/WSBroadcast';

export default function logger(
	req: Request,
	extra: { service: string; rule?: string },
	options?: Partial<ILoggerOptions>
): boolean {
	const now = new Date();
	const timestamp = now.toLocaleTimeString('tr-TR', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	});

	let config: ILoggerOptions = getLoggerOptions();

	if (options) {
		config = { ...config, ...options };
	}

	if (!config.active || config.logMode.length == 0) {
		return false;
	}

	let details: { [key: string]: string } = {};
	config.logDetails.forEach((detail) => {
		details[detail] = req[detail];
	});

	details = {
		timestamp: timestamp,
		service: extra.service,
		...(extra.rule && { rule: extra.rule }),
		...details,
	};

	if (config.logMode.includes('console')) prettyConsole(details);
	if (config.logMode.includes('websocket')) broadcast(details);
	if (config.logMode.includes('json')) saveLog(details);
	if (config.logMode.includes('mongodb')) saveMongoLog(details);
	if (config.logMode.includes('postgresql')) savePostgreLog(details);

	return true;
}
