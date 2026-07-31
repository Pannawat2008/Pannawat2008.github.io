// Three.js 3D Viewport Scene Manager

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import * as BufferGeometryUtils from 'https://unpkg.com/three@0.160.0/examples/jsm/utils/BufferGeometryUtils.js';

// Attach BufferGeometryUtils to THREE for Extruder module
THREE.BufferGeometryUtils = BufferGeometryUtils;

export class SceneManager {
    constructor(containerElement) {
        this.container = containerElement;

        // 1. Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('#F8F9FA');

        // 2. Camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            this.container.clientWidth / this.container.clientHeight,
            1,
            5000
        );

        // 3. Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // 4. Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // 5. Lighting
        this.setupLighting();

        // 6. Floor grid
        this.setupGrid();

        // Current mesh reference
        this.currentMesh = null;
        this.materialColor = '#4285F4';

        // Event listeners
        window.addEventListener('resize', () => this.onWindowResize());

        // Initial camera pose
        this.resetCamera(200, 100);

        // Start render loop
        this.animate();
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight1.position.set(200, 400, 300);
        dirLight1.castShadow = true;
        dirLight1.shadow.mapSize.width = 2048;
        dirLight1.shadow.mapSize.height = 2048;
        dirLight1.shadow.camera.near = 10;
        dirLight1.shadow.camera.far = 1000;
        const d = 300;
        dirLight1.shadow.camera.left = -d;
        dirLight1.shadow.camera.right = d;
        dirLight1.shadow.camera.top = d;
        dirLight1.shadow.camera.bottom = -d;
        this.scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0xaaccff, 0.3);
        dirLight2.position.set(-200, -200, -100);
        this.scene.add(dirLight2);
    }

    setupGrid() {
        const gridHelper = new THREE.GridHelper(1000, 50, 0xdddddd, 0xeeeeee);
        gridHelper.position.y = -0.5;
        this.scene.add(gridHelper);
    }

    /**
     * Update or replace the 3D Voronoi Mesh
     */
    updateMesh(geometry, color = this.materialColor) {
        this.materialColor = color;

        if (this.currentMesh) {
            this.scene.remove(this.currentMesh);
            if (this.currentMesh.geometry) this.currentMesh.geometry.dispose();
            if (this.currentMesh.material) this.currentMesh.material.dispose();
        }

        // Center geometry origin to middle of panel
        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox;
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        geometry.translate(-center.x, 0, -center.z);

        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            roughness: 0.3,
            metalness: 0.1,
            side: THREE.DoubleSide
        });

        this.currentMesh = new THREE.Mesh(geometry, material);
        this.currentMesh.castShadow = true;
        this.currentMesh.receiveShadow = true;
        this.scene.add(this.currentMesh);
    }

    setMaterialColor(colorHex) {
        this.materialColor = colorHex;
        if (this.currentMesh && this.currentMesh.material) {
            this.currentMesh.material.color.set(colorHex);
        }
    }

    resetCamera(width = 200, height = 100) {
        const dist = Math.max(width, height) * 2;
        this.camera.position.set(0, dist * 0.8, dist);
        this.camera.lookAt(0, 0, 0);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    onWindowResize() {
        if (!this.container) return;
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}
