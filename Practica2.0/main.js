import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ==========================================
// 1. CONFIGURACIÓN BÁSICA (Escena, Cámara, Renderer)
// ==========================================
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Extra: Habilitar sombras
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ==========================================
// 2. ILUMINACIÓN
// ==========================================
const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // Luz suave general
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(10, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// ==========================================
// 3. CREACIÓN DE OBJETOS BÁSICOS
// ==========================================
// Usaremos la propiedad 'userData' para guardar la información que mostrará el panel.
const objectsToTest = []; // Array para el Raycaster

// 3.1 Cubo (Satélite de comunicaciones)
const boxGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const boxMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.8 });
const satellite = new THREE.Mesh(boxGeo, boxMat);
satellite.position.set(-6, 0, 0);
satellite.userData = {
    name: "Satélite ComX",
    type: "Dispositivo Artificial",
    description: "Satélite de retransmisión de datos en órbita baja.",
    extra: "Estado: Activo | Material: Titanio"
};
scene.add(satellite);
objectsToTest.push(satellite);

// 3.2 Esfera (Planeta Tierra)
const sphereGeo = new THREE.SphereGeometry(2, 32, 32);
const sphereMat = new THREE.MeshStandardMaterial({ color: 0x2266cc });
const earth = new THREE.Mesh(sphereGeo, sphereMat);
earth.position.set(0, 0, 0);
earth.userData = {
    name: "Planeta Azul",
    type: "Planeta Terrestre",
    description: "Tercer planeta del sistema, único con vida conocida.",
    extra: "Gravedad: 9.8 m/s²"
};
scene.add(earth);
objectsToTest.push(earth);

// 3.3 Cilindro (Estación Espacial Modular)
const cylGeo = new THREE.CylinderGeometry(0.5, 0.5, 4, 32);
const cylMat = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
const station = new THREE.Mesh(cylGeo, cylMat);
station.position.set(6, 0, 0);
station.userData = {
    name: "Estación Cilindro-Z",
    type: "Hábitat Espacial",
    description: "Módulo principal de investigación científica.",
    extra: "Capacidad: 6 Astronautas"
};
scene.add(station);
objectsToTest.push(station);

// 3.4 Toroide (Anillo de anomalía / Portal)
const torusGeo = new THREE.TorusGeometry(3, 0.2, 16, 100);
const torusMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc, emissive: 0x004422 });
const portal = new THREE.Mesh(torusGeo, torusMat);
portal.position.set(0, 0, -8);
portal.rotation.x = Math.PI / 2;
portal.userData = {
    name: "Anillo Energético",
    type: "Anomalía Espacial",
    description: "Estructura de origen desconocido que emite radiación baja.",
    extra: "Clasificación: Segura"
};
scene.add(portal);
objectsToTest.push(portal);

// ==========================================
// 4. CARGA DE MODELO EXTERNO (.glb)
// ==========================================
const loader = new GLTFLoader();
loader.load(
    'models/rocket.glb', // Asegúrate de tener un archivo válido aquí
    function (gltf) {
        const model = gltf.scene;
        model.position.set(0, -2, 6);
        model.scale.set(0.5, 0.5, 0.5); // Ajusta la escala según tu modelo
        
        // Agregar datos a todos los sub-objetos del modelo (Mesh) para el raycast
        model.traverse((child) => {
            if (child.isMesh) {
                child.userData = {
                    name: "Cohete Explorador",
                    type: "Vehículo de Lanzamiento",
                    description: "Modelo GLTF externo cargado en la escena.",
                    extra: "Combustible: Hidrógeno líquido"
                };
                objectsToTest.push(child);
            }
        });
        scene.add(model);
    },
    undefined,
    function (error) {
        console.error('Error cargando el modelo:', error);
    }
);

// ==========================================
// 5. RAYCASTING Y UI (Interacción)
// ==========================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Elementos del DOM
const infoPanel = document.getElementById('info-panel');
const infoName = document.getElementById('info-name');
const infoType = document.getElementById('info-type');
const infoDesc = document.getElementById('info-desc');
const infoExtra = document.getElementById('info-extra');

window.addEventListener('pointerdown', (event) => {
    // Normalizar coordenadas del mouse (-1 a +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objectsToTest);

    if (intersects.length > 0) {
        // Tomar el primer objeto intersectado
        const selectedObject = intersects[0].object;
        const data = selectedObject.userData;

        // Si el objeto tiene información, mostrarla
        if (data && data.name) {
            infoName.innerText = data.name;
            infoType.innerText = data.type;
            infoDesc.innerText = data.description;
            infoExtra.innerText = data.extra;
            infoPanel.classList.remove('hidden');

            // Nivel extra: Resaltar temporalmente (cambiar color)
            const currentColor = selectedObject.material.color.getHex();
            selectedObject.material.color.setHex(0xff0000);
            setTimeout(() => selectedObject.material.color.setHex(currentColor), 300);
        }
    }
});

// Cerrar panel
document.getElementById('btn-close-info').addEventListener('click', () => {
    infoPanel.classList.add('hidden');
});

// ==========================================
// 6. CONTROLES HTML
// ==========================================
let isAnimating = true;

document.getElementById('btn-anim').addEventListener('click', (e) => {
    isAnimating = !isAnimating;
    e.target.innerText = isAnimating ? "Pausar Animación" : "Reanudar Animación";
});

document.getElementById('btn-reset').addEventListener('click', () => {
    camera.position.set(0, 5, 15);
    controls.target.set(0, 0, 0);
});

document.getElementById('light-slider').addEventListener('input', (e) => {
    directionalLight.intensity = parseFloat(e.target.value);
});

// Ajuste responsivo al redimensionar ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==========================================
// 7. ANIMACIÓN (Bucle)
// ==========================================
function animate() {
    requestAnimationFrame(animate);

    if (isAnimating) {
        earth.rotation.y += 0.005;
        satellite.rotation.x += 0.01;
        satellite.rotation.y += 0.01;
        station.rotation.z += 0.002;
        portal.rotation.z += 0.005;
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();