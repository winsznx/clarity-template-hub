import { db } from '../db/client.js';
import { broadcastEvent } from './websocket.js';
import { notificationService } from './notifications.js';

interface Badge {
    name: string;
    description: string;
    icon: string;
}

class LeaderboardService {
    private readonly BADGES: Record<string, Badge> = {
        early_adopter: {
            name: 'Early Adopter',
            description: 'One of the first 100 users',
            icon: '🌟',
        },
        collector: {
            name: 'Template Collector',
            description: 'Minted 5+ templates',
            icon: '📚',
        },
        power_user: {
            name: 'Power User',
            description: 'Minted 10+ templates',
            icon: '⚡',
        },
        master: {
            name: 'Template Master',
            description: 'Minted 25+ templates',
            icon: '👑',
        },
        complete: {
            name: 'Complete Collection',
            description: 'Minted all 50 templates',
            icon: '💎',
        },
        builder: {
            name: 'Builder',
            description: 'Deployed 1+ contracts',
            icon: '🔨',
        },
        architect: {
            name: 'Architect',
            description: 'Deployed 5+ contracts',
            icon: '🏗️',
        },
        legend: {
            name: 'Legend',
            description: 'Deployed 10+ contracts',
            icon: '🚀',
        },
    };

    async updateUserRankings(): Promise<void> {
        try {
            const users = await db.getTopUsers(1000);

            // Sort by reputation points
            users.sort((a, b) => b.reputation_points - a.reputation_points);

            // Update ranks
            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                const newRank = i + 1;

                // Check for new badges
                const newBadges = await this.checkAndAwardBadges(user.user_address, {
                    total_mints: user.total_mints,
                    total_deployments: user.total_deployments,
                    rank: newRank,
                });

                if (newBadges.length > 0) {
                    for (const badge of newBadges) {
                        await notificationService.sendMilestoneNotification(
                            user.user_address,
                            `New badge earned: ${badge.name}`
                        );
                    }
                }
            }

            console.log('✅ User rankings updated');
        } catch (error) {
            console.error('Error updating user rankings:', error);
        }
    }

    async updateTemplateRankings(): Promise<void> {
        try {
            const templates = await db.getAllTemplateAnalytics(50);

            // Calculate trending scores
            const now = Date.now() / 1000; // Unix timestamp in seconds

            for (const template of templates) {
                // Trending score based on recent activity
                const hoursSinceLastMint = template.last_mint_timestamp
                    ? (now - template.last_mint_timestamp) / 3600
                    : 999999;

                const recencyBoost = Math.max(0, 1 - (hoursSinceLastMint / 168)); // 1 week decay
                const popularityScore = template.total_mints;
                const deploymentBonus = template.total_deployments * 2;

                const _trendingScore = (popularityScore + deploymentBonus) * (1 + recencyBoost);

                // TODO: Update template analytics with trending score
                // await db.updateTemplateAnalytics(template.id, { trending_score: trendingScore });
            }

            console.log('✅ Template rankings updated');
        } catch (error) {
            console.error('Error updating template rankings:', error);
        }
    }

    private async checkAndAwardBadges(
        userAddress: string,
        stats: { total_mints: number; total_deployments: number; rank: number }
    ): Promise<Badge[]> {
        const user = await db.getUserAnalytics(userAddress);
        if (!user) return [];

        const currentBadges = new Set(user.badges);
        const newBadges: Badge[] = [];

        // Check mint-based badges
        if (stats.total_mints >= 50 && !currentBadges.has('complete')) {
            newBadges.push(this.BADGES.complete);
            currentBadges.add('complete');
        } else if (stats.total_mints >= 25 && !currentBadges.has('master')) {
            newBadges.push(this.BADGES.master);
            currentBadges.add('master');
        } else if (stats.total_mints >= 10 && !currentBadges.has('power_user')) {
            newBadges.push(this.BADGES.power_user);
            currentBadges.add('power_user');
        } else if (stats.total_mints >= 5 && !currentBadges.has('collector')) {
            newBadges.push(this.BADGES.collector);
            currentBadges.add('collector');
        }

        // Check deployment-based badges
        if (stats.total_deployments >= 10 && !currentBadges.has('legend')) {
            newBadges.push(this.BADGES.legend);
            currentBadges.add('legend');
        } else if (stats.total_deployments >= 5 && !currentBadges.has('architect')) {
            newBadges.push(this.BADGES.architect);
            currentBadges.add('architect');
        } else if (stats.total_deployments >= 1 && !currentBadges.has('builder')) {
            newBadges.push(this.BADGES.builder);
            currentBadges.add('builder');
        }

        // Check rank-based badges
        if (stats.rank <= 100 && !currentBadges.has('early_adopter')) {
            newBadges.push(this.BADGES.early_adopter);
            currentBadges.add('early_adopter');
        }

        // Update user badges if new ones were awarded
        if (newBadges.length > 0) {
            await db.updateUserBadges(userAddress, Array.from(currentBadges));

            const _reputationBonus = newBadges.length * 10;

            // TODO: Add reputation bonus to user's points
            // await db.updateUserAnalytics(userAddress, { reputation_points: (user?.reputation_points || 0) + reputationBonus });
        }

        return newBadges;
    }

    async recalculateAll(): Promise<void> {
        await this.updateUserRankings();
        await this.updateTemplateRankings();

        broadcastEvent({
            type: 'leaderboard_update',
            data: { timestamp: Date.now() },
        });
    }
}

export const leaderboardService = new LeaderboardService();
