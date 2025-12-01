import {
	getFuzzerDetectorOptions,
	type IFuzzerDetectorOptions,
} from './FuzzerDetectorOptions';

const failureCounts = new Map<string, number>();
const blockedList = new Map<string, number>();

export interface IFuzzDetector {
	isBlocked(key: string): boolean;
	recordFailure(key: string): boolean;
}

export default function fuzzerDetect(
	options?: Partial<IFuzzerDetectorOptions>
): IFuzzDetector {
	let fuzzerDetectorOptions: IFuzzerDetectorOptions =
		getFuzzerDetectorOptions();

	if (options) {
		fuzzerDetectorOptions = {
			...fuzzerDetectorOptions,
			...options,
		};
	}

	const unblock = (key: string): void => {
		blockedList.delete(key);
		failureCounts.delete(key);
	};

	const isBlocked = (key: string): boolean => {
		const unblockTime = blockedList.get(key);

		if (!unblockTime) {
			return false;
		}

		const now = Date.now();
		if (now < unblockTime) {
			return true;
		}

		unblock(key);
		return false;
	};

	const block = (key: string): void => {
		const unblockTime =
			Date.now() + fuzzerDetectorOptions.blockDurationSeconds * 1000;
		blockedList.set(key, unblockTime);
	};

	const recordFailure = (key: string): boolean => {
		const currentCount = failureCounts.get(key) || 0;
		const newCount = currentCount + 1;
		failureCounts.set(key, newCount);

		if (newCount >= fuzzerDetectorOptions.maxTry) {
			block(key);
			return true;
		}
		return false;
	};

	return {
		isBlocked,
		recordFailure,
	};
}
