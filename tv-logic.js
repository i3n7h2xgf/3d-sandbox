import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 1. Inisialisasi Container & Scene
const container = document.getElementById('tv-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// 2. Pencahayaan
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const tvGlow = new THREE.PointLight(0x00ffff, 0, 10);
scene.add(tvGlow);

// 3. Variables & Loader
let tvModel, tvScreen;
const mouse = { x: 0, y: 0 };
const loader = new GLTFLoader();

loader.load('retrotv.glb', (gltf) => {
    tvModel = gltf.scene;

    // Putar agar hadap depan (sesuaikan nilai ini jika masih miring)
    tvModel.rotation.y = -Math.PI / 2; 
    
    // Auto-Center Model
    const box = new THREE.Box3().setFromObject(tvModel);
    const center = box.getCenter(new THREE.Vector3());
    tvModel.position.sub(center); 

    scene.add(tvModel);

    // Cari Mesh Layar
    tvModel.traverse((child) => {
        if (child.isMesh && (child.name.toLowerCase().includes('screen') || child.material.name.toLowerCase().includes('screen'))) {
            tvScreen = child;
            tvScreen.material = new THREE.MeshStandardMaterial({ 
                color: 0x000000,
                roughness: 0.2,
                metalness: 0.8
            });
        }
    });
}, undefined, (err) => console.error("Gagal load model:", err));

// 4. Interaction Events
container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    // Koordinat mouse dihitung hanya di dalam area TV
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
});

container.addEventListener('mouseenter', () => {
    gsap.to(camera.position, { z: 4.3, duration: 0.7, ease: "power2.out" });
    gsap.to(tvGlow, { intensity: 25, duration: 0.4 });
    if(tvScreen) {
        gsap.to(tvScreen.material.color, { r: 0.8, g: 1, b: 1, duration: 0.3 });
        tvScreen.material.emissive = new THREE.Color(0x00ffff);
        gsap.to(tvScreen.material, { emissiveIntensity: 2.5, duration: 0.3 });
    }
});

container.addEventListener('mouseleave', () => {
    gsap.to(camera.position, { z: 5, duration: 0.7, ease: "power2.inOut" });
    gsap.to(tvGlow, { intensity: 0, duration: 0.5 });
    if(tvScreen) {
        gsap.to(tvScreen.material.color, { r: 0, g: 0, b: 0, duration: 0.5 });
        gsap.to(tvScreen.material, { emissiveIntensity: 0, duration: 0.5 });
    }
    // Reset rotasi parallax pelan-pelan
    mouse.x = 0;
    mouse.y = 0;
});

// 5. Render Loop
function animate() {
    requestAnimationFrame(animate);

    if (tvModel) {
        // Target Rotasi: Idle (-PI/2) + Input Mouse
        const targetRotX = mouse.y * 0.25;
        const targetRotY = (-Math.PI / 2) + (mouse.x * 0.35);

        // Smoothing (Lerp)
        tvModel.rotation.x += (targetRotX - tvModel.rotation.x) * 0.08;
        tvModel.rotation.y += (targetRotY - tvModel.rotation.y) * 0.08;
        
        // Letakkan lampu pas di depan layar
        tvGlow.position.set(0, 0, 0.6);
    }

    renderer.render(scene, camera);
}
animate();

// 6. Handle Responsive
window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
});
