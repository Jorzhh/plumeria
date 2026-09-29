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
crearRamaConHojasYFlores(1.5, 0.6, 0);       
crearRamaConHojasYFlores(1.8, -0.5, 0.4);    
crearRamaConHojasYFlores(2.5, -0.2, -0.5);   

// --- EXTRA: ELEMENTO DECORATIVO EXTERNO (.glb) ---
const loader = new GLTFLoader();
loader.load('./assets/decoracion.glb', function (gltf) {
    const decoracion = gltf.scene;
    decoracion.scale.set(0.5, 0.5, 0.5); 
    decoracion.position.set(3, 0, 2); 
    decoracion.userData = {
        name: "Elemento Decorativo", 
        type: "Modelo 3D Externo (.glb)",
        height: "Nivel del suelo",
        desc: "Decoración complementaria del jardín botánico."
    };
    scene.add(decoracion);
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


// --- AMBIENTE DE JARDÍN BOTÁNICO ---
// 1. Niebla Atmosférica
scene.fog = new THREE.FogExp2(0x87CEEB, 0.025);

// 2. Camino de Piedra para visitantes
const caminoGeo = new THREE.PlaneGeometry(6, 60);
const caminoMat = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 1 });
const camino = new THREE.Mesh(caminoGeo, caminoMat);
camino.rotation.x = -Math.PI / 2;
camino.position.set(7, 0.01, 0); 
camino.receiveShadow = true;
scene.add(camino);

// 3. Letrero Interactivo (Ficha Técnica)
const letreroGroup = new THREE.Group();
letreroGroup.position.set(2.5, 0, 2.5); 
letreroGroup.rotation.y = -0.5;

const poste = crearParte(new THREE.CylinderGeometry(0.08, 0.08, 1.2), 0x4a3b2c, "Poste de Letrero", "Cilindro", "1.2m", "Soporte de madera del jardín.");
poste.position.y = 0.6;
letreroGroup.add(poste);

const cartel = crearParte(new THREE.BoxGeometry(1.2, 0.8, 0.05), 0xf0f0f0, "Ficha Botánica", "Cubo", "1.2m", "Plumeria Rubra - Cuidar no tocar las flores.");
cartel.position.y = 1.2;
cartel.position.z = 0.05;
letreroGroup.add(cartel);
scene.add(letreroGroup);

// 4. Árboles de fondo
function crearArbolFondo(x, z) {
    const arbol = new THREE.Group();
    const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 3), new THREE.MeshStandardMaterial({ color: 0x3d2817 }));
    tronco.position.y = 1.5;
    tronco.castShadow = true;
    arbol.add(tronco);
    
    const copa = new THREE.Mesh(new THREE.SphereGeometry(2.5, 16, 16), new THREE.MeshStandardMaterial({ color: 0x234215 }));
    copa.position.y = 4;
    copa.castShadow = true;
    arbol.add(copa);
    
    const tamaño = 1.5 + (Math.random() * 2); 
    arbol.scale.set(tamaño, tamaño, tamaño);
    arbol.position.set(x, 0, z);
    scene.add(arbol);
}
crearArbolFondo(-10, -8);
crearArbolFondo(15, -10);
crearArbolFondo(-12, 6);
crearArbolFondo(10, 15);
crearArbolFondo(-5, 14);
crearArbolFondo(6, -15);


// ==========================================
// MÁS FLORA PARA EL JARDÍN BOTÁNICO (MASIVA)
// ==========================================
function crearArbusto(x, z, escala) {
    const arbustoGroup = new THREE.Group();
    const materialArbusto = new THREE.MeshStandardMaterial({ color: 0x1e4311, roughness: 0.9 });
    const esfera1 = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), materialArbusto);
    esfera1.position.set(0, 0.8, 0);
    esfera1.castShadow = true;
    const esfera2 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), materialArbusto);
    esfera2.position.set(0.6, 0.6, 0.5);
    esfera2.castShadow = true;
    const esfera3 = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), materialArbusto);
    esfera3.position.set(-0.5, 0.5, -0.4);
    esfera3.castShadow = true;
    arbustoGroup.add(esfera1, esfera2, esfera3);
    arbustoGroup.position.set(x, 0, z);
    arbustoGroup.scale.set(escala, escala, escala);
    scene.add(arbustoGroup);
}

