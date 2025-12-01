export default interface FixedRateLimitResponse {
	isRateLimited: boolean;
	retryAfterSeconds: number;
	remainingRequests: number;
}
