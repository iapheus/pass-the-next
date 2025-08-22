import {clients} from '../config/general-cfg.js';
import {WebSocket, WebSocketServer} from 'ws';

export function startWebSocket(socketPort:number){
	const server = new WebSocketServer({ port:socketPort });

	server.on('connection', (socket: WebSocket) => {
		console.log('Client connected');
		clients.add(socket);

		socket.on('close', () => {
			console.log('Client disconnected');
			clients.delete(socket);
		});
	});

	console.log(`WebSocket server is running on ws://localhost:${socketPort}`);
}

export function broadcast(message: string) {
	for (const client of clients) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(message);
		}
	}
}