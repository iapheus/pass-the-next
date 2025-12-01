export interface IXssDetectorOptions {
	scanFor: Array<
		'body' | 'query' | 'params' | 'headers' | 'url' | 'path' | 'all'
	>;
}

let XssDetectorOptions: IXssDetectorOptions = {
	scanFor: ['all'],
};

export function getXssDetectorOptions() {
	return {
		...XssDetectorOptions,
	};
}

export function setXssDetectorOptions(options: Partial<IXssDetectorOptions>) {
	XssDetectorOptions = {
		...XssDetectorOptions,
		...options,
	};
}
