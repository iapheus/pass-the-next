export const requestConfig = {
	details: ["ip", "method", "path"] as Array<
	  "app" | "baseUrl" | "body" | "cookies" | "hostname" | "ip" | "ips" |
	  "method" | "originalUrl" | "params" | "path" | "protocol" | "query" |
	  "res" | "route" | "secure" | "signedCookies" | "stale" | "subdomains"
	>
};

export const requestFilters = {
	include: {'protocol':'http'} as Record<string, any>,
	action: ['log'] as Array<'log' | 'block' | 'doNothing'>
}

export function setRequestConfig(request: typeof requestConfig.details, filters: typeof requestFilters.include, action: typeof requestFilters.action) {
	requestConfig.details = request;
	requestFilters.include = filters;
	requestFilters.action = action;
}