// 2D SVG exporter utility for laser cutting & vector workflows

export class SVGExporterUtil {
    /**
     * Export 2D cell polygons as downloadable SVG file
     * @param {Array<Array<{x: number, y: number}>>} cellPolygons 
     * @param {number} width 
     * @param {number} height 
     * @param {string} filename 
     */
    static exportSVG(cellPolygons, width, height, filename = 'voronoi_pattern.svg') {
        if (!cellPolygons || cellPolygons.length === 0) {
            alert('No cell pattern available to export.');
            return;
        }

        let pathsSVG = '';

        for (const poly of cellPolygons) {
            if (poly.length < 3) continue;

            let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`;
            for (let i = 1; i < poly.length; i++) {
                d += ` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`;
            }
            d += ' Z';

            pathsSVG += `  <path d="${d}" fill="#4285F4" fill-opacity="0.2" stroke="#1A73E8" stroke-width="1.5" />\n`;
        }

        const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}mm" height="${height}mm">
  <!-- Outer boundary frame -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="none" stroke="#333333" stroke-width="2" />
  <!-- Voronoi / Honeycomb cells -->
${pathsSVG}
</svg>`;

        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }
}
