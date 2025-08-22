import type { NextFunction, Request, Response } from 'express';
import {broadcast} from './websocket/index.js';
import {requestConfig, requestFilters} from './config/requestMonitor-cfg.js';
import {isMongoDBOn, isSocketOn, logMode} from './config/general-cfg.js';
import {saveLog} from './utils/fileio.js';
import * as mongoose from 'mongoose';

export async function saveMongoLog(data: object) {
	try {
		await mongoose.connection?.db?.collection('logs').insertOne({
			...data,
			timestamp: new Date()
		});
	} catch (err) {
		console.error('MongoDB log hatası:', err);
	}
}

interface RequestMonitorOptions {
	log?:boolean,
	logMode?:string[],
	actions?:string[],
	filter?:Record<string, any>,
	details?:Array<string>
}

export function requestMonitor(options:RequestMonitorOptions ) {
	return function (req: Request, res: Response, next: NextFunction) {
		if (req.url === '/favicon.ico') return next();

		const actions = options.actions == undefined ? requestFilters.action: options.actions;
		const filters = options.filter == undefined ? requestFilters.include: options.filter;
		const details = options.details == undefined ? requestConfig.details: options.details;

		let matched:boolean = false;
		let logFlag:boolean = false;
		let blockFlag:boolean = false;

		Object.entries(filters).forEach(([key, value]:[string,any]) => {
			if(req[key] == value){
				matched = true;
			}

			if(!matched) return next();

			if(actions.includes('log') && actions.includes('block')){
				logFlag = true;
				blockFlag = true;
				return res.status(404).json({ status: false, message: 'Blocked!' });
			}

			if(actions.includes('block')){
				blockFlag = true;
				return res.status(404).json({ status: false, message: 'Blocked!' });
			}

			if(actions.includes('log')){
				logFlag = true;
			}
		})

		if( (options?.log == undefined || options.log) && logFlag ) {
			const fieldMap: Record<string, any> = {
				app: req.app,
				baseUrl: req.baseUrl,
				body: req.body,
				cookies: req.cookies,
				hostname: req.hostname,
				ip: req.ip,
				ips: req.ips,
				method: req.method,
				originalUrl: req.originalUrl,
				params: req.params,
				path: req.path,
				protocol: req.protocol,
				query: req.query,
				res: req.res,
				route: req.route,
				secure: req.secure,
				signedCookies: req.signedCookies,
				stale: req.stale,
				subdomains: req.subdomains
			};

			const payload = Object.fromEntries(
			  details
				.filter(field => field in fieldMap)
				.map(field => [field, fieldMap[field]])
			);

			if ( options?.logMode == undefined ) {
				if( logMode.includes('realtime') && isSocketOn ) {
					broadcast(JSON.stringify(payload));
				}
				else{
					console.log(`You should activate socket on general config.`)
				}

				if( logMode.includes('json') ){
					const d = new Date();
					payload.time = d.toLocaleTimeString();
					saveLog(payload)
				}
				if( logMode.includes('mongodb') && isMongoDBOn ) {
					saveMongoLog(payload);
				}
			}
			if ( options?.logMode != undefined ) {
				if( options.logMode.includes('realtime') && isSocketOn ) {
					broadcast(JSON.stringify(payload));
				}
				if( options.logMode.includes('json') ){
					const d = new Date();
					payload.time = d.toLocaleTimeString();
					saveLog(payload)
				}
				if( options.logMode.includes('mongodb') && isMongoDBOn ) {
					saveMongoLog(payload);
				}
				else{
					console.log(`You should activate MongoDB on general config.`)
				}
			}
		}

		if(!blockFlag) return next();
	};
}


