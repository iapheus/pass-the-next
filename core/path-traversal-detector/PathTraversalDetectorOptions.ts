export interface IPathTraversalDetectorOptions {
	scanFor: Array<
		'body' | 'query' | 'params' | 'headers' | 'url' | 'path' | 'all'
	>;
}

let PathTraversalDetectorOptions: IPathTraversalDetectorOptions = {
	scanFor: ['all'],
};

export function getPathTraversalDetectorOptions() {
	return {
		...PathTraversalDetectorOptions,
	};
}

export function setPathTraversalDetectorOptions(
	options: Partial<IPathTraversalDetectorOptions>
) {
	PathTraversalDetectorOptions = {
		...PathTraversalDetectorOptions,
		...options,
	};
}
