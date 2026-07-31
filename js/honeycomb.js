// Honeycomb (Hexagonal) Grid Generator

export class HoneycombGrid {
    /**
     * Generate regular hexagonal grid points within bounding box [0, width] x [0, height]
     * @param {number} width 
     * @param {number} height 
     * @param {number} hexRadius - Radius / side length of hexagon
     * @returns {Array<{x: number, y: number}>}
     */
    static generateSeeds(width, height, hexRadius = 25) {
        const seeds = [];
        const dx = hexRadius * Math.sqrt(3);
        const dy = hexRadius * 1.5;

        const cols = Math.ceil(width / dx) + 2;
        const rows = Math.ceil(height / dy) + 2;

        for (let row = -1; row < rows; row++) {
            const xOffset = (row % 2 !== 0) ? dx / 2 : 0;
            const y = row * dy;

            for (let col = -1; col < cols; col++) {
                const x = col * dx + xOffset;
                if (x >= -hexRadius && x <= width + hexRadius && y >= -hexRadius && y <= height + hexRadius) {
                    seeds.push({ x, y });
                }
            }
        }

        return seeds;
    }

    /**
     * Find nearest hex grid seed to a given point
     */
    static getNearestHexSeed(point, hexSeeds) {
        let minDist = Infinity;
        let nearest = hexSeeds[0];

        for (let i = 0; i < hexSeeds.length; i++) {
            const seed = hexSeeds[i];
            const dx = point.x - seed.x;
            const dy = point.y - seed.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < minDist) {
                minDist = distSq;
                nearest = seed;
            }
        }

        return nearest;
    }
}
