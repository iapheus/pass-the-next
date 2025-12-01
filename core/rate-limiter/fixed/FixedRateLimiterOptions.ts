export interface IFixedRateLimiterOptions {
	timeFrameSeconds: number;
	maxRequest: number;
	retryAfterSeconds: number;
}

let RateLimitOptions: IFixedRateLimiterOptions = {
	timeFrameSeconds: 60,
	maxRequest: 100,
	retryAfterSeconds: 60,
};

export function getFixedRateLimiterOptions() {
	return {
		...RateLimitOptions,
	};
}

export function setFixedRateLimiterOptions(
	options: Partial<IFixedRateLimiterOptions>
) {
	RateLimitOptions = {
		...RateLimitOptions,
		...options,
	};
}
