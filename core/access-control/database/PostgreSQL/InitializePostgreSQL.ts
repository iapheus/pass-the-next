import { Pool } from 'pg';
import type IPostgreOptions from './IPostgreOptions';

export let isPostgreActive = false;
export let pool: Pool;

export default function InitializePostgreSQL(options: IPostgreOptions): void {
	if (!options) throw new Error('[PostgreSQL] Initialization failed!');

	pool = new Pool({
		user: options.user,
		host: options.host,
		database: options.database,
		password: options.password,
		port: parseInt(options.port),
	});

	pool
		.connect()
		.then((client) => {
			client.release();
			isPostgreActive = true;
			console.log('PostgreSQL is active!');
		})
		.catch((error) => {
			throw new Error(`[PostgreSQL] Error occurred: ${error}`);
		});
}
