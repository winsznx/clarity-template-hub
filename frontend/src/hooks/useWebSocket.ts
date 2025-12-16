import { useEffect, useState, useCallback } from 'react';

interface WebSocketMessage {
    type: 'mint' | 'transfer' | 'deployment' | 'notification' | 'leaderboard_update' | 'connection';
    data: unknown;
}

interface UseWebSocketOptions {
    url: string;
    onMessage?: (message: WebSocketMessage) => void;
    reconnectInterval?: number;
}

export function useWebSocket({ url, onMessage, reconnectInterval = 5000 }: UseWebSocketOptions) {
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

    const connect = useCallback(() => {
        try {
            const websocket = new WebSocket(url);

            websocket.onopen = () => {
                console.log('✅ WebSocket connected');
                setIsConnected(true);
            };

            websocket.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    setLastMessage(message);
                    onMessage?.(message);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            websocket.onclose = () => {
                console.log('👋 WebSocket disconnected');
                setIsConnected(false);
                setWs(null);

                // Attempt to reconnect
                setTimeout(() => {
                    console.log('🔄 Attempting to reconnect...');
                    connect();
                }, reconnectInterval);
            };

            setWs(websocket);
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
        }
    }, [url, onMessage, reconnectInterval]);

    useEffect(() => {
        connect();

        return () => {
            ws?.close();
        };
    }, [connect]);

    return {
        isConnected,
        lastMessage,
        ws,
    };
}
