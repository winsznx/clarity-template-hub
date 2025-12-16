import WebSocket, { WebSocketServer } from 'ws';
import { config } from '../config/env.js';

interface BroadcastMessage {
    type: 'mint' | 'transfer' | 'deployment' | 'notification' | 'leaderboard_update';
    data: unknown;
}

class WebSocketService {
    private wss: WebSocketServer | null = null;
    private clients: Set<WebSocket> = new Set();

    initialize(port: number = config.websocket.port): void {
        this.wss = new WebSocketServer({ port });

        this.wss.on('connection', (ws: WebSocket) => {
            console.log('✅ New WebSocket client connected');
            this.clients.add(ws);

            ws.on('close', () => {
                console.log('👋 WebSocket client disconnected');
                this.clients.delete(ws);
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.clients.delete(ws);
            });

            // Send welcome message
            ws.send(JSON.stringify({
                type: 'connection',
                data: { message: 'Connected to Clarity Template Hub real-time feed' }
            }));
        });

        console.log(`🚀 WebSocket server running on port ${port}`);
    }

    broadcast(message: BroadcastMessage): void {
        const payload = JSON.stringify(message);

        for (const client of this.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        }
    }

    getClientCount(): number {
        return this.clients.size;
    }

    close(): void {
        if (this.wss) {
            this.wss.close();
            this.clients.clear();
        }
    }
}

export const websocketService = new WebSocketService();

// Helper function for broadcasting events
export function broadcastEvent(message: BroadcastMessage): void {
    websocketService.broadcast(message);
}
