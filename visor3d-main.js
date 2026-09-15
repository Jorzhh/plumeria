// 1. Crear una escena básica con Three.js
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1e293b);

// 2. Agregar una cámara en perspectiva
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

// 3. Configurar el renderer para mostrar la escena en pantalla
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// 7. Usar OrbitControls para rotar, acercar y alejar la cámara
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 6. Agregar iluminación a la escena
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1.5);
pointLight.position.set(5, 8, 5);
scene.add(pointLight);

// Grupo para almacenar los objetos interactivos
const interactables = [];

// 4 & 5. Agregar al menos tres geometrías básicas con materiales diferentes
// Cubo
const cubeGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const cubeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2 });
const cube = new THREE.Mesh(cubeGeo, cubeMat);
cube.position.set(-3, 1, 0);
cube.userData = { name: "Cubo 3D" };
scene.add(cube);
interactables.push(cube);

// Esfera
const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
const sphereMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, metalness: 0.3 });
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
sphere.position.set(0, 1, 0);
sphere.userData = { name: "Esfera 3D" };
scene.add(sphere);
interactables.push(sphere);

// Plano
const planeGeo = new THREE.PlaneGeometry(12, 12);
const planeMat = new THREE.MeshStandardMaterial({ color: 0x475569, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = Math.PI / 2;
plane.userData = { name: "Plano del Suelo" };
scene.add(plane);
interactables.push(plane);

// 9. Cargar al menos un modelo 3D en formato .glb o .gltf
const loader = new THREE.GLTFLoader();
loader.load(
    'models/tu_modelo.glb', // Asegúrate de poner un archivo real en la carpeta models/ si lo usas
    (gltf) => {
        const model = gltf.scene;
        model.position.set(3, 0, 0);
        model.scale.set(1.5, 1.5, 1.5);
        model.userData = { name: "Modelo GLTF Externo" };
        scene.add(model);
        interactables.push(model);
    },
    undefined,
    (error) => {
        console.log("Nota: No se encontró modelo externo en models/, pero el visor funciona con las geometrías básicas.");
    }
);

// 10 & 11. Implementar raycasting para seleccionar un objeto y realizar acción visible
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactables, true);

    if (intersects.length > 0) {
        let selectedObject = intersects[0].object;
        
        // Si el objeto pertenece a un modelo cargado, subimos al objeto raíz si es necesario
        while (selectedObject.parent && selectedObject.parent !== scene && !interactables.includes(selectedObject)) {
            selectedObject = selectedObject.parent;
        }

        // Acción visible: Cambiar color de material si lo tiene e imprimir en consola
        if (selectedObject.material) {
            selectedObject.material.color.setHex(Math.random() * 0xffffff);
        }
        console.p = console.log;
        console.log(`Objeto seleccionado: ${selectedObject.userData.name || 'Desconocido'}`);
        
        document.getElementById('info').innerText = `Seleccionado: ${selectedObject.userData.name || 'Objeto 3D'}`;
    }
});

// 8. Crear una animación usando requestAnimationFrame
function animate() {
    requestAnimationFrame(animate);

    // Animación continua suave
    cube.rotation.x += 0.005;
    cube.rotation.y += 0.005;
    sphere.rotation.y += 0.01;

    controls.update();
    renderer.render(scene, camera);
}

animate();

// Ajustar tamaño de pantalla dinámicamente
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});