function crearFlorSilvestre(x, z) {
    const florGroup = new THREE.Group();
    const tallo = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6), new THREE.MeshStandardMaterial({ color: 0x4CAF50 }));
    tallo.position.y = 0.3;
    tallo.castShadow = true;
    florGroup.add(tallo);
    const colores = [0xff0055, 0xff9900, 0xcc00ff, 0x00ccff, 0xffff00];
    const colorAleatorio = colores[Math.floor(Math.random() * colores.length)];
    const cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), new THREE.MeshStandardMaterial({ color: colorAleatorio }));
    cabeza.position.y = 0.65;
    cabeza.castShadow = true;
    florGroup.add(cabeza);
    const escala = 0.5 + Math.random() * 0.8;
    florGroup.scale.set(escala, escala, escala);
    florGroup.position.set(x, 0, z);
    scene.add(florGroup);
}

function crearAgave(x, z) {
    const agaveGroup = new THREE.Group();
    const materialAgave = new THREE.MeshStandardMaterial({ color: 0x2E6B3A }); 
    for(let i=0; i<6; i++) {
        const hoja = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.5, 4), materialAgave);
        hoja.position.y = 0.5;
        hoja.rotation.x = 0.6; 
        hoja.castShadow = true;
        const pivot = new THREE.Group();
        pivot.rotation.y = (i * Math.PI * 2) / 6;
        pivot.add(hoja);
        agaveGroup.add(pivot);
    }
    agaveGroup.position.set(x, 0, z);
    const escala = 0.5 + Math.random() * 1.5; 
    agaveGroup.scale.set(escala, escala, escala);
    scene.add(agaveGroup);
}

// Generación masiva por todo el terreno
for (let i = 0; i < 150; i++) {
    let posX = (Math.random() - 0.5) * 44;
    let posZ = (Math.random() - 0.5) * 44;
    if (Math.abs(posX) < 4 && Math.abs(posZ) < 4) continue;
    let tipo = Math.random();
    if (tipo < 0.33) {
        crearFlorSilvestre(posX, posZ);
    } else if (tipo < 0.66) {
        crearArbusto(posX, posZ, 0.5 + Math.random() * 1.5);
    } else {
        crearAgave(posX, posZ);
    }
}

// MACETAS DECORATIVAS Y JARDINERAS (Las agregadas recientemente)
function crearMacetaDecorativa(x, z, escala) {
    const macetaExtra = new THREE.Group();
    const macetaGeo = new THREE.CylinderGeometry(0.8, 0.6, 1.2, 16);
    const macetaMat = new THREE.MeshStandardMaterial({ color: 0x6e3b22, roughness: 0.9 });
    const macetaMesh = new THREE.Mesh(macetaGeo, macetaMat);
    macetaMesh.position.y = 0.6;
    macetaMesh.castShadow = true;
    macetaExtra.add(macetaMesh);
    const plantaGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const plantaMat = new THREE.MeshStandardMaterial({ color: 0x1e4311, roughness: 0.8 });
    const plantaMesh = new THREE.Mesh(plantaGeo, plantaMat);
    plantaMesh.scale.set(1, 2, 1); 
    plantaMesh.position.y = 1.6;
    plantaMesh.castShadow = true;
    macetaExtra.add(plantaMesh);
    macetaExtra.position.set(x, 0, z);
    macetaExtra.scale.set(escala, escala, escala);
    scene.add(macetaExtra);
}

