// Hybrid Voronoi-to-Honeycomb Seed Generator & Blender

import { Geometry } from './geometry.js';
import { HoneycombGrid } from './honeycomb.js';

export class PatternBlender {
    /**
     * Generate blended seeds for Voronoi + Honeycomb structure
     * @param {Object} config 
     * @param {number} config.width - Panel width
     * @param {number} config.height - Panel height
     * @param {number} config.seedCount - Number of Voronoi center seeds
     * @param {number} config.blendRadius - Blend transition ratio (0.0 = all voronoi, 1.0 = all hex)
     * @returns {Array<{x: number, y: number}>}
     */
    static generateBlendedSeeds(config) {
        const { width, height, seedCount, blendRadius = 0.5 } = config;
        const centerX = width / 2;
        const centerY = height / 2;
        const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

        // Approximate hex radius based on seed count
        const area = width * height;
        const targetHexRadius = Math.sqrt((2 * area) / (3 * Math.sqrt(3) * seedCount));

        // 1. Generate regular honeycomb grid points across panel
        const hexSeeds = HoneycombGrid.generateSeeds(width, height, targetHexRadius);

        // 2. Generate random Voronoi center seeds
        const voronoiSeeds = [];
        for (let i = 0; i < seedCount; i++) {
            voronoiSeeds.push({
                x: Math.random() * width,
                y: Math.random() * height
            });
        }

        // Combine both sets with smooth gradient blending
        const finalSeeds = [];
        const innerRadius = maxDist * (1.0 - blendRadius) * 0.4;
        const outerRadius = maxDist * (1.0 - blendRadius * 0.5);

        // Include hex seeds outside center region
        for (const hexSeed of hexSeeds) {
            const distFromCenter = Geometry.distance(hexSeed, { x: centerX, y: centerY });
            const blendFactor = Geometry.smoothstep(innerRadius, outerRadius, distFromCenter);

            if (blendFactor > 0.3) {
                finalSeeds.push(hexSeed);
            }
        }

        // Include Voronoi seeds inside center region, lerped towards nearest hex seed near outer edge
        for (const vSeed of voronoiSeeds) {
            const distFromCenter = Geometry.distance(vSeed, { x: centerX, y: centerY });
            const blendFactor = Geometry.smoothstep(innerRadius, outerRadius, distFromCenter);

            if (blendFactor < 0.8) {
                const nearestHex = HoneycombGrid.getNearestHexSeed(vSeed, hexSeeds);
                const blended = Geometry.lerpPoint(vSeed, nearestHex, blendFactor);
                finalSeeds.push(blended);
            }
        }

        return finalSeeds;
    }
}
