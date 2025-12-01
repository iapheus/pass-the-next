import mongoose from 'mongoose';
import type IMongoOptions from './IMongoOptions';

export let isMongoActive: boolean = false;
export default function InitializeMongoDB(options: IMongoOptions): void {
	if (!options) throw new Error('[MongoDB] Initialization failed!');

	mongoose
		.connect(options.MONGO_CONN, { dbName: options.MONGO_DB_NAME })
		.then(() => {
			isMongoActive = true;
			console.log('MongoDB is active!');
		})
		.catch((error) => {
			throw new Error(`[MongoDB] Error occurred: ${error}`);
		});
}
