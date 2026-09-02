// 1. Escena, cámara y renderizador con fondo limpio
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f4f8); // Fondo suave tipo app

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias quita los bordes feos de sierra
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. Iluminación (clave para que los cubos se vean con volumen y "bonitos")
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Luz general suave
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// 3. Un cubo con colores diferentes en cada cara (para que se note el 3D)
const geometry = new THREE.BoxGeometry(2, 2, 2); // Un poco más grande

// Arreglo de materiales con colores pastel/amigables (muy al estilo de tu app)
const materials = [
    new THREE.MeshStandardMaterial({ color: 0xffb7b2 }), // Rosa suave
    new THREE.MeshStandardMaterial({ color: 0xffdac1 }), // Naranja pastel
    new THREE.MeshStandardMaterial({ color: 0xe2f0cb }), // Verde tierno
    new THREE.MeshStandardMaterial({ color: 0xb5ead7 }), // Menta
    new THREE.MeshStandardMaterial({ color: 0xc7ceea }), // Azul lavanda
    new THREE.MeshStandardMaterial({ color: 0xf3c68f })  // Amarillo cálido
];

const cube = new THREE.Mesh(geometry, materials);
scene.add(cube);

camera.position.z = 5;

// 4. Animación suave de rotación en ambos ejes
function animate() {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.005; // Rotación más lenta y elegante
    cube.rotation.y += 0.008;

    renderer.render(scene, camera);
}

animate();

// Ajustar tamaño si cambian la ventana de tamaño
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});