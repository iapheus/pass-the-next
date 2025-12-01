function hasXssPayload(value: any): boolean {
	if (typeof value !== 'string') return false;

	const patterns = [
		/<script.*?>.*?<\/script>/i,
		/javascript:/i,
		/on\w+=/i,
		/<iframe/i,
		/<img/i,
		/<svg/i,
		/<embed/i,
		/<object/i,
		/<link/i,
		/<style/i,
		/<meta/i,
		/data:text\/html/i,
		/eval\(/i,
		/expression\(/i,
		/document\.cookie/i,
	];

	return patterns.some((pattern) => pattern.test(value));
}

export default function scanForXss(payload: any): boolean {
	if (!payload) return false;

	if (typeof payload === 'string') {
		return hasXssPayload(payload);
	}

	if (Array.isArray(payload)) {
		return payload.some((item) => scanForXss(item));
	}

	if (typeof payload === 'object') {
		return Object.values(payload).some((value) => scanForXss(value));
	}

	return false;
}
