// 2D Voronoi Engine: Cell extraction, parallel retraction & bezier curve generation

import { Voronoi } from '../libs/rhill-voronoi-core.js';
import { Geometry } from './geometry.js';

export class VoronoiEngine {
    constructor() {
        this.voronoi = new Voronoi();
    }

    /**
     * Compute Voronoi cells from 2D seed points within bounding box
     * @param {Array<{x: number, y: number}>} seeds 
     * @param {Object} bbox - {xl, xr, yt, yb}
     * @param {number} spacing - Cell retraction distance (wall thickness / 2)
     * @param {string} curveStyle - 'cubic' | 'quadratic' | 'straight'
     * @returns {Array<Array<{x: number, y: number}>>} Array of cell polygon vertex arrays
     */
    computeCells(seeds, bbox, spacing = 2, curveStyle = 'cubic') {
        if (!seeds || seeds.length === 0) return [];

        const diagram = this.voronoi.compute(seeds, bbox);
        const cellPolygons = [];

        for (const rhillCell of diagram.cells) {
            if (!rhillCell || !rhillCell.halfedges || rhillCell.halfedges.length < 3) continue;

            // Extract CCW vertices
            const rawVertices = [];
            for (const he of rhillCell.halfedges) {
                const pt = he.getStartpoint();
                if (pt && !isNaN(pt.x) && !isNaN(pt.y)) {
                    rawVertices.push({ x: pt.x, y: pt.y });
                }
            }

            if (rawVertices.length < 3) continue;

            // Retract polygon edges inward by spacing
            let retracted = spacing > 0 ? Geometry.retractPolygon(rawVertices, spacing) : rawVertices;

            if (retracted.length < 3) continue;

            // Apply curve smoothing if requested
            if (curveStyle !== 'straight') {
                retracted = this.smoothPolygon(retracted, curveStyle);
            }

            cellPolygons.push(retracted);
        }

        return cellPolygons;
    }

    /**
     * Subdivide and smooth polygon vertices with Bezier interpolation
     */
    smoothPolygon(vertices, curveStyle = 'cubic') {
        const smoothed = [];
        const n = vertices.length;
        const samplesPerEdge = curveStyle === 'cubic' ? 6 : 4;

        for (let i = 0; i < n; i++) {
            const curr = vertices[i];
            const next = vertices[(i + 1) % n];
            const prev = vertices[(i + n - 1) % n];

            const mid = Geometry.center(curr, next);

            if (curveStyle === 'cubic') {
                // Control points towards vertices
                const cp1 = Geometry.lerpPoint(mid, curr, 0.4);
                const cp2 = Geometry.lerpPoint(mid, next, 0.4);

                for (let step = 0; step < samplesPerEdge; step++) {
                    const t = step / samplesPerEdge;
                    smoothed.push(this.evalCubicBezier(mid, cp1, cp2, next, t));
                }
            } else {
                // Quadratic bezier using vertex as control point
                for (let step = 0; step < samplesPerEdge; step++) {
                    const t = step / samplesPerEdge;
                    smoothed.push(this.evalQuadraticBezier(mid, curr, next, t));
                }
            }
        }

        return smoothed;
    }

    evalCubicBezier(p0, p1, p2, p3, t) {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;

        return {
            x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
            y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
        };
    }

    evalQuadraticBezier(p0, p1, p2, t) {
        const u = 1 - t;
        return {
            x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
            y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y
        };
    }
}
