// Math & Geometry utilities for 2D Voronoi operations

export class Geometry {
    static distance(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static center(p1, p2) {
        return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    }

    static lerp(a, b, t) {
        return a + (b - a) * t;
    }

    static lerpPoint(p1, p2, t) {
        return {
            x: Geometry.lerp(p1.x, p2.x, t),
            y: Geometry.lerp(p1.y, p2.y, t)
        };
    }

    static smoothstep(min, max, value) {
        const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
        return x * x * (3 - 2 * x);
    }

    // Line intersection of two line segments / infinite lines defined by endpoints
    static intersectLines(e1, e2) {
        const x1 = e1.v1.x, y1 = e1.v1.y;
        const x2 = e1.v2.x, y2 = e1.v2.y;
        const x3 = e2.v1.x, y3 = e2.v1.y;
        const x4 = e2.v2.x, y4 = e2.v2.y;

        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(denom) < 1e-6) return null;

        const px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
        const py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

        return { x: px, y: py };
    }

    // Offset a directed segment (v1 -> v2) to the left by distance d
    static offsetSegment(v1, v2, distance) {
        const dx = v2.x - v1.x;
        const dy = v2.y - v1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1e-6) return { v1: { ...v1 }, v2: { ...v2 } };

        // Normal vector pointing inward (left of v1 -> v2 in CCW order)
        const nx = -dy / len;
        const ny = dx / len;

        return {
            v1: { x: v1.x + nx * distance, y: v1.y + ny * distance },
            v2: { x: v2.x + nx * distance, y: v2.y + ny * distance }
        };
    }

    // Parallel retraction of a CCW polygon by spacing / 2
    static retractPolygon(vertices, distance) {
        if (vertices.length < 3 || distance <= 0) return vertices;

        const n = vertices.length;
        const offsetSegments = [];

        for (let i = 0; i < n; i++) {
            const v1 = vertices[i];
            const v2 = vertices[(i + 1) % n];
            offsetSegments.push(Geometry.offsetSegment(v1, v2, distance));
        }

        const newVertices = [];
        for (let i = 0; i < n; i++) {
            const seg1 = offsetSegments[(i + n - 1) % n];
            const seg2 = offsetSegments[i];
            const pt = Geometry.intersectLines(seg1, seg2);

            if (pt && !isNaN(pt.x) && !isNaN(pt.y)) {
                newVertices.push(pt);
            } else {
                newVertices.push(seg2.v1);
            }
        }

        return newVertices;
    }
}
