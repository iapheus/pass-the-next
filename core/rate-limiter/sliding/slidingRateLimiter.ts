import {
	getSlidingRateLimiterOptions,
	type ISlidingRateLimiterOptions,
} from './SlidingRateLimiterOptions';
import type SlidingRateLimitResponse from './SlidingRateLimitResponse';

const rateLimitStore = new Map<string, { timestamp: number }[]>();

export default function checkSlidingateLimit(
	key: string,
	options?: Partial<ISlidingRateLimiterOptions>
): SlidingRateLimitResponse {
	const now = Date.now();
	let config: ISlidingRateLimiterOptions = getSlidingRateLimiterOptions();

	if (options) {
		config = {
			...config,
			...options,
		};
	}

	const windowsMs = config.timeFrameSeconds * 1000;
	const windowsStartMs = now - windowsMs;

	const userData = rateLimitStore.get(key) || [];

	const validRequests = userData.filter(
		(req) => req.timestamp > windowsStartMs
	);

	const currentCount = validRequests.length;
	const remainingRequests = Math.max(0, config.maxRequest - currentCount);

	if (currentCount >= config.maxRequest) {
		const oldestRequestTimestamp = validRequests[0]!.timestamp;

		const retryAfterSeconds = Math.ceil(
			(oldestRequestTimestamp + windowsMs - now) / 1000
		);

		return {
			isRateLimited: true,
			remainingRequests: 0,
			retryAfterSeconds,
		};
	}

	validRequests.push({ timestamp: now });
	rateLimitStore.set(key, validRequests);

	const timeUntilLimitClear =
		validRequests.length > 0
			? Math.ceil((validRequests[0]!.timestamp + windowsMs - now) / 1000)
			: config.timeFrameSeconds;

	return {
		isRateLimited: false,
		remainingRequests,
		retryAfterSeconds: timeUntilLimitClear,
	};
}
