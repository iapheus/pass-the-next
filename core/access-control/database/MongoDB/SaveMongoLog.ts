import mongoose from 'mongoose';
import { isMongoActive } from './InitializeMongoDB';

export default async function saveMongoLog(details: object) {
	if (!isMongoActive) throw new Error('[MongoDB] Run InitializeMongoDB first!');

	try {
		await mongoose.connection?.db?.collection('logs').insertOne({
			...details,
		});
	} catch (error) {
		throw new Error(`[MongoDB] Error occurred: ${error}`);
	}
}
