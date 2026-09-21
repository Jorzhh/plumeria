import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 1. CONFIGURACIÓN BÁSICA (Escena, Cámara, Renderer)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333); // Fondo oscuro

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 2. ILUMINACIÓN (Ambiental y Direccional)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Array para guardar todos los objetos interactuables
const interactableObjects = [];

// 3. CREACIÓN DE OBJETOS BÁSICOS (Mínimo 5, mínimo 3 geometrías)
function createObject(geometry, color, position, data) {
    const material = new THREE.MeshStandardMaterial({ color: color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    
    // AQUÍ ESTÁ LA MAGIA: Guardamos la información dentro del mismo objeto 3D
    mesh.userData = data; 
    
    scene.add(mesh);
    interactableObjects.push(mesh);
    return mesh;
}

// Objeto 1: Cubo
const obj1 = createObject(new THREE.BoxGeometry(2, 2, 2), 0xff5555, new THREE.Vector3(-4, 1, 0), {
    name: "Cubo Base", type: "Geometría Primitiva", description: "Un cubo estándar de proporciones iguales.", extra: "Categoría: Estructural"
});

// Objeto 2: Esfera
const obj2 = createObject(new THREE.SphereGeometry(1.5, 32, 32), 0x55ff55, new THREE.Vector3(0, 1.5, -3), {
    name: "Núcleo Esférico", type: "Geometría Primitiva", description: "Esfera perfecta con alta resolución.", extra: "Función: Centro de gravedad"
});

// Objeto 3: Cilindro
const obj3 = createObject(new THREE.CylinderGeometry(1, 1, 3, 32), 0x5555ff, new THREE.Vector3(4, 1.5, 0), {
    name: "Columna", type: "Geometría Primitiva", description: "Un cilindro que sirve como soporte.", extra: "Categoría: Soporte"
});

// Objeto 4: Toroide (Dona)
const obj4 = createObject(new THREE.TorusGeometry(1, 0.4, 16, 100), 0xffff55, new THREE.Vector3(-2, 1, 4), {
    name: "Anillo", type: "Geometría Compleja", description: "Un toroide utilizado para demostrar rotación.", extra: "Tamaño: 2m diámetro"
});

// Objeto 5: Cono
const obj5 = createObject(new THREE.ConeGeometry(1.5, 3, 32), 0xff55ff, new THREE.Vector3(2, 1.5, 4), {
    name: "Punta de Flecha", type: "Geometría Primitiva", description: "Cono apuntando hacia arriba.", extra: "Función: Indicador"
});

// --- VARIABLES GLOBALES PARA LOS BOTONES NUEVOS ---
let externalModel = null; 
const focusableObjects = [obj1, obj2, obj3, obj4, obj5]; 
let currentFocusIndex = 0;
// --------------------------------------------------

// 4. CARGA DE MODELO EXTERNO (.glb o .gltf)
const loader = new GLTFLoader();

loader.load('./models/modelo.glb', function (gltf) {
    const model = gltf.scene;

    model.scale.set(0.1, 0.1, 0.1); 
    model.position.set(0, -0.1, 0); 
    
    model.userData = {
        name: "Lego Batman", 
        type: "Figura Coleccionable (.glb)",
        description: "Un modelo detallado de Lego Batman.",
        extra: "Colección: LEGO DC"
    };
    
    scene.add(model);
    
    // Conectamos a Batman con los botones de la interfaz
    externalModel = model; 
    focusableObjects.push(model);
    
    model.traverse((child) => {
        if (child.isMesh) {
            child.userData = model.userData; 
            interactableObjects.push(child);
        }
    });

    controls.target.set(0, 0.5, 0);
    camera.position.set(0, 2, 5); 

}, undefined, function (error) {
    console.error('Error cargando el modelo:', error);
});

// 5. RAYCASTING (Selección de objetos)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;

const infoPanel = document.getElementById('info-panel');
const infoName = document.getElementById('info-name');
const infoType = document.getElementById('info-type');
const infoDesc = document.getElementById('info-desc');
const infoExtra = document.getElementById('info-extra');

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(interactableObjects, false);

    if (intersects.length > 0) {
        selectedObject = intersects[0].object;
        const data = selectedObject.userData;

        infoName.textContent = data.name || "Sin nombre";
        infoType.textContent = data.type || "Desconocido";
        infoDesc.textContent = data.description || "Sin descripción";
        infoExtra.textContent = data.extra || "-";
        
        infoPanel.classList.remove('hidden');
    } else {
        infoPanel.classList.add('hidden');
        selectedObject = null;
    }
});

// 6. CONTROLES HTML
let isAnimating = true;

document.getElementById('btn-anim').addEventListener('click', () => {
    isAnimating = !isAnimating;
});

document.getElementById('btn-color').addEventListener('click', () => {
    if (selectedObject && selectedObject.material) {
        selectedObject.material.color.setHex(Math.random() * 0xffffff);
    } else {
        alert("Primero selecciona un objeto primitivo haciendo clic en él.");
    }
});

// Botón para ocultar/mostrar a Batman
document.getElementById('btn-visibility').addEventListener('click', () => {
    if (externalModel) {
        externalModel.visible = !externalModel.visible; 
    } else {
        alert("El modelo aún está cargando...");
    }
});

// Botón para cambiar entre diferentes objetos (Enfocar)
document.getElementById('btn-cycle').addEventListener('click', () => {
    if (focusableObjects.length > 0) {
        currentFocusIndex = (currentFocusIndex + 1) % focusableObjects.length;
        const targetObj = focusableObjects[currentFocusIndex];
        
        const targetPosition = new THREE.Vector3();
        targetObj.getWorldPosition(targetPosition);

        controls.target.copy(targetPosition);
        camera.position.set(targetPosition.x, targetPosition.y + 2, targetPosition.z + 4);
    }
});

document.getElementById('btn-reset').addEventListener('click', () => {
    camera.position.set(0, 5, 10);
    controls.target.set(0, 0, 0);
});

document.getElementById('light-slider').addEventListener('input', (event) => {
    directionalLight.intensity = event.target.value;
});

// 7. ANIMACIÓN (requestAnimationFrame)
function animate() {
    requestAnimationFrame(animate);

    if (isAnimating) {
        obj4.rotation.x += 0.01;
        obj4.rotation.y += 0.01;
        obj2.rotation.y += 0.02;
    }

    controls.update();
    renderer.render(scene, camera);
}

// Redimensionar ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();