import { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { broadcastEvent } from '../../services/websocket.js';
import { templateVerificationService } from '../../services/template-verification.js';
import { z } from 'zod';

const deploymentEventSchema = z.object({
    apply: z.array(z.object({
        type: z.literal('ContractDeployment'),
        contract_deployment: z.object({
            contract_identifier: z.string(),
            code_body: z.string(),
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

export async function handleDeploymentWebhook(req: Request, res: Response): Promise<void> {
    try {
        const event = deploymentEventSchema.parse(req.body);

        for (const apply of event.apply) {
            if (!apply.transaction.metadata.success) {
                continue;
            }

            const contractIdentifier = apply.contract_deployment.contract_identifier;
            const codeBody = apply.contract_deployment.code_body;
            const deployerAddress = apply.transaction.metadata.sender;
            const txId = apply.transaction.transaction_identifier.hash;
            const blockHeight = apply.block_identifier.index;
            const timestamp = apply.timestamp;

            const network = contractIdentifier.startsWith('SP') ? 'mainnet' : 'testnet';

            try {
                // Verify if deployment matches any template
                const verification = await templateVerificationService.verifyDeployment(codeBody);

                await db.insertDeployment({
                    contract_identifier: contractIdentifier,
                    deployer_address: deployerAddress,
                    template_id: verification.templateId,
                    verified: verification.verified,
                    similarity_score: verification.similarityScore,
                    code_hash: verification.codeHash,
                    block_height: blockHeight,
                    timestamp,
                    network,
                });

                // Update user deployment count
                await db.incrementUserDeployments(deployerAddress);

                await db.insertActivityEvent({
                    event_type: 'deployment',
                    user_address: deployerAddress,
                    template_id: verification.templateId,
                    contract_identifier: contractIdentifier,
                    tx_id: txId,
                    timestamp,
                    network,
                    metadata: {
                        verified: verification.verified,
                        similarity_score: verification.similarityScore,
                    },
                });

                console.log(
                    `✅ Stored deployment: ${contractIdentifier} by ${deployerAddress}` +
                    (verification.verified ? ` (verified template #${verification.templateId})` : '')
                );

                broadcastEvent({
                    type: 'deployment',
                    data: {
                        contract_identifier: contractIdentifier,
                        deployer_address: deployerAddress,
                        template_id: verification.templateId,
                        verified: verification.verified,
                        tx_id: txId,
                        timestamp,
                        network,
                    },
                });

            } catch (error) {
                console.error('Error storing deployment event:', error);
            }
        }

        res.status(200).json({ success: true, processed: event.apply.length });
    } catch (error) {
        console.error('Deployment webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
