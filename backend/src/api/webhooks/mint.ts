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
            console.log(`📦 Block ${blockHeight}, ${block.transactions.length} transactions`);

            for (const tx of block.transactions) {
                console.log(`🔍 TX ${tx.transaction_identifier.hash.substring(0, 10)}... success=${tx.metadata.success}, ops=${tx.operations.length}`);

                if (!tx.metadata.success) {
                    console.log(`⏭️  Skipping failed transaction`);
                    continue;
                }

                const txId = tx.transaction_identifier.hash;
                const userAddress = tx.metadata.sender;

                // Log all operation types
                console.log(`📋 All operations:`, tx.operations.map(op => ({ type: op.type, hasAmount: !!op.amount })));

                // Find NFT mint operations - they come as CREDIT operations with NFT metadata
                // The NFT mint is typically the last CREDIT operation with asset_class_identifier
                const mintOps = tx.operations.filter(op =>
                    op.type === 'CREDIT' &&
                    op.amount?.currency?.metadata?.asset_class_identifier?.includes('template-access-nft')
                );
                console.log(`🎯 Found ${mintOps.length} NFT mint operations`);

                for (const op of mintOps) {
                    console.log(`🔎 Processing mint op:`, JSON.stringify(op, null, 2));

                    if (!op.amount?.currency?.metadata?.asset_identifier) {
                        console.log(`⚠️  Missing asset_identifier, skipping`);
                        continue;
                    }

                    // Parse template ID from hex asset_identifier
                    // Format: "0x010000000000000000000000000000002e" = u46
                    const assetIdHex = op.amount.currency.metadata.asset_identifier;
                    const templateId = parseInt(assetIdHex, 16);

                    console.log(`🎨 Parsed template ID: ${templateId} from ${assetIdHex}`);

                    try {
                        console.log(`💾 Attempting to save mint: user=${userAddress}, template=${templateId}, tx=${txId}`);

                        // Save to database
                        const mintResult = await db.insertMint({
                            tx_id: txId,
                            user_address: userAddress,
                            template_id: templateId,
                            block_height: blockHeight,
                            timestamp,
                            network: 'mainnet',
                        });
                        console.log(`✅ Mint saved to DB:`, mintResult);

                        const activityResult = await db.insertActivityEvent({
                            event_type: 'mint',
                            user_address: userAddress,
                            template_id: templateId,
                            contract_identifier: null,
                            tx_id: txId,
                            timestamp,
                            network: 'mainnet',
                            metadata: { block_height: blockHeight },
                        });
                        console.log(`✅ Activity saved to DB:`, activityResult);

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
                        console.error('❌ Error saving mint event:', error);
                        console.error('Error details:', {
                            name: error instanceof Error ? error.name : 'Unknown',
                            message: error instanceof Error ? error.message : String(error),
                            stack: error instanceof Error ? error.stack : undefined,
                        });
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
