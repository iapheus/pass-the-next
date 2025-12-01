export interface ISlidingRateLimiterOptions {
	timeFrameSeconds: number;
	maxRequest: number;
	retryAfterSeconds: number;
}

let RateLimitOptions: ISlidingRateLimiterOptions = {
	timeFrameSeconds: 60,
	maxRequest: 100,
	retryAfterSeconds: 60,
};

export function getSlidingRateLimiterOptions() {
	return {
		...RateLimitOptions,
	};
}

export function setSlidingRateLimiterOptions(
	options: Partial<ISlidingRateLimiterOptions>
) {
	RateLimitOptions = {
		...RateLimitOptions,
		...options,
	};
}
