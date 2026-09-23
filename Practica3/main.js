import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// ==========================================
// 1. CONFIGURACIÓN BÁSICA
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Color cielo por defecto

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 8, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Habilitamos sombras
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 3, 0);

// ==========================================
// 2. ILUMINACIÓN
// ==========================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 15, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Suelo (Plano para recibir sombra - Geometría 1)
const pisoGeo = new THREE.PlaneGeometry(50, 50);
const pisoMat = new THREE.MeshStandardMaterial({ color: 0x3a5f43 });
const piso = new THREE.Mesh(pisoGeo, pisoMat);
piso.rotation.x = -Math.PI / 2;
piso.receiveShadow = true;
scene.add(piso);

// ==========================================
// 3. ARREGLOS PARA INTERACTIVIDAD
// ==========================================
const interactableObjects = []; // Para el raycaster
const arrayHojas = []; // Para los botones de color y visibilidad

// Función auxiliar para crear partes con datos para el panel
function crearParte(geometria, color, nombre, tipo, altura, desc) {
    const material = new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 });
    const mesh = new THREE.Mesh(geometria, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Guardamos los datos solicitados en la rúbrica
    mesh.userData = { name: nombre, type: tipo, height: altura, desc: desc };
    interactableObjects.push(mesh);
    
    return mesh;
}

// ==========================================
// 4. CONSTRUCCIÓN DE LA ESCENA Y JERARQUÍAS
// ==========================================

// --- MACETA ---
// Usamos Cilindro (Geometría 2) y Toroide (Geometría 3)
const macetaGroup = new THREE.Group();
scene.add(macetaGroup);

const baseMaceta = crearParte(new THREE.CylinderGeometry(1.5, 1, 2, 32), 0x8B4513, "Base de Maceta", "Cilindro", "0 a 20 cm", "Contiene la tierra y raíces.");
baseMaceta.position.y = 1;
macetaGroup.add(baseMaceta);

const bordeMaceta = crearParte(new THREE.TorusGeometry(1.5, 0.2, 16, 50), 0x5C2E0B, "Borde de Maceta", "Toroide", "20 cm", "Borde decorativo superior.");
bordeMaceta.position.y = 2;
bordeMaceta.rotation.x = Math.PI / 2;
macetaGroup.add(bordeMaceta);

const tierra = crearParte(new THREE.CylinderGeometry(1.4, 1.4, 0.1, 32), 0x3b2a1a, "Tierra", "Cilindro (Plano)", "18 cm", "Sustrato rico en nutrientes.");
tierra.position.y = 1.9;
macetaGroup.add(tierra);

// --- PLANTA (LA JERARQUÍA PRINCIPAL) ---
const planta = new THREE.Group();
planta.position.y = 1.9; // Nace desde la tierra
scene.add(planta);

// Tallo principal
const tallo = crearParte(new THREE.CylinderGeometry(0.2, 0.3, 4, 16), 0x2E4B24, "Tallo Principal", "Cilindro", "20 a 60 cm", "Estructura principal de la Plumeria.");
tallo.position.y = 2; // Lo subimos la mitad de su altura
planta.add(tallo);

// Función para generar ramas, hojas y flores proceduralmente
function crearRamaConHojasYFlores(posY, rotZ, rotX) {
    const ramaGroup = new THREE.Group();
    ramaGroup.position.set(0, posY, 0); // Se pega al tallo en esta altura
    ramaGroup.rotation.set(rotX, 0, rotZ); // Se inclina
    
    // La rama en sí
    const rama = crearParte(new THREE.CylinderGeometry(0.1, 0.15, 2, 16), 0x36592a, "Rama Secundaria", "Cilindro", "60 a 80 cm", "Distribuye nutrientes a las hojas.");
    rama.position.y = 1; // Centro local de la rama
    ramaGroup.add(rama);

    // Corona de Hojas (Usando esferas aplastadas - Geometría 4)
    const coronaHojas = new THREE.Group();
    coronaHojas.position.y = 2; // En la punta de la rama
    ramaGroup.add(coronaHojas);

    for(let i = 0; i < 5; i++) {
        // Esfera aplastada simulando una hoja larga de Plumeria
        const hojaGeo = new THREE.SphereGeometry(0.4, 16, 16);
        const hoja = crearParte(hojaGeo, 0x4CAF50, "Hoja de Plumeria", "Esfera Escalada", "~80 cm", "Realiza la fotosíntesis.");
        
        hoja.scale.set(1, 0.1, 3); // Aplastamos y alargamos la esfera
        hoja.position.z = 1.2; // La alejamos del centro
        
        // Pivot para rotar la hoja en círculo
        const pivotHoja = new THREE.Group();
        pivotHoja.rotation.y = (i * Math.PI * 2) / 5; // Distribuir en estrella
        pivotHoja.rotation.x = 0.3; // Inclinación hacia abajo
        
        pivotHoja.add(hoja);
        coronaHojas.add(pivotHoja);
        arrayHojas.push(hoja); // Guardamos para los controles HTML
    }

    // Flor en el centro de las hojas
    const florGroup = new THREE.Group();
    florGroup.position.y = 2.2; // Un poco arriba de las hojas
    
    const centroFlor = crearParte(new THREE.SphereGeometry(0.15, 16, 16), 0xFFD700, "Centro de Flor", "Esfera", "~82 cm", "Contiene el polen.");
    florGroup.add(centroFlor);

    // --- EXTRA: ELEMENTO DECORATIVO EXTERNO (.glb) ---
const loader = new GLTFLoader();

// Ajusta la ruta si tu archivo se llama diferente o está en otra carpeta
loader.load('./assets/decoracion.glb', function (gltf) {
    const decoracion = gltf.scene;

    // Ajustes de tamaño y posición (modifica esto dependiendo de qué tan grande esté tu modelo)
    decoracion.scale.set(0.5, 0.5, 0.5); 
    decoracion.position.set(3, 0, 2); // Lo movemos a la derecha (X=3) y adelante (Z=2)
    
    // Le asignamos sus datos para el panel interactivo
    decoracion.userData = {
        name: "Elemento Decorativo", 
        type: "Modelo 3D Externo (.glb)",
        height: "Nivel del suelo",
        desc: "Decoración complementaria del jardín botánico."
    };
    
    scene.add(decoracion);
    
    // Hacemos que reciba/proyecte sombras y lo metemos al Raycaster
    decoracion.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.userData = decoracion.userData; 
            interactableObjects.push(child);
        }
    });

}, undefined, function (error) {
    console.error('Error cargando el modelo decorativo:', error);
});

    // 5 Pétalos
    for(let i = 0; i < 5; i++) {
        const petaloGeo = new THREE.SphereGeometry(0.25, 16, 16);
        const petalo = crearParte(petaloGeo, 0xFFFFFF, "Pétalo", "Esfera Escalada", "~82 cm", "Atrae polinizadores con su color y aroma.");
        
        petalo.scale.set(1, 0.2, 1.5);
        petalo.position.z = 0.35;
        
        const pivotPetalo = new THREE.Group();
        pivotPetalo.rotation.y = (i * Math.PI * 2) / 5;
        pivotPetalo.rotation.x = 0.2;
        
        pivotPetalo.add(petalo);
        florGroup.add(pivotPetalo);
    }
    
    ramaGroup.add(florGroup);
    tallo.add(ramaGroup); // ¡JERARQUÍA! Ramas pegadas al tallo
}

