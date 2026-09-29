import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ==========================================
// 1. CONFIGURACIÓN DE ESCENA, CÁMARA Y ENTORNO
// ==========================================
const scene = new THREE.Scene();
const skyColor = new THREE.Color(0x87dbeb);
scene.background = skyColor;
scene.fog = new THREE.FogExp2(0x87dbeb, 0.025);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 11);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 2.5, 0);

// ==========================================
// 2. ILUMINACIÓN
// ==========================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
directionalLight.position.set(8, 15, 8);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
scene.add(directionalLight);

// Suelo del Jardín Botánico
const pisoGeo = new THREE.PlaneGeometry(60, 60);
const pisoMat = new THREE.MeshStandardMaterial({ color: 0x3d6b52, roughness: 0.9 });
const piso = new THREE.Mesh(pisoGeo, pisoMat);
piso.rotation.x = -Math.PI / 2;
piso.receiveShadow = true;
scene.add(piso);

// Camino de Piedra
const caminoGeo = new THREE.PlaneGeometry(6, 60);
const caminoMat = new THREE.MeshStandardMaterial({ color: 0x808a87, roughness: 1 });
const camino = new THREE.Mesh(caminoGeo, caminoMat);
camino.rotation.x = -Math.PI / 2;
camino.position.set(6, 0.01, 0);
camino.receiveShadow = true;
scene.add(camino);

// ==========================================
// 3. ARREGLOS Y LÓGICA DE SIMULACIÓN DE CRECIMIENTO
// ==========================================
const interactableObjects = [];
const arrayHojas = [];
const growableParts = [];

let growthTime = 0;
let isGrowthPaused = false;
let growthSpeed = 1.0;

function crearParteInteractiva(geometria, material, nombre, tipo, altura, desc) {
    const mesh = new THREE.Mesh(geometria, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { name: nombre, type: tipo, height: altura, desc: desc, growthPercent: 100 };
    interactableObjects.push(mesh);
    return mesh;
}

function crearParteCrecimiento(geometria, material, nombre, tipo, altura, desc, growStart, growEnd, baseScale = new THREE.Vector3(1, 1, 1)) {
    const mesh = crearParteInteractiva(geometria, material, nombre, tipo, altura, desc);
    
    mesh.scale.set(0, 0, 0);
    mesh.userData.growStart = growStart;
    mesh.userData.growEnd = growEnd;
    mesh.userData.baseScale = baseScale.clone();
    mesh.userData.growthPercent = 0;

    growableParts.push(mesh);
    return mesh;
}

// Materiales Estándar
const matMaceta = new THREE.MeshStandardMaterial({ color: 0x7a4228, roughness: 0.8 });
const matBorde = new THREE.MeshStandardMaterial({ color: 0x522b18, roughness: 0.8 });
const matTierra = new THREE.MeshStandardMaterial({ color: 0x301e14, roughness: 1.0 });
const matTallo = new THREE.MeshStandardMaterial({ color: 0x274e2b, roughness: 0.7 });
const matHoja = new THREE.MeshStandardMaterial({ color: 0x9ee32b, roughness: 0.4, side: THREE.DoubleSide });
const matPetalo = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.3 });
const matCentroFlor = new THREE.MeshStandardMaterial({ color: 0xffc800, roughness: 0.2 });

// ==========================================
// 4. PLANTA PRINCIPAL CON CRECIMIENTO (PLUMERIA)
// ==========================================

// Maceta Fija
const macetaGroup = new THREE.Group();
const baseMaceta = crearParteInteractiva(new THREE.CylinderGeometry(1.35, 0.85, 1.9, 32), matMaceta, "Base de Maceta", "Cilindro", "0 a 20 cm", "Contiene la tierra y raíces.");
baseMaceta.position.y = 0.95;
macetaGroup.add(baseMaceta);

