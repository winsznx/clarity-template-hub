import { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { broadcastEvent } from '../../services/websocket.js';
import { notificationService } from '../../services/notifications.js';
import { z } from 'zod';

// Chainhook event schema
const mintEventSchema = z.object({
    apply: z.array(z.object({
        type: z.literal('ContractCall'),
        contract_call: z.object({
            contract_id: z.string(),
            function_name: z.string(),
            function_args: z.array(z.any()),
        }),
        transaction: z.object({
            transaction_identifier: z.object({
                hash: z.string(),
            }),
            operations: z.array(z.any()),
            metadata: z.object({
                sender: z.string(),
                fee: z.string(),
                success: z.boolean(),
            }),
        }),
        block_identifier: z.object({
            index: z.number(),
            hash: z.string(),
        }),
        timestamp: z.number(),
    })),
    chainhook: z.object({
        uuid: z.string(),
        predicate: z.any(),
    }),
});

export async function handleMintWebhook(req: Request, res: Response): Promise<void> {
    try {
        const event = mintEventSchema.parse(req.body);

        // Process each apply event
        for (const apply of event.apply) {
            if (!apply.transaction.metadata.success) {
                continue; // Skip failed transactions
            }

            const txId = apply.transaction.transaction_identifier.hash;
            const userAddress = apply.transaction.metadata.sender;
            const blockHeight = apply.block_identifier.index;
            const timestamp = apply.timestamp;

            // Extract template_id from function args
            // Args format: [template-id (uint)]
            const templateIdArg = apply.contract_call.function_args[0];
            let templateId: number;

            if (typeof templateIdArg === 'object' && 'uint' in templateIdArg) {
                templateId = parseInt(templateIdArg.uint, 10);
            } else if (typeof templateIdArg === 'string') {
                templateId = parseInt(templateIdArg, 10);
            } else {
                console.error('Unable to parse template_id from args:', templateIdArg);
                continue;
            }

            // Determine network from contract address
            const contractId = apply.contract_call.contract_id;
            const network = contractId.startsWith('SP') ? 'mainnet' : 'testnet';

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

                console.log(`✅ Stored mint event: ${userAddress} minted template #${templateId}`);

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

        res.status(200).json({ success: true, processed: event.apply.length });
    } catch (error) {
        console.error('Mint webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
