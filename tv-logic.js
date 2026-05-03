(function() {
    const container = document.getElementById("tv-container");
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / (container.clientWidth * 0.75), 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(container.clientWidth, container.clientWidth * 0.75);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 2));

    const loader = new THREE.GLTFLoader(); // Pake THREE.GLTFLoader
    loader.load('yagitu.glb', (gltf) => {
        const tv = gltf.scene;
        scene.add(tv);
        
        // Auto-fit biar keliatan
        const box = new THREE.Box3().setFromObject(tv);
        const size = box.getSize(new THREE.Vector3());
        camera.position.z = Math.max(size.x, size.y) * 2;
        
        console.log("TV MUNCUL!");

        function animate() {
            requestAnimationFrame(animate);
            tv.rotation.y += 0.01; // Biar lo tau dia ada
            renderer.render(scene, camera);
        }
        animate();
    }, undefined, (err) => console.error("File GLB gak ketemu:", err));
})();