const bordeMaceta = crearParteInteractiva(new THREE.CylinderGeometry(1.5, 1.4, 0.3, 32), matBorde, "Borde de Maceta", "Cilindro Superior", "20 cm", "Borde decorativo de barro.");
bordeMaceta.position.y = 1.9;
macetaGroup.add(bordeMaceta);

const tierra = crearParteInteractiva(new THREE.CylinderGeometry(1.35, 1.35, 0.1, 32), matTierra, "Tierra Nutritiva", "Cilindro Plano", "18 cm", "Sustrato orgánico rico en minerales.");
tierra.position.y = 1.85;
macetaGroup.add(tierra);
scene.add(macetaGroup);

// Estructura Jerárquica de la Planta
const planta = new THREE.Group();
planta.position.y = 1.85;
scene.add(planta);

// Tallo Principal
const geoTallo = new THREE.CylinderGeometry(0.18, 0.24, 3.0, 16);
geoTallo.translate(0, 1.5, 0);
const tallo = crearParteCrecimiento(geoTallo, matTallo, "Tallo Principal", "CylinderGeometry", "20 a 60 cm", "Estructura leñosa central.", 0.0, 0.35);
planta.add(tallo);

function crearCopaPlumeria(posY, rotZ, rotX, delay) {
    const ramaGroup = new THREE.Group();
    ramaGroup.position.set(0, posY, 0);
    ramaGroup.rotation.set(rotX, 0, rotZ);

    // Rama Secundaria
    const ramaGeo = new THREE.CylinderGeometry(0.12, 0.17, 1.4, 16);
    ramaGeo.translate(0, 0.7, 0);
    const rama = crearParteCrecimiento(ramaGeo, matTallo, "Rama Secundaria", "CylinderGeometry", "60 a 80 cm", "Sostiene la corona de hojas.", 0.25 + delay, 0.55 + delay);
    ramaGroup.add(rama);

    // Corona de Hojas
    const coronaHojas = new THREE.Group();
    coronaHojas.position.y = 1.35;
    ramaGroup.add(coronaHojas);

    const geoHoja = new THREE.SphereGeometry(0.5, 16, 16);
    geoHoja.translate(0, 0, 0.5);

    for (let i = 0; i < 5; i++) {
        const escalaHoja = new THREE.Vector3(0.75, 0.06, 2.7);
        const hoja = crearParteCrecimiento(geoHoja, matHoja.clone(), "Hoja de Plumeria", "SphereGeometry (Escalada)", "~80 cm", "Hoja chata verde lima para fotosíntesis.", 0.50 + delay, 0.80 + delay, escalaHoja);

        const pivotHoja = new THREE.Group();
        pivotHoja.rotation.y = (i * Math.PI * 2) / 5;
        pivotHoja.rotation.x = 0.12;
        pivotHoja.add(hoja);

        coronaHojas.add(pivotHoja);
        arrayHojas.push(hoja);
    }

    // Flores
    const florGroup = new THREE.Group();
    florGroup.position.y = 1.4;

    const centro = crearParteCrecimiento(new THREE.ConeGeometry(0.22, 0.2, 16), matCentroFlor, "Centro de Flor", "ConeGeometry", "~82 cm", "Pistilo y estambre con polen.", 0.75 + delay, 1.05 + delay);
    centro.rotation.x = Math.PI;
    florGroup.add(centro);

    const geoPetalo = new THREE.SphereGeometry(0.32, 16, 16);
    geoPetalo.translate(0, 0, 0.32);

    for (let i = 0; i < 5; i++) {
        const escalaPetalo = new THREE.Vector3(0.65, 0.1, 1.0);
        const petalo = crearParteCrecimiento(geoPetalo, matPetalo, "Pétalo Blanco", "SphereGeometry (Escalada)", "~82 cm", "Atrae polinizadores.", 0.80 + delay, 1.10 + delay, escalaPetalo);

        const pivotPetalo = new THREE.Group();
        pivotPetalo.rotation.y = (i * Math.PI * 2) / 5;
        pivotPetalo.rotation.x = 0.15;
        pivotPetalo.add(petalo);

        florGroup.add(pivotPetalo);
    }

    ramaGroup.add(florGroup);
    tallo.add(ramaGroup);
}

