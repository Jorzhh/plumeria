// 1. Crear una escena básica con Three.js.
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020); // Fondo gris oscuro

// 2. Agregar una cámara en perspectiva.
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 8); // Posición inicial de la cámara

// 3. Configurar el renderer para mostrar la escena en pantalla.
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 6. Agregar iluminación a la escena.
const luzAmbiental = new THREE.AmbientLight(0xffffff, 0.5); // Luz suave global
scene.add(luzAmbiental);

const luzDireccional = new THREE.DirectionalLight(0xffffff, 1); // Luz como el sol
luzDireccional.position.set(5, 10, 5);
scene.add(luzDireccional);

// 4 y 5. Agregar al menos tres geometrías básicas y aplicar materiales diferentes.
const objetosInteractivos = []; // Arreglo para guardar lo que se puede seleccionar

// --- CUBO ---
const geometriaCubo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const materialCubo = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Verde
const cubo = new THREE.Mesh(geometriaCubo, materialCubo);
cubo.position.set(-3, 1, 0);
cubo.name = "Cubo Verde";
scene.add(cubo);
objetosInteractivos.push(cubo);

// --- ESFERA ---
const geometriaEsfera = new THREE.SphereGeometry(1, 32, 32);
const materialEsfera = new THREE.MeshPhongMaterial({ color: 0xff0000, shininess: 100 }); // Rojo brillante
const esfera = new THREE.Mesh(geometriaEsfera, materialEsfera);
esfera.position.set(0, 1, 0);
esfera.name = "Esfera Roja";
scene.add(esfera);
objetosInteractivos.push(esfera);

// --- PLANO ---
const geometriaPlano = new THREE.PlaneGeometry(10, 10);
const materialPlano = new THREE.MeshBasicMaterial({ color: 0x555555, side: THREE.DoubleSide }); // Gris básico
const plano = new THREE.Mesh(geometriaPlano, materialPlano);
plano.rotation.x = Math.PI / 2; // Acostar el plano
plano.name = "Suelo";
scene.add(plano);
objetosInteractivos.push(plano);

// 9. Cargar al menos un modelo 3D en formato .glb o .gltf.
const loader = new THREE.GLTFLoader();
loader.load(
    'models/modelo.glb', // Ruta de tu archivo. ¡Asegúrate de crear la carpeta 'models' y meter un .glb ahí!
    function (gltf) {
        const modelo = gltf.scene;
        modelo.position.set(3, 0, 0); // Lo ponemos a la derecha
        modelo.name = "Modelo Externo GLB";
        scene.add(modelo);
        
        // Hacer que los hijos del modelo sean interactivos
        modelo.traverse((hijo) => {
            if (hijo.isMesh) {
                hijo.name = "Parte del Modelo GLB";
                objetosInteractivos.push(hijo);
            }
        });
    },
    undefined,
    function (error) {
        console.warn("No se encontró el modelo 3D en la carpeta models/. Agrega un archivo llamado 'modelo.glb'.");
    }
);

// 7. Usar OrbitControls para permitir que el usuario rote, acerque y aleje la cámara.
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Movimiento más suave

// 10. Implementar raycasting para seleccionar un objeto con el mouse.
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', onMouseClick, false);

function onMouseClick(event) {
    // Calcular posición del mouse en coordenadas normalizadas (-1 a +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Actualizar el rayo con la cámara y la posición del mouse
    raycaster.setFromCamera(mouse, camera);

    // Calcular objetos intersectados
    const intersects = raycaster.intersectObjects(objetosInteractivos);

    if (intersects.length > 0) {
        const objetoSeleccionado = intersects[0].object;

        // 11. Acción visible al seleccionar (Cambiar color al azar, imprimir en consola y mostrar en pantalla)
        if (objetoSeleccionado.material && objetoSeleccionado.material.color) {
            objetoSeleccionado.material.color.setHex(Math.random() * 0xffffff);
        }
        
        console.log("Objeto seleccionado: " + objetoSeleccionado.name);
        document.getElementById('ui-info').innerText = "Seleccionaste: " + objetoSeleccionado.name;
    }
}

// 8. Crear una animación usando requestAnimationFrame.
function animacion() {
    requestAnimationFrame(animacion);

    // Animación básica de rotación
    cubo.rotation.x += 0.01;
    cubo.rotation.y += 0.01;
    esfera.rotation.y += 0.02;

    controls.update(); // Necesario si enableDamping es true en OrbitControls
    renderer.render(scene, camera);
}

// Iniciar la animación
animacion();

// Hacer que el canvas se ajuste si el usuario cambia el tamaño de la ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});