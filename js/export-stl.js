// STL exporter utility for 3D printing

import { STLExporter } from 'https://unpkg.com/three@0.160.0/examples/jsm/exporters/STLExporter.js';

export class STLExporterUtil {
    /**
     * Export Three.js Mesh to STL file download
     * @param {THREE.Mesh} mesh 
     * @param {string} filename 
     */
    static exportMesh(mesh, filename = 'voronoi_3d.stl') {
        if (!mesh) {
            alert('No 3D model available to export.');
            return;
        }

        const exporter = new STLExporter();
        const result = exporter.parse(mesh, { binary: true });

        const blob = new Blob([result], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }
}
