import crypto from 'crypto';
import * as diff from 'diff';

interface VerificationResult {
    verified: boolean;
    templateId: number | null;
    similarityScore: number | null;
    codeHash: string;
}

class TemplateVerificationService {
    private _templates: Map<number, string> = new Map();

    constructor() {
        // Load templates from templates.json
        // TODO: Implement template loading from file system
        // For now, templates will be loaded on-demand
    }

    async loadTemplates(): Promise<void> {
        // In production, load from templates.json or database
        // For now, we'll load dynamically when needed
        console.log('Template verification service initialized');
    }

    private calculateCodeHash(code: string): string {
        return crypto.createHash('sha256').update(code.trim()).digest('hex');
    }

    private calculateSimilarity(code1: string, code2: string): number {
        // Normalize code for comparison
        const normalize = (code: string) =>
            code
                .replace(/\s+/g, ' ') // Normalize whitespace
                .replace(/;;.*$/gm, '') // Remove comments
                .trim();

        const normalized1 = normalize(code1);
        const normalized2 = normalize(code2);

        // Calculate diff-based similarity
        const differences = diff.diffChars(normalized1, normalized2);

        let matchingChars = 0;
        let totalChars = 0;

        for (const part of differences) {
            totalChars += part.value.length;
            if (!part.added && !part.removed) {
                matchingChars += part.value.length;
            }
        }

        return totalChars > 0 ? matchingChars / totalChars : 0;
    }

    async verifyDeployment(deployedCode: string): Promise<VerificationResult> {
        const codeHash = this.calculateCodeHash(deployedCode);

        // Try to load templates from public directory
        try {
            // In a real implementation, fetch from your templates.json
            // For now, we'll return unverified but with hash

            // TODO: Load actual templates and compare
            // const templates = await fetch('/templates.json').then(r => r.json());
            // for (const template of templates) {
            //   const similarity = this.calculateSimilarity(deployedCode, template.code);
            //   if (similarity > 0.95) {
            //     return {
            //       verified: true,
            //       templateId: template.id,
            //       similarityScore: similarity,
            //       codeHash,
            //     };
            //   }
            // }

            return {
                verified: false,
                templateId: null,
                similarityScore: null,
                codeHash,
            };
        } catch (error) {
            console.error('Error verifying deployment:', error);
            return {
                verified: false,
                templateId: null,
                similarityScore: null,
                codeHash,
            };
        }
    }
}

export const templateVerificationService = new TemplateVerificationService();
