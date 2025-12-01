import { clients } from './InitializeWebSocket';

export default function broadcast(message: object): void {
	for (const client of clients) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify(message));
		}
	}
}