crearCopaPlumeria(2.9, 0.0, 0.0, 0.0);
crearCopaPlumeria(2.2, 0.55, -0.25, 0.12);
crearCopaPlumeria(1.9, -0.55, 0.25, 0.22);

// ==========================================
// 5. ECOSISTEMA DEL JARDÍN (ENTORNO COMPLETO)
// ==========================================

// Letrero Botánico
const letreroGroup = new THREE.Group();
letreroGroup.position.set(2.2, 0, 2.2);
letreroGroup.rotation.y = -0.4;

const poste = crearParteInteractiva(new THREE.CylinderGeometry(0.06, 0.06, 1.2), new THREE.MeshStandardMaterial({ color: 0x4a3b2c }), "Poste Informativo", "Cilindro", "1.2m", "Soporte de madera.");
poste.position.y = 0.6;
letreroGroup.add(poste);

const cartel = crearParteInteractiva(new THREE.BoxGeometry(1.1, 0.7, 0.05), new THREE.MeshStandardMaterial({ color: 0xd9d9d9 }), "Ficha Botánica", "Cubo", "1.2m", "Información especie Plumeria Rubra.");
cartel.position.set(0, 1.1, 0.03);
letreroGroup.add(cartel);
scene.add(letreroGroup);

// Árboles Gigantes de Fondo
function crearArbolFondo(x, z, escala = 1) {
    const arbol = new THREE.Group();
    const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 3.5), new THREE.MeshStandardMaterial({ color: 0x3d2817 }));
    tronco.position.y = 1.75;
    tronco.castShadow = true;
    arbol.add(tronco);

    const copa = new THREE.Mesh(new THREE.SphereGeometry(3.2, 16, 16), new THREE.MeshStandardMaterial({ color: 0x224828, roughness: 0.9 }));
    copa.position.y = 4.8;
    copa.castShadow = true;
    arbol.add(copa);

    arbol.position.set(x, 0, z);
    arbol.scale.set(escala, escala, escala);
    scene.add(arbol);
}

crearArbolFondo(-9, -7, 1.8);
crearArbolFondo(12, -8, 2.0);
crearArbolFondo(-11, 5, 1.6);
crearArbolFondo(11, 12, 1.7);
crearArbolFondo(-5, 13, 1.9);
crearArbolFondo(5, -14, 2.1);

// Arbustos, Flores Silvestres y Agaves
function crearArbusto(x, z, escala) {
    const arbustoGroup = new THREE.Group();
    const matArbusto = new THREE.MeshStandardMaterial({ color: 0x284f22, roughness: 0.9 });
    const e1 = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), matArbusto);
    e1.position.y = 0.8;
    const e2 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), matArbusto);
    e2.position.set(0.6, 0.6, 0.4);
    const e3 = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), matArbusto);
    e3.position.set(-0.5, 0.5, -0.4);

    arbustoGroup.add(e1, e2, e3);
    arbustoGroup.position.set(x, 0, z);
    arbustoGroup.scale.set(escala, escala, escala);
    scene.add(arbustoGroup);
}

function crearFlorSilvestre(x, z) {
    const florGroup = new THREE.Group();
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6), new THREE.MeshStandardMaterial({ color: 0x4CAF50 }));
    t.position.y = 0.3;
    florGroup.add(t);

    const colores = [0xff0055, 0xff9900, 0xcc00ff, 0x00ccff, 0xffff00];
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), new THREE.MeshStandardMaterial({ color: colores[Math.floor(Math.random() * colores.length)] }));
    c.position.y = 0.65;
    florGroup.add(c);

    florGroup.position.set(x, 0, z);
    const esc = 0.6 + Math.random() * 0.6;
    florGroup.scale.set(esc, esc, esc);
    scene.add(florGroup);
}

