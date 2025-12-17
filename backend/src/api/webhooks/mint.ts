import { Request, Response } from 'express';
import { db } from '../../db/railway-client.js';
import { broadcastEvent } from '../../services/websocket.js';

interface ChainhookPayload {
    apply: Array<{
        block_identifier: {
            index: number;
            hash: string;
        };
        timestamp: number;
        transactions: Array<{
            transaction_identifier: {
                hash: string;
            };
            metadata: {
                sender: string;
                success: boolean;
            };
            operations: Array<{
                type: string;
                account?: {
                    address: string;
                };
                amount?: {
                    currency?: {
                        metadata?: {
                            asset_class_identifier?: string;
                            asset_identifier?: string;
                        };
                    };
                };
            }>;
        }>;
    }>;
    chainhook: {
        uuid: string;
    };
}

export async function handleMintWebhook(req: Request, res: Response): Promise<void> {
    try {
        const payload = req.body as ChainhookPayload;

        console.log(`📥 Processing ${payload.apply.length} block(s) from chainhook`);

        for (const block of payload.apply) {
            const blockHeight = block.block_identifier.index;
            const timestamp = block.timestamp;

            for (const tx of block.transactions) {
                if (!tx.metadata.success) {
                    continue;
                }

                const txId = tx.transaction_identifier.hash;
                const userAddress = tx.metadata.sender;

                // Find NFT mint operations
                const mintOps = tx.operations.filter(op => op.type === 'NFTMintEvent');

                for (const op of mintOps) {
                    if (!op.amount?.currency?.metadata?.asset_identifier) {
                        continue;
                    }

                    // Parse template ID from hex asset_identifier
                    // Format: "0x010000000000000000000000000000002e" = u46
                    const assetIdHex = op.amount.currency.metadata.asset_identifier;
                    const templateId = parseInt(assetIdHex, 16);

                    try {
                        // Save to database
                        await db.insertMint({
                            tx_id: txId,
                            user_address: userAddress,
                            template_id: templateId,
                            block_height: blockHeight,
                            timestamp,
                            network: 'mainnet',
                        });

                        await db.insertActivityEvent({
                            event_type: 'mint',
                            user_address: userAddress,
                            template_id: templateId,
                            contract_identifier: null,
                            tx_id: txId,
                            timestamp,
                            network: 'mainnet',
                            metadata: { block_height: blockHeight },
                        });

                        console.log(`✅ Saved mint: ${userAddress} minted template #${templateId} (tx: ${txId})`);

                        // Broadcast to WebSocket clients
                        broadcastEvent({
                            type: 'mint',
                            data: {
                                user_address: userAddress,
                                template_id: templateId,
                                tx_id: txId,
                                timestamp,
                                network: 'mainnet',
                            },
                        });

                    } catch (error) {
                        console.error('Error saving mint event:', error);
                    }
                }
            }
        }

        res.status(200).json({ success: true, processed: payload.apply.length });
    } catch (error) {
        console.error('Mint webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
