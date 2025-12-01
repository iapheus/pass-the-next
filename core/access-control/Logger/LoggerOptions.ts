export default interface ILoggerOptions {
	active: boolean;
	logMode: Array<'console' | 'json' | 'websocket' | 'mongodb' | 'postgresql'>;
	logDetails: Array<
		| 'baseUrl'
		| 'body'
		| 'cookies'
		| 'hostname'
		| 'ip'
		| 'ips'
		| 'method'
		| 'originalUrl'
		| 'params'
		| 'path'
		| 'protocol'
		| 'query'
		| 'secure'
		| 'signedCookies'
		| 'stale'
		| 'subdomains'
	>;
}

let DefaultLoggerOptions: ILoggerOptions = {
	active: true,
	logMode: ['console'],
	logDetails: ['method', 'ip', 'hostname', 'path'],
};

export function getLoggerOptions() {
	return {
		...DefaultLoggerOptions,
	};
}

export function setLoggerOptions(options: Partial<ILoggerOptions>) {
	DefaultLoggerOptions = {
		...DefaultLoggerOptions,
		...options,
	};
}
