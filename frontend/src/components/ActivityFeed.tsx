import { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3002';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ActivityEvent {
    id: number;
    event_type: 'mint' | 'transfer' | 'deployment';
    user_address: string;
    template_id: number | null;
    contract_identifier: string | null;
    tx_id: string;
    timestamp: number;
    network: 'mainnet' | 'testnet';
    metadata: Record<string, unknown>;
}

export function ActivityFeed() {
    const [events, setEvents] = useState<ActivityEvent[]>([]);
    const [loading, setLoading] = useState(true);

    // WebSocket connection for real-time updates
    const { isConnected } = useWebSocket({
        url: WS_URL,
        onMessage: (message) => {
            if (message.type === 'mint' || message.type === 'transfer' || message.type === 'deployment') {
                // Add new event to the top of the feed
                const newEvent = message.data as ActivityEvent;
                setEvents(prev => [newEvent, ...prev].slice(0, 50));
            }
        },
    });

    useEffect(() => {
        fetchRecentActivity();
    }, []);

    const fetchRecentActivity = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/activity/recent?limit=50`);
            const data = await response.json();
            setEvents(data.activity || []);
        } catch (error) {
            console.error('Error fetching activity:', error);
        } finally {
            setLoading(false);
        }
    };

    const shortenAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const getExplorerUrl = (txId: string, network: string) => {
        const chain = network === 'mainnet' ? 'mainnet' : 'testnet';
        return `https://explorer.stacks.co/txid/${txId}?chain=${chain}`;
    };

    const formatEventMessage = (event: ActivityEvent) => {
        const address = shortenAddress(event.user_address);

        switch (event.event_type) {
            case 'mint':
                return (
                    <>
                        <span className="text-purple-400">🎨</span> {address} minted{' '}
                        <span className="text-blue-400">template #{event.template_id}</span>
                    </>
                );
            case 'transfer':
                return (
                    <>
                        <span className="text-green-400">↔️</span> NFT #{event.template_id} transferred
                    </>
                );
            case 'deployment':
                return (
                    <>
                        <span className="text-orange-400">🚀</span> {address} deployed a contract
                    </>
                );
            default:
                return 'Unknown event';
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-900 rounded-lg p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-800 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-800 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                    <Activity className="w-5 h-5" />
                    Live Activity
                </h3>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs text-gray-400">
                        {isConnected ? 'Live' : 'Disconnected'}
                    </span>
                </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {events.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        No recent activity
                    </div>
                ) : (
                    events.map((event) => (
                        <div
                            key={event.id}
                            className="flex items-start gap-3 text-sm p-3 bg-gray-800 rounded hover:bg-gray-750 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="text-white mb-1">
                                    {formatEventMessage(event)}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span>{formatDistanceToNow(new Date(event.timestamp * 1000), { addSuffix: true })}</span>
                                    <span>•</span>
                                    <a
                                        href={getExplorerUrl(event.tx_id, event.network)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300"
                                    >
                                        View tx
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
