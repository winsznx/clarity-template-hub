import { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { broadcastEvent } from '../../services/websocket.js';
import { z } from 'zod';

const transferEventSchema = z.object({
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
            metadata: z.object({
                sender: z.string(),
                success: z.boolean(),
            }),
        }),
        block_identifier: z.object({
            index: z.number(),
        }),
        timestamp: z.number(),
    })),
});

export async function handleTransferWebhook(req: Request, res: Response): Promise<void> {
    try {
        const event = transferEventSchema.parse(req.body);

        for (const apply of event.apply) {
            if (!apply.transaction.metadata.success) {
                continue;
            }

            const txId = apply.transaction.transaction_identifier.hash;
            const blockHeight = apply.block_identifier.index;
            const timestamp = apply.timestamp;

            // Extract transfer args: [token-id (uint), sender (principal), recipient (principal)]
            const args = apply.contract_call.function_args;

            let tokenId: number;
            let fromAddress: string;
            let toAddress: string;

            try {
                tokenId = typeof args[0] === 'object' && 'uint' in args[0]
                    ? parseInt(args[0].uint, 10)
                    : parseInt(args[0], 10);

                fromAddress = typeof args[1] === 'object' && 'principal' in args[1]
                    ? args[1].principal
                    : args[1];

                toAddress = typeof args[2] === 'object' && 'principal' in args[2]
                    ? args[2].principal
                    : args[2];
            } catch (error) {
                console.error('Error parsing transfer args:', error);
                continue;
            }

            const contractId = apply.contract_call.contract_id;
            const network = contractId.startsWith('SP') ? 'mainnet' : 'testnet';

            try {
                await db.insertTransfer({
                    tx_id: txId,
                    token_id: tokenId,
                    from_address: fromAddress,
                    to_address: toAddress,
                    block_height: blockHeight,
                    timestamp,
                    network,
                });

                await db.insertActivityEvent({
                    event_type: 'transfer',
                    user_address: fromAddress,
                    template_id: tokenId,
                    contract_identifier: null,
                    tx_id: txId,
                    timestamp,
                    network,
                    metadata: {
                        from: fromAddress,
                        to: toAddress,
                        token_id: tokenId,
                    },
                });

                console.log(`✅ Stored transfer event: token #${tokenId} from ${fromAddress} to ${toAddress}`);

                broadcastEvent({
                    type: 'transfer',
                    data: {
                        token_id: tokenId,
                        from_address: fromAddress,
                        to_address: toAddress,
                        tx_id: txId,
                        timestamp,
                        network,
                    },
                });

            } catch (error) {
                console.error('Error storing transfer event:', error);
            }
        }

        res.status(200).json({ success: true, processed: event.apply.length });
    } catch (error) {
        console.error('Transfer webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
