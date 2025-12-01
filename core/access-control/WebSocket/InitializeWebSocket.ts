import { WebSocket, WebSocketServer } from 'ws';

export const clients = new Set<WebSocket>();

export default function InitializeWebSocket(options: { port: number }): void {
	if (!options.port) throw new Error("[WebSocket] Initialization failed!'");
	try {
		const server = new WebSocketServer({ port: options.port });

		server.on('connection', (socket: WebSocket) => {
			clients.add(socket);

			socket.on('close', () => {
				console.warn('[WebSocket] Client disconnected');
				clients.delete(socket);
			});
		});

		console.log(`WebSocket server is active on ws://localhost:${options.port}`);
	} catch (error) {
		throw new Error(`[WebSocket] Error occurred: ${error}`);
	}
}
