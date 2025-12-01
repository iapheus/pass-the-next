export interface IFuzzerDetectorOptions {
	maxTry: number;
	blockDurationSeconds: number;
	statusCode: Array<number>;
}

let FuzzerDetectorOptions: IFuzzerDetectorOptions = {
	maxTry: 10,
	blockDurationSeconds: 60 * 1000,
	statusCode: [404, 403, 401],
};

export function getFuzzerDetectorOptions() {
	return {
		...FuzzerDetectorOptions,
	};
}

export function setFuzzerDetectorOptions(
	options: Partial<IFuzzerDetectorOptions>
) {
	FuzzerDetectorOptions = {
		...FuzzerDetectorOptions,
		...options,
	};
}