function crearMacetaCuadrada(x, z, escala) {
    const macetaCuadrada = new THREE.Group();
    const macetaGeo = new THREE.BoxGeometry(1.2, 1, 1.2);
    const macetaMat = new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: 0.9 });
    const macetaMesh = new THREE.Mesh(macetaGeo, macetaMat);
    macetaMesh.position.y = 0.5;
    macetaMesh.castShadow = true;
    macetaCuadrada.add(macetaMesh);
    const plantaMat = new THREE.MeshStandardMaterial({ color: 0x275a22, roughness: 0.8 });
    const hoja1 = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), plantaMat);
    hoja1.position.set(0, 1.2, 0);
    hoja1.castShadow = true;
    const hoja2 = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), plantaMat);
    hoja2.position.set(0.4, 1.0, 0.4);
    hoja2.castShadow = true;
    const hoja3 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), plantaMat);
    hoja3.position.set(-0.4, 1.1, -0.3);
    hoja3.castShadow = true;
    macetaCuadrada.add(hoja1, hoja2, hoja3);
    macetaCuadrada.position.set(x, 0, z);
    macetaCuadrada.scale.set(escala, escala, escala);
    scene.add(macetaCuadrada);
}
// NUEVA FUNCIÓN 3: Maceta ancha con flores de colores
function crearMacetaConFlores(x, z, escala) {
    const macetaFlores = new THREE.Group();

    // 1. La maceta (Cilindro más ancho arriba y angosto abajo tipo tazón)
    const macetaGeo = new THREE.CylinderGeometry(0.9, 0.6, 0.8, 16);
    const macetaMat = new THREE.MeshStandardMaterial({ color: 0xc27a4e, roughness: 0.9 }); // Barro anaranjado
    const macetaMesh = new THREE.Mesh(macetaGeo, macetaMat);
    macetaMesh.position.y = 0.4;
    macetaMesh.castShadow = true;
    macetaFlores.add(macetaMesh);

    // 2. Tierra (Un disco oscuro en la parte superior)
    const tierraGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.05, 16);
    const tierraMat = new THREE.MeshStandardMaterial({ color: 0x3b2a1a });
    const tierraMesh = new THREE.Mesh(tierraGeo, tierraMat);
    tierraMesh.position.y = 0.8;
    macetaFlores.add(tierraMesh);

    // 3. Pequeño ramo de 3 flores
    const colores = [0xff0055, 0xff9900, 0xcc00ff, 0x00ccff, 0xffff00];
    
    for (let i = 0; i < 3; i++) {
        const florGroup = new THREE.Group();
        
        // Tallo
        const tallo = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5), new THREE.MeshStandardMaterial({ color: 0x4CAF50 }));
        tallo.position.y = 0.25;
        tallo.castShadow = true;
        florGroup.add(tallo);

        // Cabeza de la flor (Color aleatorio)
        const colorAleatorio = colores[Math.floor(Math.random() * colores.length)];
        const cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshStandardMaterial({ color: colorAleatorio }));
        cabeza.position.y = 0.5;
        cabeza.castShadow = true;
        florGroup.add(cabeza);

        // Posicionar cada flor en triángulo dentro de la maceta
        florGroup.position.x = Math.cos(i * Math.PI * 2 / 3) * 0.35;
        florGroup.position.z = Math.sin(i * Math.PI * 2 / 3) * 0.35;
        florGroup.position.y = 0.8; 
        
        // Inclinarlas un poquito hacia afuera
        florGroup.rotation.x = Math.sin(i * Math.PI * 2 / 3) * 0.3;
        florGroup.rotation.z = -Math.cos(i * Math.PI * 2 / 3) * 0.3;

        macetaFlores.add(florGroup);
    }

    macetaFlores.position.set(x, 0, z);
    macetaFlores.scale.set(escala, escala, escala);
    scene.add(macetaFlores);
}

// ========================================================
// REEMPLAZA TU BLOQUE DE LLAMADAS ANTERIOR POR ESTE:
// Ahora mezclamos los 3 tipos de macetas por todo el camino
// ========================================================
crearMacetaDecorativa(5, 5, 0.8);      // Cactus redondo
crearMacetaConFlores(3.5, 0, 0.7);     // NUEVA: Maceta floral
crearMacetaCuadrada(4.5, -3, 1.2);     // Jardinera cuadrada
crearMacetaConFlores(8, 5, 0.9);       // NUEVA: Maceta floral
crearMacetaDecorativa(-2, 8, 0.7);     // Cactus redondo
crearMacetaCuadrada(8, -7, 1);         // Jardinera cuadrada
crearMacetaConFlores(-4, 5, 0.8);      // NUEVA: Maceta floral
crearMacetaDecorativa(-6, -4, 0.9);    // Cactus redondo
crearMacetaCuadrada(9, 2, 0.8);        // Jardinera cuadrada
crearMacetaConFlores(6, -10, 1.1);     // NUEVA: Maceta floral
crearMacetaCuadrada(-8, 3, 1.1);       // Jardinera cuadrada extra     


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
            objetoResaltado.material.emissive.setHex(0x333333); 
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
// 6. CONTROLES HTML Y DÍA/NOCHE
// ==========================================
let isWindy = true;

document.getElementById('btn-anim').addEventListener('click', () => {
    isWindy = !isWindy;
});

document.getElementById('btn-color-hojas').addEventListener('click', () => {
    const randomColor = Math.random() * 0xffffff;
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

// EVENTO DE LUZ CORREGIDO (Oscurece cielo y ambiente)
document.getElementById('light-slider').addEventListener('input', (event) => {
    const valorLuz = parseFloat(event.target.value);
    
    directionalLight.intensity = valorLuz;
    ambientLight.intensity = valorLuz * 0.6; 
    
    const tonoCielo = new THREE.Color(0x87CEEB).multiplyScalar(Math.max(0.1, valorLuz)); 
    scene.background = tonoCielo;
    
    if (scene.fog) {
        scene.fog.color = tonoCielo;
    }
});

// ==========================================
// 7. ANIMACIÓN (requestAnimationFrame)
// ==========================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    if (isWindy) {
        const time = clock.getElapsedTime();
        
        planta.rotation.z = Math.sin(time * 1.5) * 0.05;
        planta.rotation.x = Math.cos(time * 1.2) * 0.03;
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