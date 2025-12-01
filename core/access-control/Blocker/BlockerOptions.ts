import type ILoggerOptions from '../Logger/LoggerOptions';
import type IHttpHeaders from './IHttpHeaders';

export default interface IBlockerOptions {
	active: boolean;
	action: 'log' | 'block' | 'both';
	blockIfMatch: Array<Partial<IHttpHeaders>>;
	onlyAllow?: Partial<IHttpHeaders> | { 'IP Address'?: string };
	log?: Partial<ILoggerOptions>;
}

let BlockerOptions: IBlockerOptions = {
	active: true,
	action: 'both',
	blockIfMatch: [{ 'X-Forwarded-For': ['blockMe'] }],
	log: { logMode: ['console'] },
};

export function getBlockerOptions() {
	return {
		...BlockerOptions,
	};
}

export function setBlockerOptions(options: Partial<IBlockerOptions>) {
	BlockerOptions = {
		...BlockerOptions,
		...options,
	};
}
