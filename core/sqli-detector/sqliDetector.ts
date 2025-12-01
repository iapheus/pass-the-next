function hasSqliPayload(value: any): boolean {
	if (typeof value !== 'string') return false;

	const patterns = [
		/\b(or|and)\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?/i,
		/\bunion\s+select\b/i,
		/\bselect\s+[^\s]+\s+from\s+[^\s]+/i,
		/\binsert\s+into\s+[^\s]+/i,
		/\bupdate\s+[^\s]+\s+set\s+/i,
		/\bdelete\s+from\s+[^\s]+/i,
		/\bdrop\s+table\s+[^\s]+/i,
		/;--\s*$/i,
		/\/\*.*\*\//i,
		/\bxp_cmdshell\b/i,
		/\bexec(\s|\+)+[^\s]+/i,
		/\bsleep\s*\(\s*\d+\s*\)/i,
		/\bbenchmark\s*\(\s*\d+,\s*[^\)]+\)/i,
		/\bload_file\s*\(\s*['"][^'"]+['"]\s*\)/i,
		/\binformation_schema\b/i,
	];

	return patterns.some((pattern) => pattern.test(value));
}

export function scanForSqli(payload: any): boolean {
	if (!payload) return false;

	if (typeof payload === 'string') {
		return hasSqliPayload(payload);
	}

	if (Array.isArray(payload)) {
		return payload.some((item) => scanForSqli(item));
	}

	if (typeof payload === 'object') {
		return Object.values(payload).some((value) => scanForSqli(value));
	}

	return false;
}
