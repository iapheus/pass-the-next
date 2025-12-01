export default interface IHttpHeaders {
	Method?: Array<
		'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'
	>;
	Host?: Array<string>;
	'User-Agent'?: Array<string>;
	Referer?: Array<string>;
	'X-Forwarded-For'?: Array<string>;
	Origin?: Array<string>;
	Accept?: Array<string>;
	'Accept-Encoding'?: Array<string>;
	'Content-Type'?: Array<string>;
	'Content-Length'?: [string | number, '=' | '<' | '>' | '<=' | '>='];
	'Cache-Control'?: Array<string>;
	Connection?: Array<'keep-alive' | 'close' | string>;
}
