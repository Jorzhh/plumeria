import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 1. CONFIGURACIÓN BÁSICA
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 2. ILUMINACIÓN
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Array para el Raycaster
const interactableObjects = [];

// 3. CREACIÓN DE OBJETOS BÁSICOS
function createObject(geometry, color, position, data) {
    const material = new THREE.MeshStandardMaterial({ color: color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.userData = data; 
    scene.add(mesh);
    interactableObjects.push(mesh);
    return mesh;
}

const obj1 = createObject(new THREE.BoxGeometry(2, 2, 2), 0xff5555, new THREE.Vector3(-4, 1, 0), {
    name: "Cubo Base", type: "Geometría Primitiva", description: "Un cubo estándar.", extra: "Categoría: Estructural"
});
const obj2 = createObject(new THREE.SphereGeometry(1.5, 32, 32), 0x55ff55, new THREE.Vector3(0, 1.5, -3), {
    name: "Núcleo Esférico", type: "Geometría Primitiva", description: "Esfera perfecta.", extra: "Función: Centro de gravedad"
});
const obj3 = createObject(new THREE.CylinderGeometry(1, 1, 3, 32), 0x5555ff, new THREE.Vector3(4, 1.5, 0), {
    name: "Columna", type: "Geometría Primitiva", description: "Un cilindro de soporte.", extra: "Categoría: Soporte"
});
const obj4 = createObject(new THREE.TorusGeometry(1, 0.4, 16, 100), 0xffff55, new THREE.Vector3(-2, 1, 4), {
    name: "Anillo", type: "Geometría Compleja", description: "Un toroide.", extra: "Tamaño: 2m diámetro"
});
const obj5 = createObject(new THREE.ConeGeometry(1.5, 3, 32), 0xff55ff, new THREE.Vector3(2, 1.5, 4), {
    name: "Punta de Flecha", type: "Geometría Primitiva", description: "Cono indicador.", extra: "Función: Indicador"
});

// --- VARIABLES CLAVE PARA LOS BOTONES ---
let externalModel = null; 
const focusableObjects = [obj1, obj2, obj3, obj4, obj5]; 
let currentFocusIndex = 0;
// ----------------------------------------

// 4. CARGA DE MODELO EXTERNO
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
    
    // ¡AQUÍ ESTÁ LA CONEXIÓN PARA LOS BOTONES!
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

// 5. RAYCASTING
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;

const infoPanel = document.getElementById('info-panel');
const infoName = document.getElementById('info-name');
const infoType = document.getElementById('info-type');
const infoDesc = document.getElementById('info-desc');
const infoExtra = document.getElementById('info-extra');

window.addEventListener('click', (event) => {
    // Si hacemos clic en los botones, no disparamos el raycaster
    if(event.target.tagName === 'BUTTON' || event.target.tagName === 'INPUT') return;

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

// Botón Ocultar/Mostrar Batman
document.getElementById('btn-visibility').addEventListener('click', () => {
    if (externalModel) {
        // Cambia la visibilidad al valor contrario (si es true, pasa a false)
        externalModel.visible = !externalModel.visible; 
    } else {
        alert("El modelo aún está cargando...");
    }
});

// Botón Enfocar Siguiente Objeto
document.getElementById('btn-cycle').addEventListener('click', () => {
    if (focusableObjects.length > 0) {
        currentFocusIndex = (currentFocusIndex + 1) % focusableObjects.length;
        const targetObj = focusableObjects[currentFocusIndex];
        
        // Obtener la posición del objeto en el mundo
        const targetPosition = new THREE.Vector3();
        targetObj.getWorldPosition(targetPosition);

        // Apuntar los controles al objeto
        controls.target.copy(targetPosition);
        
        // Mover la cámara un poco hacia arriba y hacia atrás del objeto para verlo bien
        camera.position.set(targetPosition.x, targetPosition.y + 3, targetPosition.z + 5);
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
        // Animamos TODAS las figuras primitivas
        obj1.rotation.y += 0.01; // Cubo gira en Y
        obj2.rotation.y += 0.02; // Esfera gira en Y
        obj3.rotation.x += 0.01; // Cilindro gira en X
        obj4.rotation.x += 0.01; // Toroide gira en X
        obj4.rotation.y += 0.01; // Toroide gira en Y
        obj5.rotation.z += 0.01; // Cono gira en Z
        
        // ¡Nota que no hay rotación para externalModel (Batman)!
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