function crearAgave(x, z) {
    const agaveGroup = new THREE.Group();
    const matAgave = new THREE.MeshStandardMaterial({ color: 0x2b5e37 });
    for (let i = 0; i < 6; i++) {
        const hoja = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.4, 4), matAgave);
        hoja.position.y = 0.5;
        hoja.rotation.x = 0.65;
        const pivot = new THREE.Group();
        pivot.rotation.y = (i * Math.PI * 2) / 6;
        pivot.add(hoja);
        agaveGroup.add(pivot);
    }
    agaveGroup.position.set(x, 0, z);
    const esc = 0.6 + Math.random() * 1.2;
    agaveGroup.scale.set(esc, esc, esc);
    scene.add(agaveGroup);
}

for (let i = 0; i < 120; i++) {
    let px = (Math.random() - 0.5) * 42;
    let pz = (Math.random() - 0.5) * 42;
    if (Math.abs(px) < 3.5 && Math.abs(pz) < 3.5) continue;
    let rnd = Math.random();
    if (rnd < 0.33) crearFlorSilvestre(px, pz);
    else if (rnd < 0.66) crearArbusto(px, pz, 0.5 + Math.random() * 1.2);
    else crearAgave(px, pz);
}

// Macetas Decorativas Secundarias
function crearMacetaDecorativa(x, z, escala) {
    const g = new THREE.Group();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.5, 1.0, 16), new THREE.MeshStandardMaterial({ color: 0x6e3b22 }));
    m.position.y = 0.5;
    g.add(m);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), new THREE.MeshStandardMaterial({ color: 0x1e4311 }));
    p.scale.set(1, 1.8, 1);
    p.position.y = 1.3;
    g.add(p);
    g.position.set(x, 0, z);
    g.scale.set(escala, escala, escala);
    scene.add(g);
}

function crearMacetaCuadrada(x, z, escala) {
    const g = new THREE.Group();
    const m = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 1.1), new THREE.MeshStandardMaterial({ color: 0x5a3a22 }));
    m.position.y = 0.45;
    g.add(m);
    const h1 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), new THREE.MeshStandardMaterial({ color: 0x275a22 }));
    h1.position.set(0, 1.1, 0);
    g.add(h1);
    g.position.set(x, 0, z);
    g.scale.set(escala, escala, escala);
    scene.add(g);
}

function crearMacetaConFlores(x, z, escala) {
    const g = new THREE.Group();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.5, 0.7, 16), new THREE.MeshStandardMaterial({ color: 0xc27a4e }));
    m.position.y = 0.35;
    g.add(m);

    const colores = [0xff0055, 0x00ccff, 0xffff00];
    for (let i = 0; i < 3; i++) {
        const fg = new THREE.Group();
        const t = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4), new THREE.MeshStandardMaterial({ color: 0x4CAF50 }));
        t.position.y = 0.2;
        fg.add(t);
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshStandardMaterial({ color: colores[i] }));
        c.position.y = 0.4;
        fg.add(c);
        fg.position.set(Math.cos(i * 2.1) * 0.3, 0.7, Math.sin(i * 2.1) * 0.3);
        g.add(fg);
    }
    g.position.set(x, 0, z);
    g.scale.set(escala, escala, escala);
    scene.add(g);
}

crearMacetaDecorativa(4.5, 4.5, 0.8);
crearMacetaConFlores(3.2, 0, 0.7);
crearMacetaCuadrada(4.2, -3, 1.1);
crearMacetaConFlores(7.5, 4.5, 0.9);
crearMacetaDecorativa(-2, 7.5, 0.7);
crearMacetaCuadrada(7.5, -6.5, 1);
crearMacetaConFlores(-3.8, 4.5, 0.8);

