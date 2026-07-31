// UI controller for sidebar controls and event listeners

export function setupUI(app) {
    // Helper to bind slider + value display
    function bindSlider(sliderId, valueId, configKey, formatter = (v) => v) {
        const slider = document.getElementById(sliderId);
        const display = document.getElementById(valueId);
        if (!slider) return;

        slider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (display) display.textContent = formatter(val);
            app.updateConfig({ [configKey]: val });
        });
    }

    // Bind all sliders
    bindSlider('slider-seeds', 'val-seeds', 'seedCount', (v) => Math.round(v));
    bindSlider('slider-spacing', 'val-spacing', 'spacing', (v) => `${v.toFixed(1)} mm`);
    bindSlider('slider-depth', 'val-depth', 'depth', (v) => `${v.toFixed(1)} mm`);
    bindSlider('slider-width', 'val-width', 'width', (v) => `${Math.round(v)} mm`);
    bindSlider('slider-height', 'val-height', 'height', (v) => `${Math.round(v)} mm`);
    bindSlider('slider-blend', 'val-blend', 'blendRadius', (v) => `${Math.round(v * 100)}%`);

    // Extrusion Mode Segmented Control
    const modeButtons = document.querySelectorAll('[data-mode]');
    modeButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            modeButtons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            const mode = btn.getAttribute('data-mode');
            app.updateConfig({ mode });
        });
    });

    // Curve Style Segmented Control
    const curveButtons = document.querySelectorAll('[data-curve]');
    curveButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            curveButtons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            const curveStyle = btn.getAttribute('data-curve');
            app.updateConfig({ curveStyle });
        });
    });

    // Color picker
    const colorPicker = document.getElementById('input-color');
    if (colorPicker) {
        colorPicker.addEventListener('input', (e) => {
            app.updateConfig({ color: e.target.value });
        });
    }

    // Action buttons
    const btnRandomize = document.getElementById('btn-randomize');
    if (btnRandomize) {
        btnRandomize.addEventListener('click', () => {
            app.updatePattern();
        });
    }

    const btnResetView = document.getElementById('btn-reset-view');
    if (btnResetView) {
        btnResetView.addEventListener('click', () => {
            app.resetView();
        });
    }

    const btnExportSTL = document.getElementById('btn-export-stl');
    if (btnExportSTL) {
        btnExportSTL.addEventListener('click', () => {
            app.exportSTL();
        });
    }

    const btnExportSVG = document.getElementById('btn-export-svg');
    if (btnExportSVG) {
        btnExportSVG.addEventListener('click', () => {
            app.exportSVG();
        });
    }
}
