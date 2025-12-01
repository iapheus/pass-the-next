function hasPathTraversalPayload(value: any): boolean {
	if (typeof value !== 'string') return false;

	const patterns = [
		/\.\.\//,
		/\.\.\\/,
		/%2e%2e%2f/i,
		/%2e%2e%5c/i,
		/\/etc\/passwd/i,
		/\/etc\/shadow/i,
		/\/proc\/\d+\/cmdline/i,
		/c:\\windows\\system32/i,
		/c:\\winnt/i,
		/boot\.ini/i,
		/web\.config/i,
		/\.htaccess/i,
		/\.env/i,
		/id_rsa/i,
		/authorized_keys/i,
	];

	return patterns.some((pattern) => pattern.test(value));
}

export function scanForPathTraversal(payload: any): boolean {
	if (!payload) return false;

	if (typeof payload === 'string') {
		return hasPathTraversalPayload(payload);
	}

	if (Array.isArray(payload)) {
		return payload.some((item) => scanForPathTraversal(item));
	}

	if (typeof payload === 'object') {
		return Object.values(payload).some((value) => scanForPathTraversal(value));
	}

	return false;
}