// ==========================================
// 6. RAYCASTING Y PANEL INTERACTIVO
// ==========================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const infoPanel = document.getElementById('info-panel');
const infoName = document.getElementById('info-name');
const infoType = document.getElementById('info-type');
const infoHeight = document.getElementById('info-height');
const infoDesc = document.getElementById('info-desc');
const infoGrowth = document.getElementById('info-growth');

let objetoSeleccionado = null;
let objetoResaltado = null;

function actualizarPanelInfo() {
    if (objetoSeleccionado) {
        const data = objetoSeleccionado.userData;
        infoName.textContent = data.name;
        infoType.textContent = data.type;
        infoHeight.textContent = data.height;
        infoDesc.textContent = data.desc;
        if (infoGrowth) {
            infoGrowth.textContent = (data.growthPercent !== undefined ? data.growthPercent : 100) + "%";
        }
    }
}

window.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON' || event.target.tagName === 'INPUT') return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects, false);

    if (intersects.length > 0) {
        objetoSeleccionado = intersects[0].object;
        actualizarPanelInfo();
        infoPanel.classList.remove('hidden');
    } else {
        objetoSeleccionado = null;
        infoPanel.classList.add('hidden');
    }
});

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
// 7. CONTROLES HTML Y EVENTOS MODAL
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
    camera.position.set(0, 5, 11);
    controls.target.set(0, 2.5, 0);
    controls.update();
});

// Controles de Crecimiento
document.getElementById('btn-restart-growth').addEventListener('click', () => {
    growthTime = 0;
});

document.getElementById('btn-pause-growth').addEventListener('click', (e) => {
    isGrowthPaused = !isGrowthPaused;
    e.target.textContent = isGrowthPaused ? "Reanudar" : "Pausar";
});

document.getElementById('growth-speed-slider').addEventListener('input', (e) => {
    growthSpeed = parseFloat(e.target.value);
});

// Slider Día / Noche
document.getElementById('light-slider').addEventListener('input', (event) => {
    const valorLuz = parseFloat(event.target.value);
    directionalLight.intensity = valorLuz;
    ambientLight.intensity = valorLuz * 0.6;

    const tonoCielo = skyColor.clone().multiplyScalar(Math.max(0.1, valorLuz));
    scene.background = tonoCielo;
    if (scene.fog) scene.fog.color = tonoCielo;
});

// Abrir y cerrar Modal de Preguntas
const modal = document.getElementById('modal-preguntas');
document.getElementById('btn-preguntas').addEventListener('click', () => {
    modal.classList.remove('hidden');
});

document.getElementById('close-modal').addEventListener('click', () => {
    modal.classList.add('hidden');
});

// ==========================================
// 8. BUCLE DE ANIMACIÓN Y CÁLCULO DE CRECIMIENTO
// ==========================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // 1. Simulación de Crecimiento Progresivo
    if (!isGrowthPaused && growthTime < 1.35) {
        growthTime += delta * 0.25 * growthSpeed;
    }

    growableParts.forEach(part => {
        const data = part.userData;
        let rawProgress = (growthTime - data.growStart) / (data.growEnd - data.growStart);
        let progress = Math.max(0, Math.min(1, rawProgress));

        let smooth = progress * progress * (3 - 2 * progress);

        part.scale.set(
            smooth * data.baseScale.x,
            smooth * data.baseScale.y,
            smooth * data.baseScale.z
        );

        data.growthPercent = Math.floor(progress * 100);
    });

    // 2. Movimiento de Viento Suave
    if (isWindy) {
        planta.rotation.z = Math.sin(elapsedTime * 1.5) * 0.03;
        planta.rotation.x = Math.cos(elapsedTime * 1.2) * 0.02;
        tallo.rotation.y = Math.sin(elapsedTime * 0.5) * 0.05;
    }

    actualizarPanelInfo();
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();