import { Request, Response } from 'express';
import { db } from '../../db/railway-client.js';
import { broadcastEvent } from '../../services/websocket.js';
import { notificationService } from '../../services/notifications.js';
import { z } from 'zod';

// Hiro Chainhooks payload schema
const chainhookPayloadSchema = z.object({
    event: z.object({
        apply: z.array(z.object({
            timestamp: z.number(),
            block_identifier: z.object({
                hash: z.string(),
                index: z.number(),
            }),
            transactions: z.array(z.object({
                transaction_identifier: z.object({
                    hash: z.string(),
                }),
                metadata: z.object({
                    sender: z.string(),
                    fee: z.union([z.string(), z.number()]),
                    success: z.boolean(),
                }).passthrough(),
                operations: z.array(z.any()),
            })),
        })),
        rollback: z.array(z.any()).optional(),
        chain: z.string(),
        network: z.string(),
    }),
    chainhook: z.object({
        name: z.string(),
        uuid: z.string(),
    }),
});

export async function handleMintWebhook(req: Request, res: Response): Promise<void> {
    try {
        // Log the raw payload for debugging
        console.log('🔍 Received mint webhook payload:', JSON.stringify(req.body, null, 2));

        const payload = chainhookPayloadSchema.parse(req.body);

        // Process each block in the apply array
        for (const block of payload.event.apply) {
            const blockHeight = block.block_identifier.index;
            const timestamp = block.timestamp;

            // Process each transaction in the block
            for (const tx of block.transactions) {
                if (!tx.metadata.success) {
                    continue; // Skip failed transactions
                }

                const txId = tx.transaction_identifier.hash;
                const userAddress = tx.metadata.sender;

                // Find NFT mint operations
                const mintOperations = tx.operations.filter((op: any) =>
                    op.type === 'NFT_MINT_EVENT' ||
                    (op.metadata && op.metadata.asset_class_identifier)
                );

                for (const operation of mintOperations) {
                    // Extract template_id from operation metadata
                    // The asset identifier format is: CONTRACT.ASSET::TOKEN_ID
                    let templateId: number = 1; // Default

                    try {
                        if (operation.metadata?.token_identifier) {
                            // Parse token ID from the operation
                            const tokenId = operation.metadata.token_identifier;
                            templateId = parseInt(tokenId, 10) || 1;
                        } else if (operation.metadata?.raw_value) {
                            // Try to parse from raw value
                            const match = operation.metadata.raw_value.match(/u(\d+)/);
                            if (match) {
                                templateId = parseInt(match[1], 10);
                            }
                        }
                    } catch (error) {
                        console.warn('Could not parse template_id, using default:', error);
                    }

                    // Determine network
                    const network = payload.event.network as 'mainnet' | 'testnet';

                    // Store mint event
                    try {
                        await db.insertMint({
                            tx_id: txId,
                            user_address: userAddress,
                            template_id: templateId,
                            block_height: blockHeight,
                            timestamp,
                            network,
                        });

                        // Add to activity feed
                        await db.insertActivityEvent({
                            event_type: 'mint',
                            user_address: userAddress,
                            template_id: templateId,
                            contract_identifier: null,
                            tx_id: txId,
                            timestamp,
                            network,
                            metadata: {
                                block_height: blockHeight,
                            },
                        });

                        console.log(`✅ Stored mint event: ${userAddress} minted template #${templateId} (tx: ${txId})`);

                        // Broadcast to WebSocket clients
                        broadcastEvent({
                            type: 'mint',
                            data: {
                                user_address: userAddress,
                                template_id: templateId,
                                tx_id: txId,
                                timestamp,
                                network,
                            },
                        });

                        // Send notifications to watchers
                        await notificationService.notifyTemplateWatchers(templateId, {
                            type: 'mint',
                            user: userAddress,
                            template_id: templateId,
                            tx_id: txId,
                            network,
                        });

                    } catch (error) {
                        console.error('Error storing mint event:', error);
                        // Continue processing other events even if one fails
                    }
                }
            }
        }

        res.status(200).json({ success: true, processed: payload.event.apply.length });
    } catch (error) {
        console.error('Mint webhook error:', error);
        if (error instanceof z.ZodError) {
            console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
        }
        res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
    }
}
