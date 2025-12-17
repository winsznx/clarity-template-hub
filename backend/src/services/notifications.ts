import { Resend } from 'resend';
import { db } from '../db/railway-client.js';
import { config } from '../config/env.js';
import { broadcastEvent } from './websocket.js';

interface NotificationPayload {
    type: 'mint' | 'transfer' | 'deployment';
    user: string;
    template_id?: number;
    tx_id: string;
    network: 'mainnet' | 'testnet';
}

class NotificationService {
    private resend: Resend | null = null;

    constructor() {
        if (config.notifications.resendApiKey) {
            this.resend = new Resend(config.notifications.resendApiKey);
        }
    }

    async notifyTemplateWatchers(templateId: number, payload: NotificationPayload): Promise<void> {
        try {
            const watchers = await db.getTemplateWatchers(templateId);

            for (const watcher of watchers) {
                if (!watcher.notify_on_mint && payload.type === 'mint') {
                    continue;
                }

                // Send in-app notification via WebSocket
                broadcastEvent({
                    type: 'notification',
                    data: {
                        user_address: watcher.user_address,
                        message: this.formatNotificationMessage(payload),
                        template_id: templateId,
                        tx_id: payload.tx_id,
                    },
                });

                // Send email if configured
                if (watcher.email && this.resend && config.notifications.fromEmail) {
                    await this.sendEmail(
                        watcher.email,
                        this.formatEmailSubject(payload),
                        this.formatEmailBody(payload, templateId)
                    );
                }
            }
        } catch (error) {
            console.error('Error notifying template watchers:', error);
        }
    }

    private formatNotificationMessage(payload: NotificationPayload): string {
        const shortAddress = `${payload.user.slice(0, 6)}...${payload.user.slice(-4)}`;

        switch (payload.type) {
            case 'mint':
                return `${shortAddress} just minted template #${payload.template_id}`;
            case 'transfer':
                return `NFT #${payload.template_id} was transferred`;
            case 'deployment':
                return `${shortAddress} deployed a contract`;
            default:
                return 'New activity';
        }
    }

    private formatEmailSubject(payload: NotificationPayload): string {
        switch (payload.type) {
            case 'mint':
                return `New Mint Alert - Template #${payload.template_id}`;
            case 'transfer':
                return `NFT Transfer Alert - Token #${payload.template_id}`;
            case 'deployment':
                return 'New Contract Deployment';
            default:
                return 'Clarity Template Hub Activity';
        }
    }

    private formatEmailBody(payload: NotificationPayload, templateId: number): string {
        const explorerUrl = payload.network === 'mainnet'
            ? `https://explorer.stacks.co/txid/${payload.tx_id}?chain=mainnet`
            : `https://explorer.stacks.co/txid/${payload.tx_id}?chain=testnet`;

        return `
      <h2>Activity Alert</h2>
      <p>${this.formatNotificationMessage(payload)}</p>
      <p><strong>Transaction:</strong> <a href="${explorerUrl}">${payload.tx_id}</a></p>
      <p><strong>Network:</strong> ${payload.network}</p>
      <hr>
      <p><small>You're receiving this because you're watching template #${templateId}</small></p>
    `;
    }

    private async sendEmail(to: string, subject: string, html: string): Promise<void> {
        if (!this.resend || !config.notifications.fromEmail) {
            return;
        }

        try {
            await this.resend.emails.send({
                from: config.notifications.fromEmail,
                to,
                subject,
                html,
            });
            console.log(`📧 Email sent to ${to}`);
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }

    async sendMilestoneNotification(userAddress: string, milestone: string): Promise<void> {
        broadcastEvent({
            type: 'notification',
            data: {
                user_address: userAddress,
                message: `🎉 Milestone achieved: ${milestone}`,
                type: 'milestone',
            },
        });
    }
}

export const notificationService = new NotificationService();
