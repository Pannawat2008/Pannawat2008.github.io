// 3D Extrusion engine for turning 2D Voronoi polygons into 3D Three.js Geometries

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class Extruder {
    /**
     * Create 3D extruded geometry from cell polygons
     * @param {Array<Array<{x: number, y: number}>>} cellPolygons 
     * @param {Object} options 
     * @param {number} options.width - Panel width
     * @param {number} options.height - Panel height
     * @param {number} options.depth - Extrusion height/thickness
     * @param {string} options.mode - 'walls' | 'cells' | 'through-cut'
     * @returns {THREE.BufferGeometry}
     */
    static create3DGeometry(cellPolygons, options) {
        const { width, height, depth = 10, mode = 'walls' } = options;

        const geometries = [];

        if (mode === 'cells') {
            // Extrude each cell as an individual solid polygon
            for (const poly of cellPolygons) {
                if (poly.length < 3) continue;

                const shape = new THREE.Shape();
                shape.moveTo(poly[0].x, poly[0].y);
                for (let i = 1; i < poly.length; i++) {
                    shape.lineTo(poly[i].x, poly[i].y);
                }
                shape.closePath();

                const extrudeSettings = {
                    depth: depth,
                    bevelEnabled: true,
                    bevelThickness: 0.5,
                    bevelSize: 0.5,
                    bevelSegments: 2
                };

                const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                geometries.push(geom);
            }
        } else if (mode === 'walls' || mode === 'through-cut') {
            // Solid outer rectangle plate with cell polygons as holes cut out
            const outerShape = new THREE.Shape();
            outerShape.moveTo(0, 0);
            outerShape.lineTo(width, 0);
            outerShape.lineTo(width, height);
            outerShape.lineTo(0, height);
            outerShape.closePath();

            // Add cell polygons as holes
            for (const poly of cellPolygons) {
                if (poly.length < 3) continue;

                const hole = new THREE.Path();
                // Clockwise order for holes
                hole.moveTo(poly[0].x, poly[0].y);
                for (let i = poly.length - 1; i >= 0; i--) {
                    hole.lineTo(poly[i].x, poly[i].y);
                }
                hole.closePath();
                outerShape.holes.push(hole);
            }

            const isThroughCut = (mode === 'through-cut');
            const extrudeSettings = {
                depth: depth,
                bevelEnabled: !isThroughCut,
                bevelThickness: isThroughCut ? 0 : 0.5,
                bevelSize: isThroughCut ? 0 : 0.5,
                bevelSegments: isThroughCut ? 1 : 2
            };

            const plateGeom = new THREE.ExtrudeGeometry(outerShape, extrudeSettings);
            geometries.push(plateGeom);
        }

        if (geometries.length === 0) {
            // Fallback box geometry
            return new THREE.BoxGeometry(width, height, depth);
        }

        // Merge all geometries into one BufferGeometry for fast rendering and STL export
        return THREE.BufferGeometryUtils ? 
            THREE.BufferGeometryUtils.mergeGeometries(geometries) : 
            geometries[0];
    }
}
