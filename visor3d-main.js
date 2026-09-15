// 1. Escena y fondo blanco (como en tu foto)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); 

// Agregar la cuadrícula (Grid) del suelo
const gridHelper = new THREE.GridHelper(15, 15);
scene.add(gridHelper);

// 2. Cámara (acomodada para ver desde arriba)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 4, 6); 

// 3. Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 6. Luces
const luzAmbiental = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(luzAmbiental);
const luzDireccional = new THREE.DirectionalLight(0xffffff, 0.8);
luzDireccional.position.set(5, 10, 5);
scene.add(luzDireccional);

const objetosInteractivos = []; // Para los clics

// 4 y 5. Geometrías y Materiales idénticos a tu foto

// --- ESFERA ROSA (Izquierda) ---
const geometriaEsfera = new THREE.SphereGeometry(0.8, 32, 32);
const materialEsfera = new THREE.MeshStandardMaterial({ color: 0xff66cc }); 
const esfera = new THREE.Mesh(geometriaEsfera, materialEsfera);
esfera.position.set(-2, 0.8, -1);
esfera.name = "Esfera Rosa";
scene.add(esfera);
objetosInteractivos.push(esfera);

// --- CUBO AZUL (Centro) ---
const geometriaCubo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
const materialCubo = new THREE.MeshStandardMaterial({ color: 0x33ccff });
const cubo = new THREE.Mesh(geometriaCubo, materialCubo);
cubo.position.set(0, 0.6, -1);
cubo.name = "Cubo Azul";
scene.add(cubo);
objetosInteractivos.push(cubo);

// --- PLANO BEIGE (Derecha, de pie) ---
const geometriaPlano = new THREE.PlaneGeometry(1.5, 1.5);
const materialPlano = new THREE.MeshStandardMaterial({ color: 0xd2b48c, side: THREE.DoubleSide });
const plano = new THREE.Mesh(geometriaPlano, materialPlano);
plano.position.set(2, 0.75, -1);
plano.name = "Plano Beige";
scene.add(plano);
objetosInteractivos.push(plano);

// 9. Cargar modelo 3D (El animal al frente)
const loader = new THREE.GLTFLoader();
loader.load(
    'models/animal.glb', // Va a buscar este archivo
    function (gltf) {
        const modelo = gltf.scene;
        modelo.position.set(0, 0, 1.5); // Lo pone justo al frente
        modelo.scale.set(0.5, 0.5, 0.5); // Lo hace chiquito, cámbialo si ocupas
        modelo.name = "Mi Animal 3D";
        scene.add(modelo);
        
        modelo.traverse((hijo) => {
            if (hijo.isMesh) {
                hijo.name = "Mi Animal 3D";
                objetosInteractivos.push(hijo);
            }
        });
    },
    undefined,
    function (error) {
        console.warn("Falta meter el animal.glb en la carpeta models/");
    }
);

// 7. OrbitControls (para rotar con el mouse)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 10. Raycasting (Clics)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objetosInteractivos);

    if (intersects.length > 0) {
        const obj = intersects[0].object;
        
        // 11. Acción al hacer clic: cambiar color
        if (obj.material && obj.material.color) {
            obj.material.color.setHex(Math.random() * 0xffffff);
        }
        document.getElementById('ui-info').innerText = "Seleccionaste: " + obj.name;
    }
});

// 8. Animación
function animacion() {
    requestAnimationFrame(animacion);
    
    // Rotación leve para que no esté estático
    cubo.rotation.y += 0.01;
    esfera.rotation.x += 0.01;

    controls.update();
    renderer.render(scene, camera);
}
animacion();