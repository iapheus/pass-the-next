import { pool, isPostgreActive } from './InitializePostgreSQL';
import type IPostgreColumns from './IPostgreColumns';

export default async function savePostgreLog(log: Partial<IPostgreColumns>) {
	if (!isPostgreActive) {
		throw new Error('[PostgreSQL] Run InitializeMongoDB first!');
	}

	const query = `
        INSERT INTO logs (
            baseUrl, body, cookies, hostname, ip, ips, method, originalUrl,
			params, path, protocol, query, secure, signedCookies, stale, subdomains, rule
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9,
            $10, $11, $12, $13, $14, $15, $16, $17
        )
    `;

	const values = [
		log.baseUrl,
		log.body,
		log.cookies,
		log.hostname,
		log.ip,
		log.ips,
		log.method,
		log.originalUrl,
		log.params,
		log.path,
		log.protocol,
		log.query,
		log.secure,
		log.signedCookies,
		log.stale,
		log.subdomains,
		log.rule,
	];

	try {
		await pool.query(query, values);
	} catch (error) {
		throw new Error(`[PostgreSQL] Error occurred: ${error}`);
	}
}
