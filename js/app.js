// Main Application Controller

import { SceneManager } from './scene.js';
import { PatternBlender } from './pattern-blend.js';
import { VoronoiEngine } from './voronoi-engine.js';
import { Extruder } from './extruder.js';
import { STLExporterUtil } from './export-stl.js';
import { SVGExporterUtil } from './export-svg.js';

export class VoronoiGenApp {
    constructor() {
        this.config = {
            width: 200,
            height: 120,
            seedCount: 40,
            spacing: 2.5,
            depth: 12,
            blendRadius: 0.5,
            curveStyle: 'cubic', // 'cubic' | 'quadratic' | 'straight'
            mode: 'walls',       // 'walls' | 'cells' | 'through-cut'
            color: '#4285F4'
        };

        this.voronoiEngine = new VoronoiEngine();
        this.cellPolygons = [];
        this.sceneManager = null;
    }

    init(containerElement) {
        this.sceneManager = new SceneManager(containerElement);
        this.updatePattern();
    }

    /**
     * Regenerate 2D seeds, Voronoi cells & update 3D mesh
     */
    updatePattern() {
        const bbox = { xl: 0, xr: this.config.width, yt: 0, yb: this.config.height };

        // 1. Generate blended seeds (Voronoi in center -> Honeycomb outside)
        const seeds = PatternBlender.generateBlendedSeeds(this.config);

        // 2. Compute Voronoi cells with retraction and Bezier smoothing
        this.cellPolygons = this.voronoiEngine.computeCells(
            seeds,
            bbox,
            this.config.spacing,
            this.config.curveStyle
        );

        // 3. Extrude 2D cells to 3D Three.js geometry
        const geometry = Extruder.create3DGeometry(this.cellPolygons, this.config);

        // 4. Send geometry to 3D scene viewport
        this.sceneManager.updateMesh(geometry, this.config.color);
    }

    updateConfig(newParams) {
        Object.assign(this.config, newParams);

        if (newParams.color && !newParams.seedCount && !newParams.spacing && !newParams.depth && !newParams.mode) {
            // Just color update
            this.sceneManager.setMaterialColor(newParams.color);
        } else {
            // Full mesh regeneration
            this.updatePattern();
        }
    }

    resetView() {
        if (this.sceneManager) {
            this.sceneManager.resetCamera(this.config.width, this.config.height);
        }
    }

    exportSTL() {
        if (this.sceneManager && this.sceneManager.currentMesh) {
            STLExporterUtil.exportMesh(
                this.sceneManager.currentMesh,
                `voronoi_honeycomb_${this.config.mode}.stl`
            );
        }
    }

    exportSVG() {
        SVGExporterUtil.exportSVG(
            this.cellPolygons,
            this.config.width,
            this.config.height,
            `voronoi_honeycomb_${this.config.curveStyle}.svg`
        );
    }
}
