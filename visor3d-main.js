// 1 & 3. Escena y Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f172a);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight * 0.8);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// 2. Cámara en perspectiva
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / (window.innerHeight * 0.8), 0.1, 1000);
camera.position.set(0, 5, 10);

// 7. OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 6. Iluminación
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1.2);
pointLight.position.set(5, 8, 5);
scene.add(pointLight);

// 4 & 5. Geometrías básicas (Cubo, Esfera, Plano) y materiales diferentes
const objectsGroup = new THREE.Group();

// Cubo
const cubeGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const cubeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 });
const cube = new THREE.Mesh(cubeGeo, cubeMat);
cube.position.set(-3, 1, 0);
cube.userData = { name: "Cubo 3D" };
objectsGroup.add(cube);

// Esfera
const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
const sphereMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, metalness: 0.2 });
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
sphere.position.set(0, 1, 0);
sphere.userData = { name: "Esfera 3D" };
objectsGroup.add(sphere);

// Plano (suelo)
const planeGeo = new THREE.PlaneGeometry(12, 12);
const planeMat = new THREE.MeshStandardMaterial({ color: 0x334155, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = Math.PI / 2;
plane.userData = { name: "Plano de Suelo" };
objectsGroup.add(plane);

scene.add(objectsGroup);

// 9. Carga de un modelo 3D (.glb o .gltf) - Opcional
const loader = new THREE.GLTFLoader();
// loader.load('models/tu_modelo.glb', (gltf) => {
//     gltf.scene.position.set(3, 0, 0);
//     scene.add(gltf.scene);
// }, undefined, (error) => { console.log('Modelo opcional no cargado', error); });

// 10 & 11. Raycasting para seleccionar objetos con el mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    if (event.clientY < rect.bottom) {
        mouse.x = ((event.clientX - rect.left) / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / renderer.domElement.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(objectsGroup.children);

        if (intersects.length > 0) {
            const selectedObject = intersects[0].object;
            selectedObject.material.color.setHex(Math.random() * 0xffffff);
            document.getElementById('info-panel').innerHTML = `
                <h2>Objeto Seleccionado:</h2>
                <p style="color: #38bdf8; font-weight: bold;">${selectedObject.userData.name || 'Objeto sin nombre'}</p>
            `;
        }
    }
});

// 8. Animación con requestAnimationFrame
function animate() {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.005;
    cube.rotation.y += 0.005;
    sphere.rotation.y += 0.01;

    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / (window.innerHeight * 0.8);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight * 0.8);
});