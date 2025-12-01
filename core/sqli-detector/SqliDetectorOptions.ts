export interface ISqliDetectorOptions {
	scanFor: Array<
		'body' | 'query' | 'params' | 'headers' | 'url' | 'path' | 'all'
	>;
}

let SqliDetectorOptions: ISqliDetectorOptions = {
	scanFor: ['all'],
};

export function getSqliDetectorOptions() {
	return {
		...SqliDetectorOptions,
	};
}

export function setSqliDetectorOptions(options: Partial<ISqliDetectorOptions>) {
	SqliDetectorOptions = {
		...SqliDetectorOptions,
		...options,
	};
}
