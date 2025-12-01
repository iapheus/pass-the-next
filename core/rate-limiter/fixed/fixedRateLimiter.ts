import {
	getFixedRateLimiterOptions,
	type IFixedRateLimiterOptions,
} from './FixedRateLimiterOptions';
import type FixedRateLimitResponse from './FixedRateLimitResponse';

const rateLimitStore = new Map<string, { count: number; expiry: number }>();

export default function checkFixedRateLimit(
	key: string,
	options?: Partial<IFixedRateLimiterOptions>
): FixedRateLimitResponse {
	const now: number = Date.now();
	let config: IFixedRateLimiterOptions = getFixedRateLimiterOptions();
	let currentCount: number = 0;
	let expiryTime: number = 0;

	if (options) {
		config = {
			...config,
			...options,
		};
	}

	const userData = rateLimitStore.get(key);

	if (userData && now < userData.expiry) {
		expiryTime = userData.expiry;
		currentCount = userData.count + 1;
	} else {
		expiryTime = now + config.timeFrameSeconds * 1000;
		currentCount = 1;
	}

	rateLimitStore.set(key, { count: currentCount, expiry: expiryTime });

	const remainingRequests: number = Math.max(
		0,
		config.maxRequest - currentCount
	);
	const isRateLimited: boolean = remainingRequests == 0;

	const retryAfterSeconds = Math.max(0, Math.ceil(expiryTime - now) / 1000);

	if (isRateLimited) {
		return {
			isRateLimited: true,
			remainingRequests: 0,
			retryAfterSeconds: retryAfterSeconds,
		};
	}
	return {
		isRateLimited,
		remainingRequests,
		retryAfterSeconds: config.retryAfterSeconds,
	};
}
