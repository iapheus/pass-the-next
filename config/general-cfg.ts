import {WebSocket, WebSocketServer} from 'ws';
import {startWebSocket} from '../websocket/index.js';
import * as mongoose from 'mongoose';
import type {RateLimiterOptions} from '../rateLimiter.js';

export const clients = new Set<WebSocket>();
export let isSocketOn: boolean;
export let isMongoDBOn: boolean;
export let socketPort: number;
export let logMode: string[];
export let generalRateLimitOptions: RateLimiterOptions | undefined;

interface generalConfigOptions {
	socketOptions: { socket: boolean; socketPort: number };
	logOptions: { log: boolean; logMode: Array<'json' | 'mongodb' | 'realtime'> };
	mongodb?: { connString: string; dbName: string };
	rateLimit?: RateLimiterOptions;
}

export function generalConfig(options: generalConfigOptions = {
	  socketOptions: { socket: true, socketPort: 8081 },
	  logOptions: { log: true, logMode: ['realtime'] }
  }) {

	isSocketOn = options.socketOptions.socket;
	socketPort = options.socketOptions.socketPort;
	logMode = options.logOptions.logMode;
	generalRateLimitOptions = options.rateLimit || undefined;

	const CONNECTION_STRING : string|undefined = options.mongodb?.connString || undefined;
	const DB_NAME : string|undefined = options.mongodb?.dbName || undefined;

	if (isSocketOn) {
		startWebSocket(socketPort);
	}
	if(CONNECTION_STRING != undefined && DB_NAME != undefined) {
		mongoose.connect(CONNECTION_STRING, { dbName: DB_NAME })
		  .then(() => {
			  isMongoDBOn = true;
			  console.log(`${DB_NAME} is active!`);
		  })
		  .catch((error) => {
			  console.error(`Error occurred: ${error}`);
		  });

	}
}