export default interface SlidingRateLimitResponse {
	isRateLimited: boolean;
	retryAfterSeconds: number;
	remainingRequests: number;
}
