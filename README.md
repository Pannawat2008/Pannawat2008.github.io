# 3D Voronoi & Honeycomb Generator

A browser-based 3D parametric Voronoi & Honeycomb pattern generator built with HTML, CSS, JavaScript, and Three.js.

## Features
- **Hybrid Voronoi + Honeycomb Blending**: Seamlessly transitions from organic Voronoi in the center to regular hexagonal honeycomb near the outer edges.
- **Real-Time 3D Extrusion**: Rendered with Three.js WebGL with interactive OrbitControls (rotate, zoom, pan).
- **Multiple Extrusion Modes**:
  - **Walls**: Solid plate with cell cutouts.
  - **Cells**: Elevated cell platforms with gaps.
  - **Through-cut**: Perforated frame suitable for grilles, filters, or lampshades.
- **Bezier Edge Smoothing**: Cubic, Quadratic, or Linear cell outline curves.
- **Export Options**:
  - **STL Export**: Direct binary STL file export for 3D printing (Cura, PrusaSlicer, Bambu Studio).
  - **SVG Export**: 2D vector file export for laser cutting, CNC, or vector editing.
- **Google Material Design UI**: Clean, responsive layout inspired by Google Stitch and Material Design.

## Deployment to GitHub Pages
This project requires no build step. To publish to GitHub Pages:
1. Push all files to the `main` branch of your `username.github.io` repository.
2. Ensure GitHub Pages is set to deploy from the root of the `main` branch under **Repository Settings > Pages**.