// Creamos 3 ramas con la función procedural
crearRamaConHojasYFlores(1.5, 0.6, 0);       // Rama derecha
crearRamaConHojasYFlores(1.8, -0.5, 0.4);    // Rama izquierda/adelante
crearRamaConHojasYFlores(2.5, -0.2, -0.5);   // Rama superior/atrás


// ==========================================
// 5. RAYCASTING (Selección)
// ==========================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const infoPanel = document.getElementById('info-panel');
const infoName = document.getElementById('info-name');
const infoType = document.getElementById('info-type');
const infoHeight = document.getElementById('info-height');
const infoDesc = document.getElementById('info-desc');

let objetoResaltado = null;
const colorResalte = 0xffa500; // Naranja al pasar el mouse

window.addEventListener('click', (event) => {
    if(event.target.tagName === 'BUTTON' || event.target.tagName === 'INPUT') return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects, false);

    if (intersects.length > 0) {
        const obj = intersects[0].object;
        const data = obj.userData;

        infoName.textContent = data.name;
        infoType.textContent = data.type;
        infoHeight.textContent = data.height;
        infoDesc.textContent = data.desc;
        
        infoPanel.classList.remove('hidden');
    } else {
        infoPanel.classList.add('hidden');
    }
});

// Hover (Resalte visual)
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects, false);

    if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (objetoResaltado !== obj) {
            if (objetoResaltado) objetoResaltado.material.emissive.setHex(0x000000);
            objetoResaltado = obj;
            objetoResaltado.material.emissive.setHex(0x333333); // Brillo suave
            document.body.style.cursor = 'pointer';
        }
    } else {
        if (objetoResaltado) {
            objetoResaltado.material.emissive.setHex(0x000000);
            objetoResaltado = null;
            document.body.style.cursor = 'default';
        }
    }
});

// ==========================================
// 6. CONTROLES HTML
// ==========================================
let isWindy = true;

document.getElementById('btn-anim').addEventListener('click', () => {
    isWindy = !isWindy;
});

document.getElementById('btn-color-hojas').addEventListener('click', () => {
    // Generar color aleatorio
    const randomColor = Math.random() * 0xffffff;
    // Aplicar a TODAS las hojas iterando el arreglo
    arrayHojas.forEach(hoja => {
        hoja.material.color.setHex(randomColor);
    });
});

document.getElementById('btn-toggle-hojas').addEventListener('click', () => {
    arrayHojas.forEach(hoja => {
        hoja.visible = !hoja.visible;
    });
});

document.getElementById('btn-reset').addEventListener('click', () => {
    camera.position.set(0, 8, 15);
    controls.target.set(0, 3, 0);
});

document.getElementById('light-slider').addEventListener('input', (event) => {
    directionalLight.intensity = event.target.value;
});

// ==========================================
// 7. ANIMACIÓN (requestAnimationFrame)
// ==========================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    if (isWindy) {
        const time = clock.getElapsedTime();
        
        // El viento mueve TODA la planta desde la base gracias a la jerarquía
        planta.rotation.z = Math.sin(time * 1.5) * 0.05;
        planta.rotation.x = Math.cos(time * 1.2) * 0.03;
        
        // Movimiento sutil interno del tallo
        tallo.rotation.y = Math.sin(time * 0.5) * 0.1;
    }

    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();