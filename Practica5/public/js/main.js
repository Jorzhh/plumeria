import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ============================================================
// 1. ARRAYS Y VARIABLES GLOBALES (DEBEN DECLARARSE AL INICIO)
// ============================================================
const interactableObjects = [];
const arrayHojas = [];
const growableParts = [];
const plantasGroupArray = [];

let isWindy = true;
let isSimRunning = false;
let simTimer = null;
let simulationSpeed = 1.0;
let showFoliage = true;
let jardinVisible = true;

// ============================================================
// 2. ESCENA, CÁMARA Y RENDERER THREE.JS
// ============================================================
const container = document.getElementById('viewport-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7bc6eb);
scene.fog = new THREE.FogExp2(0x7bc6eb, 0.022);

const camera = new THREE.PerspectiveCamera(52, container.clientWidth / container.clientHeight, 0.1, 1000);
<<<<<<< HEAD
camera.position.set(0, 5.1, 14);
=======
camera.position.set(0, 6.5, 15);
>>>>>>> b1f99aa4c9685476098dc3daae5e6d0452556a41

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
<<<<<<< HEAD
controls.dampingFactor = 0.05;
controls.target.set(0, 2.1, 0);
controls.maxPolarAngle = Math.PI / 2 - 0.02; // No traspasar suelo
=======
controls.target.set(0, 2.0, 0);
>>>>>>> b1f99aa4c9685476098dc3daae5e6d0452556a41

// ============================================================
// 3. ILUMINACIÓN & ENTORNO
// ============================================================
scene.add(new THREE.HemisphereLight(0xb1e1ff, 0x385530, 0.65));
scene.add(new THREE.AmbientLight(0xffffff, 0.45));

const dirLight = new THREE.DirectionalLight(0xfff8e7, 1.35);
dirLight.position.set(8, 15, 8);
dirLight.castShadow = true;
scene.add(dirLight);

const piso = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), new THREE.MeshStandardMaterial({ color: 0x2e5c3c, roughness: 0.85 }));
piso.rotation.x = -Math.PI / 2;
piso.receiveShadow = true;
scene.add(piso);

<<<<<<< HEAD
// Camino de Adoquín / Piedra
const caminoGeo = new THREE.PlaneGeometry(4.5, 70);
const caminoMat = new THREE.MeshStandardMaterial({ color: 0x828882, roughness: 0.95 });
const camino = new THREE.Mesh(caminoGeo, caminoMat);
camino.rotation.x = -Math.PI / 2;
camino.position.set(10, 0.015, 0);
camino.receiveShadow = true;
scene.add(camino);
=======
const surco = new THREE.Mesh(new THREE.BoxGeometry(16, 0.06, 3.5), new THREE.MeshStandardMaterial({ color: 0x2b1a10, roughness: 1.0 }));
surco.position.set(0, 0.03, 0);
surco.receiveShadow = true;
scene.add(surco);
>>>>>>> b1f99aa4c9685476098dc3daae5e6d0452556a41

// ============================================================
// 4. JARDÍN BOTÁNICO PROCEDURAL (FAUNA Y FLORA PERIMETRAL)
// ============================================================
const jardinGroup = new THREE.Group();
scene.add(jardinGroup);

const matTroncoRobusto = new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.9 });
const matCopaPino = new THREE.MeshStandardMaterial({ color: 0x1e4620, roughness: 0.6 });
const matCopaFrondosa = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.5 });
const matPalmeraTronco = new THREE.MeshStandardMaterial({ color: 0x6e473b, roughness: 0.8 });
const matPalmeraHoja = new THREE.MeshStandardMaterial({ color: 0x52b788, roughness: 0.4, side: THREE.DoubleSide });
const matFlorPetalo = new THREE.MeshStandardMaterial({ color: 0xff4d6d, roughness: 0.3 });

function crearArbolFrondoso(x, z, escala = 1) {
    const arbol = new THREE.Group();
<<<<<<< HEAD
    const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.36, 2.8, 12), new THREE.MeshStandardMaterial({ color: 0x3d2716, roughness: 0.9 }));
    tronco.position.y = 1.4;
=======
    arbol.position.set(x, 0.05, z);

    const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.3 * escala, 0.5 * escala, 3 * escala, 12), matTroncoRobusto);
    tronco.position.y = (1.5 * escala);
>>>>>>> b1f99aa4c9685476098dc3daae5e6d0452556a41
    tronco.castShadow = true;
    tronco.userData = { name: "Encino del Jardín Botánico", type: "Árbol Leñoso", height: `${(3 * escala).toFixed(1)} m`, desc: "Especie arbórea frondosa.", plantIndex: "Jardín" };
    arbol.add(tronco);
    interactableObjects.push(tronco);

<<<<<<< HEAD
    const copa = new THREE.Mesh(new THREE.SphereGeometry(1.7, 16, 16), new THREE.MeshStandardMaterial({ color: 0x1f4724, roughness: 0.85 }));
    copa.position.y = 3.4;
    copa.castShadow = true;
    arbol.add(copa);
=======
    const copaGeo = new THREE.DodecahedronGeometry(1.8 * escala, 1);
    const copa1 = new THREE.Mesh(copaGeo, matCopaFrondosa);
    copa1.position.y = (3.5 * escala);
    copa1.castShadow = true;
    arbol.add(copa1);
>>>>>>> b1f99aa4c9685476098dc3daae5e6d0452556a41

    jardinGroup.add(arbol);
}
<<<<<<< HEAD
crearArbolFondo(-12, -15, 1.05);
crearArbolFondo(-7, -17, 0.9);
crearArbolFondo(0, -18, 1.05);
crearArbolFondo(7, -17, 0.9);
crearArbolFondo(12, -15, 1.05);

// Más árboles de fondo para que el jardín tenga profundidad y variedad visual.
crearArbolFondo(-17, -19, 0.78);
crearArbolFondo(17, -19, 0.82);
crearArbolFondo(-16, -8, 0.68);
crearArbolFondo(17, -8, 0.72);

// Bosque ornamental amplio al fondo y en los laterales del jardín.
const arbolesBosque = [];
for (let i = -7; i <= 7; i++) {
    arbolesBosque.push({ x: i * 3.0, z: -21, escala: 0.78 + ((i + 7) % 4) * 0.09 });
    arbolesBosque.push({ x: i * 3.05 + 1.4, z: -28, escala: 0.72 + ((i + 9) % 5) * 0.08 });
}
for (let i = 0; i < 9; i++) {
    const z = -12 + i * 3.15;
    arbolesBosque.push({ x: -17.5, z, escala: 0.62 + (i % 3) * 0.1 });
    arbolesBosque.push({ x: 18, z: z - 1.1, escala: 0.64 + ((i + 1) % 3) * 0.1 });
}

const troncosBosque = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.14, 0.23, 2.5, 7),
    new THREE.MeshStandardMaterial({ color: 0x49321f, roughness: 0.92 }),
    arbolesBosque.length
);
const copasBosque = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 1),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.88 }),
    arbolesBosque.length * 4
);
const arbolDummy = new THREE.Object3D();
const tonosCopaBosque = [0x1e5132, 0x28663c, 0x367746, 0x315c36, 0x477a43];
arbolesBosque.forEach((arbol, arbolIndex) => {
    arbolDummy.position.set(arbol.x, 1.03 * arbol.escala, arbol.z);
    arbolDummy.scale.set(arbol.escala, 0.83 * arbol.escala, arbol.escala);
    arbolDummy.rotation.set(0, arbolIndex * 0.37, 0);
    arbolDummy.updateMatrix();
    troncosBosque.setMatrixAt(arbolIndex, arbolDummy.matrix);

    const copas = [
        [0, 2.55, 0, 1.08, 1.25, 1.08],
        [-0.62, 2.35, 0.12, 0.78, 0.92, 0.8],
        [0.58, 2.38, -0.08, 0.8, 0.9, 0.82],
        [0.03, 2.42, 0.58, 0.8, 0.92, 0.78]
    ];
    copas.forEach(([dx, dy, dz, sx, sy, sz], copaIndex) => {
        arbolDummy.position.set(
            arbol.x + dx * arbol.escala,
            dy * arbol.escala,
            arbol.z + dz * arbol.escala
        );
        arbolDummy.scale.set(sx * arbol.escala, sy * arbol.escala, sz * arbol.escala);
        arbolDummy.rotation.set(0.04 * copaIndex, arbolIndex * 0.19 + copaIndex, 0);
        arbolDummy.updateMatrix();
        const instanciaCopa = arbolIndex * 4 + copaIndex;
        copasBosque.setMatrixAt(instanciaCopa, arbolDummy.matrix);
        copasBosque.setColorAt(instanciaCopa, new THREE.Color(tonosCopaBosque[(arbolIndex + copaIndex) % tonosCopaBosque.length]));
    });
});
troncosBosque.name = 'troncos-ornamentales';
copasBosque.name = 'copas-ornamentales';
troncosBosque.instanceMatrix.needsUpdate = true;
copasBosque.instanceMatrix.needsUpdate = true;
if (copasBosque.instanceColor) copasBosque.instanceColor.needsUpdate = true;
scene.add(troncosBosque, copasBosque);

// Flora ornamental del jardín botánico. Está separada de plantInstances y de
// growableParts: no participa en la simulación, el raycasting ni los reportes.
const camasOrnamentales = [
    { x: -8.45, z: -5.2, sx: 1.25, sz: 1.4 },
    { x: -8.45, z: 0.2, sx: 1.25, sz: 1.45 },
    { x: -8.45, z: 5.6, sx: 1.25, sz: 1.45 },
    { x: 7.1, z: -5.2, sx: 0.35, sz: 1.35 },
    { x: 7.1, z: 5.6, sx: 0.35, sz: 1.35 },
    { x: 13.85, z: -5.2, sx: 1.3, sz: 1.4 },
    { x: 13.85, z: 0.2, sx: 1.3, sz: 1.45 },
    { x: 13.85, z: 5.6, sx: 1.3, sz: 1.45 }
];

const formaCama = new THREE.Shape();
formaCama.moveTo(-0.82, -1);
formaCama.lineTo(0.82, -1);
formaCama.quadraticCurveTo(1, -1, 1, -0.82);
formaCama.lineTo(1, 0.82);
formaCama.quadraticCurveTo(1, 1, 0.82, 1);
formaCama.lineTo(-0.82, 1);
formaCama.quadraticCurveTo(-1, 1, -1, 0.82);
formaCama.lineTo(-1, -0.82);
formaCama.quadraticCurveTo(-1, -1, -0.82, -1);

const camaGeometry = new THREE.ShapeGeometry(formaCama, 8);
camaGeometry.rotateX(-Math.PI / 2);
const camaMaterial = new THREE.MeshStandardMaterial({ color: 0x493b2b, roughness: 1 });
camasOrnamentales.forEach(cama => {
    const sueloCama = new THREE.Mesh(camaGeometry, camaMaterial);
    sueloCama.position.set(cama.x, 0.025, cama.z);
    sueloCama.scale.set(cama.sx, 1, cama.sz);
    sueloCama.receiveShadow = true;
    scene.add(sueloCama);
});

// Conecta los parterres laterales y el fondo para que el jardín no quede en islas.
[
    { x: -7.35, z: 0, sx: 0.45, sz: 13 },
    { x: 7.35, z: 0, sx: 0.4, sz: 13 },
    { x: -9.35, z: 0, sx: 0.42, sz: 13 },
    { x: 13.65, z: 0, sx: 0.45, sz: 13 },
    { x: 0, z: -5.2, sx: 7.6, sz: 0.42 },
    { x: 0, z: -9.8, sx: 13.5, sz: 0.38 }
].forEach(cama => {
    const franja = new THREE.Mesh(camaGeometry, camaMaterial);
    franja.position.set(cama.x, 0.028, cama.z);
    franja.scale.set(cama.sx, 1, cama.sz);
    franja.receiveShadow = true;
    scene.add(franja);
});

// Arbustos bajos en grupos de follaje, instanciados para mantener buen rendimiento.
const gruposArbustos = [
    [-8.55, -5.3, 0.9], [-7.75, -5.0, 0.72], [-9.05, -4.7, 0.68],
    [-8.55, 0.0, 1.0], [-7.8, 0.35, 0.72], [-9.1, 0.45, 0.72],
    [-8.55, 5.5, 0.92], [-7.8, 5.2, 0.7], [-9.05, 5.85, 0.68],
    [7.1, -5.25, 0.46], [7.1, 5.55, 0.46],
    [13.85, -5.3, 0.92], [13.05, -5.0, 0.72], [14.65, -4.75, 0.7],
    [13.85, 0.0, 0.98], [13.05, 0.3, 0.7], [14.65, 0.45, 0.72],
    [13.85, 5.5, 0.92], [13.05, 5.2, 0.72], [14.65, 5.85, 0.68],
    [-15.2, -13.4, 0.9], [-10.1, -21, 0.82], [10.6, -21.2, 0.82], [15.4, -13.2, 0.88]
];
// Hileras tupidas a los costados y detrás de la colección principal.
for (let i = 0, z = -12.5; z <= 21.5; i++, z += 1.02) {
    const escala = 0.7 + (i % 4) * 0.045;
    gruposArbustos.push(
        [-7.35, z, escala], [7.35, z, escala * 0.96],
        [-9.35, z + 0.36, escala * 0.88], [13.65, z + 0.36, escala * 0.9]
    );
}
for (let i = 0, x = -7.2; x <= 7.2; i++, x += 1.02) {
    gruposArbustos.push([x, -5.2, 0.72 + (i % 3) * 0.04]);
}
for (let i = 0, x = -13; x <= 13; i++, x += 1.4) {
    gruposArbustos.push([x, -9.8, 0.72 + (i % 4) * 0.035]);
}
const formasFollaje = [
    [0, 0.56, 0, 0.78, 0.57, 0.7],
    [-0.39, 0.43, 0.04, 0.6, 0.46, 0.56],
    [0.39, 0.43, -0.04, 0.6, 0.46, 0.56],
    [0.02, 0.42, 0.38, 0.58, 0.43, 0.55],
    [-0.02, 0.42, -0.38, 0.58, 0.43, 0.55]
];
const tonosArbusto = [0x28633b, 0x347849, 0x3f8249, 0x285a36, 0x4a874a];
const arbustoGeo = new THREE.IcosahedronGeometry(0.58, 1);
const arbustoMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
const arbustosMesh = new THREE.InstancedMesh(arbustoGeo, arbustoMat, gruposArbustos.length * formasFollaje.length);
const arbustoDummy = new THREE.Object3D();
let indiceArbusto = 0;
gruposArbustos.forEach(([x, z, escala], grupoIndex) => {
    formasFollaje.forEach(([dx, dy, dz, sx, sy, sz], follajeIndex) => {
        arbustoDummy.position.set(x + dx * escala, dy * escala, z + dz * escala);
        arbustoDummy.scale.set(sx * escala, sy * escala, sz * escala);
        arbustoDummy.rotation.set(0.03 * follajeIndex, 0.7 * grupoIndex + follajeIndex, 0.02 * grupoIndex);
        arbustoDummy.updateMatrix();
        arbustosMesh.setMatrixAt(indiceArbusto, arbustoDummy.matrix);
        arbustosMesh.setColorAt(indiceArbusto, new THREE.Color(tonosArbusto[(grupoIndex + follajeIndex) % tonosArbusto.length]));
        indiceArbusto++;
    });
});
arbustosMesh.name = 'arbustos-ornamentales';
arbustosMesh.instanceMatrix.needsUpdate = true;
if (arbustosMesh.instanceColor) arbustosMesh.instanceColor.needsUpdate = true;
scene.add(arbustosMesh);

// Cubresuelo ornamental: rellena el terreno con vegetación baja y deja libre
// la parcela experimental y el sendero para conservar despejada la escena.
function variacionVisual(semilla) {
    const valor = Math.sin(semilla * 127.1 + 311.7) * 43758.5453;
    return valor - Math.floor(valor);
}

const celdasCubresuelo = [];
let semillaCubresuelo = 1;
for (let z = -24; z <= 24; z += 1.65) {
    for (let x = -28; x <= 28; x += 1.65) {
        const parcelaCentral = Math.abs(x) < 7.15 && z > -4.2 && z < 3.3;
        const sendero = x > 7.65 && x < 12.35;
        if (parcelaCentral || sendero) continue;
        celdasCubresuelo.push({
            x: x + (variacionVisual(semillaCubresuelo) - 0.5) * 0.42,
            z: z + (variacionVisual(semillaCubresuelo + 1) - 0.5) * 0.42,
            escala: 0.42 + variacionVisual(semillaCubresuelo + 2) * 0.2,
            tono: Math.floor(variacionVisual(semillaCubresuelo + 3) * 5)
        });
        semillaCubresuelo++;
    }
}

const formasCubresuelo = [[0, 0.2, 0, 0.95, 0.48, 0.82], [-0.34, 0.17, 0.12, 0.7, 0.4, 0.65], [0.3, 0.16, -0.16, 0.68, 0.38, 0.66]];
const tonosCubresuelo = [0x326d3c, 0x3d7a42, 0x477f47, 0x2d6038, 0x56854a];
const cubresueloMesh = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.52, 1),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.96 }),
    celdasCubresuelo.length * formasCubresuelo.length
);
let indiceCubresuelo = 0;
celdasCubresuelo.forEach((celda, celdaIndex) => {
    formasCubresuelo.forEach(([dx, dy, dz, sx, sy, sz], formaIndex) => {
        const escala = celda.escala;
        arbustoDummy.position.set(celda.x + dx * escala, dy * escala, celda.z + dz * escala);
        arbustoDummy.scale.set(sx * escala, sy * escala, sz * escala);
        arbustoDummy.rotation.set(0, celdaIndex * 0.71 + formaIndex, 0);
        arbustoDummy.updateMatrix();
        cubresueloMesh.setMatrixAt(indiceCubresuelo, arbustoDummy.matrix);
        cubresueloMesh.setColorAt(indiceCubresuelo, new THREE.Color(tonosCubresuelo[(celda.tono + formaIndex) % tonosCubresuelo.length]));
        indiceCubresuelo++;
    });
});
cubresueloMesh.name = 'cubresuelo-ornamental';
cubresueloMesh.instanceMatrix.needsUpdate = true;
if (cubresueloMesh.instanceColor) cubresueloMesh.instanceColor.needsUpdate = true;
scene.add(cubresueloMesh);

// Suculentas tipo agave que dan variedad de siluetas al borde de los parterres.
const centrosAgave = [
    [-9.0, -5.9, 0.68], [-9.0, 1.4, 0.72], [-9.0, 6.8, 0.62],
    [7.1, -5.9, 0.36], [7.1, 6.8, 0.36],
    [14.45, -5.9, 0.7], [14.45, 1.4, 0.74], [14.45, 6.8, 0.64]
];
for (let z = -10; z <= 18; z += 4) {
    centrosAgave.push([-6.95, z, 0.38], [7.0, z, 0.36], [13.1, z + 1.2, 0.4]);
}
const hojasAgaveGeo = new THREE.ConeGeometry(0.13, 1.1, 6);
const hojasAgaveMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 });
const agavesMesh = new THREE.InstancedMesh(hojasAgaveGeo, hojasAgaveMat, centrosAgave.length * 9);
const agaveDummy = new THREE.Object3D();
const tonosAgave = [0x638f4e, 0x78a45b, 0x4f7e4a, 0x91ad67];
let indiceHojaAgave = 0;
centrosAgave.forEach(([x, z, escala], agaveIndex) => {
    for (let hojaIndex = 0; hojaIndex < 9; hojaIndex++) {
        const angulo = (hojaIndex / 9) * Math.PI * 2 + agaveIndex * 0.31;
        const inclinacion = 0.32 + (hojaIndex % 3) * 0.08;
        agaveDummy.position.set(
            x + Math.sin(angulo) * 0.17 * escala,
            0.55 * escala,
            z + Math.cos(angulo) * 0.17 * escala
        );
        agaveDummy.rotation.set(-Math.sin(angulo) * inclinacion, angulo, Math.cos(angulo) * inclinacion);
        agaveDummy.scale.set(escala, escala * (0.9 + (hojaIndex % 2) * 0.12), escala);
        agaveDummy.updateMatrix();
        agavesMesh.setMatrixAt(indiceHojaAgave, agaveDummy.matrix);
        agavesMesh.setColorAt(indiceHojaAgave, new THREE.Color(tonosAgave[(hojaIndex + agaveIndex) % tonosAgave.length]));
        indiceHojaAgave++;
    }
});
agavesMesh.name = 'agaves-ornamentales';
agavesMesh.instanceMatrix.needsUpdate = true;
if (agavesMesh.instanceColor) agavesMesh.instanceColor.needsUpdate = true;
scene.add(agavesMesh);

// Macizos florales de colores; son decoración estática y no forman parte del cultivo.
const centrosMacizosFlorales = [
    [-8.2, -5.6], [-8.5, -0.6], [-8.25, 5.1],
    [7.05, -5.6], [7.05, 5.1],
    [13.55, -5.6], [13.8, -0.6], [13.55, 5.1]
];
for (let z = -12; z <= 19; z += 1.65) {
    centrosMacizosFlorales.push([-7.15, z], [7.15, z], [13.15, z + 0.5]);
}
for (let x = -6.5; x <= 6.5; x += 1.85) {
    centrosMacizosFlorales.push([x, -5.2]);
}
for (let x = -12; x <= 12; x += 2.2) {
    centrosMacizosFlorales.push([x, -9.8]);
}
const flores = [];
centrosMacizosFlorales.forEach(([x, z], macizoIndex) => {
    const cantidad = macizoIndex % 2 === 0 ? 7 : 8;
    for (let florIndex = 0; florIndex < cantidad; florIndex++) {
        const angulo = florIndex * 2.399 + macizoIndex * 0.63;
        const radio = 0.18 + (florIndex % 3) * 0.13;
        flores.push({
            x: x + Math.cos(angulo) * radio,
            z: z + Math.sin(angulo) * radio,
            alto: 0.34 + (florIndex % 4) * 0.07,
            color: (macizoIndex + florIndex) % 5
        });
    }
});

const tallosFlores = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.014, 0.022, 1, 5),
    new THREE.MeshStandardMaterial({ color: 0x4f8543, roughness: 0.8 }),
    flores.length
);
const petalosFlores = new THREE.InstancedMesh(
    new THREE.SphereGeometry(1, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45 }),
    flores.length * 5
);
const centrosFlores = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.065, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0xffd34e, roughness: 0.4 }),
    flores.length
);
const florDummy = new THREE.Object3D();
const tonosFlor = [0xe875a4, 0xf2be45, 0xa78bdb, 0xf5f0e2, 0xe9825c];
flores.forEach((flor, florIndex) => {
    florDummy.position.set(flor.x, flor.alto / 2, flor.z);
    florDummy.scale.set(1, flor.alto, 1);
    florDummy.rotation.set(0, 0, Math.cos(florIndex) * 0.06);
    florDummy.updateMatrix();
    tallosFlores.setMatrixAt(florIndex, florDummy.matrix);

    for (let petaloIndex = 0; petaloIndex < 5; petaloIndex++) {
        const angulo = (petaloIndex / 5) * Math.PI * 2;
        florDummy.position.set(
            flor.x + Math.sin(angulo) * 0.065,
            flor.alto,
            flor.z + Math.cos(angulo) * 0.065
        );
        florDummy.rotation.set(0, angulo, 0);
        florDummy.scale.set(0.055, 0.035, 0.12);
        florDummy.updateMatrix();
        const instanciaPetalo = florIndex * 5 + petaloIndex;
        petalosFlores.setMatrixAt(instanciaPetalo, florDummy.matrix);
        petalosFlores.setColorAt(instanciaPetalo, new THREE.Color(tonosFlor[flor.color]));
    }

    florDummy.position.set(flor.x, flor.alto, flor.z);
    florDummy.rotation.set(0, 0, 0);
    florDummy.scale.set(1, 1, 1);
    florDummy.updateMatrix();
    centrosFlores.setMatrixAt(florIndex, florDummy.matrix);
});
tallosFlores.instanceMatrix.needsUpdate = true;
petalosFlores.instanceMatrix.needsUpdate = true;
centrosFlores.instanceMatrix.needsUpdate = true;
if (petalosFlores.instanceColor) petalosFlores.instanceColor.needsUpdate = true;
scene.add(tallosFlores, petalosFlores, centrosFlores);
=======
>>>>>>> b1f99aa4c9685476098dc3daae5e6d0452556a41

function crearPinoTropical(x, z, escala = 1) {
    const pino = new THREE.Group();
    pino.position.set(x, 0.05, z);

    const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * escala, 0.35 * escala, 4 * escala, 10), matTroncoRobusto);
    tronco.position.y = 2 * escala;
    tronco.castShadow = true;
    tronco.userData = { name: "Pino Conífera", type: "Gimnosperma", height: `${(4.5 * escala).toFixed(1)} m`, desc: "Pino silvestre del jardín.", plantIndex: "Jardín" };
    pino.add(tronco);
    interactableObjects.push(tronco);

    for (let i = 0; i < 3; i++) {
        const cono = new THREE.Mesh(new THREE.ConeGeometry((1.6 - i * 0.35) * escala, 2 * escala, 10), matCopaPino);
        cono.position.y = (2.8 + i * 1.1) * escala;
        cono.castShadow = true;
        pino.add(cono);
    }

    jardinGroup.add(pino);
}

function crearPalmeraTropical(x, z, escala = 1) {
    const palmera = new THREE.Group();
    palmera.position.set(x, 0.05, z);

    const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * escala, 0.3 * escala, 5 * escala, 12), matPalmeraTronco);
    tronco.position.y = 2.5 * escala;
    tronco.castShadow = true;
    tronco.userData = { name: "Palmera Real", type: "Monocotiledónea", height: `${(5 * escala).toFixed(1)} m`, desc: "Palmera de clima cálido.", plantIndex: "Jardín" };
    palmera.add(tronco);
    interactableObjects.push(tronco);

    const copaHojas = new THREE.Group();
    copaHojas.position.y = 5 * escala;

    for (let i = 0; i < 7; i++) {
        const hojaGeo = new THREE.PlaneGeometry(0.6 * escala, 2.4 * escala);
        hojaGeo.translate(0, 1.2 * escala, 0);
        const hoja = new THREE.Mesh(hojaGeo, matPalmeraHoja);
        hoja.rotation.y = (i * Math.PI * 2) / 7;
        hoja.rotation.x = 0.85;
        copaHojas.add(hoja);
    }
    palmera.add(copaHojas);
    jardinGroup.add(palmera);
}

function crearMatorralFlorido(x, z) {
    const arbusto = new THREE.Group();
    arbusto.position.set(x, 0.05, z);

    const baseGeo = new THREE.SphereGeometry(0.7, 12, 12);
    baseGeo.scale(1, 0.65, 1);
    const base = new THREE.Mesh(baseGeo, matCopaFrondosa);
    base.position.y = 0.45;
    base.castShadow = true;
    base.userData = { name: "Arbusto Floral Silvestre", type: "Cobertura Vegetal", height: "0.9 m", desc: "Planta de cobertura.", plantIndex: "Jardín" };
    arbusto.add(base);
    interactableObjects.push(base);

    for (let i = 0; i < 5; i++) {
        const flor = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), matFlorPetalo);
        flor.position.set((Math.random() - 0.5) * 0.8, 0.7 + Math.random() * 0.3, (Math.random() - 0.5) * 0.8);
        arbusto.add(flor);
    }

    jardinGroup.add(arbusto);
}

function construirJardinBotanico() {
    jardinGroup.clear();

    for (let x = -28; x <= 28; x += 6) {
        if (Math.random() > 0.3) crearArbolFrondoso(x + (Math.random() * 2 - 1), -14 - Math.random() * 6, 0.9 + Math.random() * 0.4);
        if (Math.random() > 0.4) crearPinoTropical(x + (Math.random() * 3 - 1.5), -22 - Math.random() * 5, 0.8 + Math.random() * 0.5);
    }

    for (let z = -12; z <= 12; z += 5) {
        crearPalmeraTropical(-18 - Math.random() * 4, z, 0.8 + Math.random() * 0.4);
        crearPalmeraTropical(18 + Math.random() * 4, z, 0.8 + Math.random() * 0.4);

        crearMatorralFlorido(-12 - Math.random() * 3, z + Math.random());
        crearMatorralFlorido(12 + Math.random() * 3, z + Math.random());
    }
}

construirJardinBotanico();

// ============================================================
// 5. SURCO DE 5 PLANTAS EXPERIMENTALES
// ============================================================
<<<<<<< HEAD
const interactableObjects = [];
const arrayHojas = [];
const growableParts = [];
const plantInstances = [];

let isWindy = true;
let isGrowthPaused = false;
let growthSpeed = 1.0;
let normalizedGrowth = 0.65; // Iniciado en fase visible para impacto estético inmediato

// Materiales reactivos PBR
=======
>>>>>>> b1f99aa4c9685476098dc3daae5e6d0452556a41
const matMaceta = new THREE.MeshStandardMaterial({ color: 0x8a482b, roughness: 0.75 });
const matTierra = new THREE.MeshStandardMaterial({ color: 0x2b1a10, roughness: 1.0 });
const matTallo = new THREE.MeshStandardMaterial({ color: 0x365e38, roughness: 0.65 });
const matHoja = new THREE.MeshStandardMaterial({ color: 0x88d424, roughness: 0.35, side: THREE.DoubleSide });

function crearParteInteractiva(geometria, material, nombre, tipo, altura, desc, biomasaPct = 0, plantIndex = 1) {
    const mesh = new THREE.Mesh(geometria, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { name: nombre, type: tipo, height: altura, desc: desc, biomasaPct, plantIndex };
    interactableObjects.push(mesh);
    return mesh;
}

function crearParteCrecimiento(geometria, material, nombre, tipo, altura, desc, growStart, growEnd, baseScale, biomasaPct, plantIndex) {
    const mesh = crearParteInteractiva(geometria, material, nombre, tipo, altura, desc, biomasaPct, plantIndex);
    mesh.scale.set(0, 0, 0);
    mesh.userData.growStart = growStart;
    mesh.userData.growEnd = growEnd;
    mesh.userData.baseScale = baseScale.clone();
    growableParts.push(mesh);
    return mesh;
}

function construirPlanta(posX, plantIndex) {
    const pGroup = new THREE.Group();
    pGroup.position.set(posX, 0.05, 0);

    const maceta = crearParteInteractiva(new THREE.CylinderGeometry(0.85, 0.55, 1.1, 24), matMaceta, "Maceta Terracota", "Cilindro", "0-15 cm", "Contenedor radicular", 0, plantIndex);
    maceta.position.y = 0.55;
    pGroup.add(maceta);

<<<<<<< HEAD
const tierra = crearParteInteractiva(new THREE.CylinderGeometry(1.35, 1.35, 0.1, 32), matTierra, "Sustrato Orgánico", "Cilindro Plano", "18 cm", "Sustrato con retención de agua y N-P-K.", 0);
tierra.position.y = 1.85;
macetaGroup.add(tierra);

// Grupo Jerárquico de la Planta
const planta = new THREE.Group();
planta.name = 'estructura-planta';
planta.position.y = 1.85;

// Tallo principal
const geoTallo = new THREE.CylinderGeometry(0.18, 0.25, 3.2, 16);
geoTallo.translate(0, 1.6, 0);
const tallo = crearParteCrecimiento(geoTallo, matTallo, "Tallo Principal (Xilema y Floema)", "CylinderGeometry", "20 a 65 cm", "Eje vascular leñoso de soporte y conducción.", 0.0, 0.35, new THREE.Vector3(1,1,1), 40);
tallo.name = 'tallo-principal';
planta.add(tallo);
=======
    const cuerpo = new THREE.Group();
    cuerpo.position.y = 1.14;
    pGroup.add(cuerpo);

    const geoTallo = new THREE.CylinderGeometry(0.12, 0.18, 2.4, 16);
    geoTallo.translate(0, 1.2, 0);
    const nombreTallo = plantIndex === 1 ? "Tallo Principal (Plumeria Rubra)" : `Tallo Principal (Planta #${plantIndex})`;
    const tallo = crearParteCrecimiento(geoTallo, matTallo, nombreTallo, "Cilindro", "15-50 cm", "Vaso leñoso", 0.0, 0.35, new THREE.Vector3(1,1,1), 40, plantIndex);
    cuerpo.add(tallo);

    function crearCopa(posY, rotZ, rotX, delay, escalaCopa = 1.0) {
        const ramaGroup = new THREE.Group();
        ramaGroup.position.set(0, posY, 0);
        ramaGroup.rotation.set(rotX, 0, rotZ);
>>>>>>> b1f99aa4c9685476098dc3daae5e6d0452556a41

        const ramaGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.1, 16);
        ramaGeo.translate(0, 0.55, 0);
        const rama = crearParteCrecimiento(ramaGeo, matTallo, "Rama Secundaria", "Cilindro", "50-70 cm", "Soporte foliar", 0.22 + delay, 0.52 + delay, new THREE.Vector3(1,1,1), 10, plantIndex);
        ramaGroup.add(rama);

        const coronaHojas = new THREE.Group();
        coronaHojas.position.y = 1.05;
        ramaGroup.add(coronaHojas);

        const geoHoja = new THREE.SphereGeometry(0.38, 16, 16);
        geoHoja.translate(0, 0, 0.38);

        for (let i = 0; i < 5; i++) {
            const escalaHoja = new THREE.Vector3(0.55 * escalaCopa, 0.04, 2.1 * escalaCopa);
            const hoja = crearParteCrecimiento(geoHoja, matHoja, "Hoja Fotosintética", "Esfera", "~70 cm", "Captación solar", 0.45 + delay, 0.75 + delay, escalaHoja, 4, plantIndex);

            const pivot = new THREE.Group();
            pivot.rotation.y = (i * Math.PI * 2) / 5;
            pivot.rotation.x = 0.14;
            pivot.add(hoja);
            coronaHojas.add(pivot);
            arrayHojas.push(hoja);
        }

        tallo.add(ramaGroup);
    }

    crearCopa(2.3, 0.0, 0.0, 0.0, 1.0);
    crearCopa(1.8, 0.48, -0.2, 0.10, 0.9);
    crearCopa(1.5, -0.48, 0.2, 0.18, 0.85);

    scene.add(pGroup);
    plantasGroupArray.push(pGroup);
}

[-6.0, -3.0, 0.0, 3.0, 6.0].forEach((px, idx) => construirPlanta(px, idx + 1));

// Muestra visual en bancal: cinco plantas comparten el escenario experimental.
const cultivoMaster = new THREE.Group();
cultivoMaster.name = 'muestra-cultivo';
cultivoMaster.add(macetaGroup, planta);

const bancal = new THREE.Mesh(
    new THREE.BoxGeometry(13.4, 0.16, 3.6),
    new THREE.MeshStandardMaterial({ color: 0x343a32, roughness: 0.9 })
);
bancal.position.set(0, 0.08, 0);
bancal.receiveShadow = true;
scene.add(bancal);

const posicionesCultivo = [-5.05, -2.525, 0, 2.525, 5.05];
posicionesCultivo.forEach((posicionX, indice) => {
    const raiz = indice === 2 ? cultivoMaster : cultivoMaster.clone(true);
    raiz.position.set(posicionX, 0.16, 0);
    raiz.scale.setScalar(0.56);

    const hojas = [];
    const partes = [];
    raiz.traverse(objeto => {
        if (!objeto.isMesh) return;
        if (objeto.userData.name === 'Hoja de Plumeria') hojas.push(objeto);
        if (Number.isFinite(objeto.userData.growStart)) partes.push(objeto);
        if (indice !== 2 && objeto.userData.name) interactableObjects.push(objeto);
    });

    plantInstances.push({
        raiz,
        planta: raiz.getObjectByName('estructura-planta'),
        tallo: raiz.getObjectByName('tallo-principal'),
        hojas,
        partes
    });
    if (indice !== 2) growableParts.push(...partes);
    scene.add(raiz);
});

// ============================================================
// 6. INTEGRADOR BIOINFORMÁTICO
// ============================================================
let growthEngine = null;
let especiesCatalogo = [];
let especieActual = null;
let liveChart = null;
let abChart = null;
<<<<<<< HEAD
let isSimRunning = false;
let simIntervalId = null;
let dailyHistory = [];
let maxSimulatedDay = 0;
let plantHealth = 100;
let leavesVisible = true;
let manualLightSetting = 1.1;
=======
>>>>>>> b1f99aa4c9685476098dc3daae5e6d0452556a41

const CATALOGO_LOCAL = [
    { id: 1, nombre_comun: 'Plumeria', nombre_cientifico: 'Plumeria rubra', tipo: 'arbórea', temp_optima: 27, agua_optima: 40, luz_optima: 1000, nutrientes_opt: 60, tasa_r: 0.12, capacidad_k: 150, dias_madurez: 120, color_hoja: '#88d424', descripcion: 'Arbusto leñoso tropical.' },
    { id: 2, nombre_comun: 'Maíz', nombre_cientifico: 'Zea mays', tipo: 'herbácea', temp_optima: 28, agua_optima: 55, luz_optima: 1000, nutrientes_opt: 75, tasa_r: 0.18, capacidad_k: 120, dias_madurez: 90, color_hoja: '#5cb31a', descripcion: 'Cereal fotosintético C4.' }
];

<<<<<<< HEAD
function limitar(valor, minimo, maximo) {
    return Math.max(minimo, Math.min(maximo, valor));
}

function leerAmbienteBaseDesdeUI() {
    return {
        temperatura: parseFloat(document.getElementById('slider-temp').value),
        luz: parseFloat(document.getElementById('slider-luz').value),
        agua: parseFloat(document.getElementById('slider-agua').value),
        nutrientes: parseFloat(document.getElementById('slider-nutrientes').value),
        co2: parseFloat(document.getElementById('slider-co2').value)
    };
}

function ruidoDiario(dia, canal) {
    const semilla = (especieActual ? Number(especieActual.id) : 1) * 97.31;
    const valor = Math.sin((dia + canal * 17.13 + semilla) * 127.1) * 43758.5453;
    return valor - Math.floor(valor);
}

function generarClimaDiario(dia, ambienteBase) {
    let temperatura = ambienteBase.temperatura + Math.sin(dia * 0.31) * 2.6 + (ruidoDiario(dia, 1) - 0.5) * 2.8;
    let luz = ambienteBase.luz * (0.91 + Math.sin(dia * 0.23 + 0.7) * 0.1 + (ruidoDiario(dia, 2) - 0.5) * 0.12);
    let agua = ambienteBase.agua + Math.sin(dia * 0.19 + 1.2) * 6 + (ruidoDiario(dia, 3) - 0.5) * 5 - Math.min(dia * 0.025, 6);
    const nutrientes = Math.max(0, ambienteBase.nutrientes - dia * 0.035);
    const co2 = ambienteBase.co2 + Math.round((ruidoDiario(dia, 4) - 0.5) * 36);
    const eventos = [];
    let tipoClima = 'soleado';

    if (dia > 0 && dia % 28 === 0) {
        temperatura += 8;
        agua -= 9;
        luz *= 1.12;
        tipoClima = 'calor';
        eventos.push({ icono: '🔥', nombre: 'Ola de calor', detalle: 'Temperatura elevada y mayor pérdida de agua.', dano: 8 });
    }

    if (dia > 0 && dia % 19 === 0) {
        temperatura -= 1.5;
        agua += 18;
        luz *= 0.72;
        if (tipoClima !== 'calor') tipoClima = 'lluvia';
        eventos.push({ icono: '🌧️', nombre: 'Lluvia moderada', detalle: 'El sustrato recupera humedad.', dano: 0 });
    } else if (dia > 0 && dia % 11 === 0 && tipoClima !== 'calor') {
        luz *= 0.52;
        tipoClima = 'nublado';
        eventos.push({ icono: '☁️', nombre: 'Jornada nublada', detalle: 'Menor radiación disponible para fotosíntesis.', dano: 0 });
    }

    if (dia > 0 && dia % 37 === 0) {
        eventos.push({ icono: '🐛', nombre: 'Plaga detectada', detalle: 'Daño foliar y consumo de tejido vegetal.', dano: 16 });
    }

    if (dia > 0 && dia % 53 === 0) {
        const humedadAlta = agua > (especieActual ? Number(especieActual.agua_optima) : 55) + 18;
        eventos.push(humedadAlta
            ? { icono: '🍄', nombre: 'Riesgo de hongos', detalle: 'La humedad persistente favorece una infección foliar.', dano: 12 }
            : { icono: '🧪', nombre: 'Reserva de nutrientes baja', detalle: 'La planta necesita recuperar nutrientes del sustrato.', dano: 7 });
    }

    temperatura = limitar(temperatura, 5, 45);
    luz = limitar(luz, 100, 2500);
    agua = limitar(agua, 5, 95);
    const ambiente = { temperatura, luz, agua, nutrientes: limitar(nutrientes, 0, 100), co2: limitar(co2, 300, 1200) };
    const especie = especieActual || {};
    let nombreClima = 'Soleado y estable';
    let iconoClima = '☀️';

    if (tipoClima === 'calor') {
        nombreClima = 'Ola de calor';
        iconoClima = '🔥';
    } else if (tipoClima === 'lluvia') {
        nombreClima = 'Lluvia moderada';
        iconoClima = '🌧️';
    } else if (tipoClima === 'nublado') {
        nombreClima = 'Cielo nublado';
        iconoClima = '☁️';
    } else if (temperatura > (Number(especie.temp_optima) || 25) + 4) {
        nombreClima = 'Día cálido';
        iconoClima = '🌤️';
    } else if (agua < (Number(especie.agua_optima) || 55) - 8) {
        nombreClima = 'Ambiente seco';
        iconoClima = '🌵';
    } else if (luz < ambienteBase.luz * 0.82) {
        nombreClima = 'Parcialmente nublado';
        iconoClima = '🌥️';
    }

    return { ambiente, eventos, tipoClima, nombreClima, iconoClima };
}

function estadoDeSalud(salud) {
    if (salud < 30) return { etiqueta: 'Estado crítico', clase: 'is-critical' };
    if (salud < 65) return { etiqueta: 'Deterioro visible', clase: 'is-critical' };
    if (salud < 85) return { etiqueta: 'Estrés acumulado', clase: 'is-stressed' };
    return { etiqueta: 'Vigor saludable', clase: '' };
}

function reconstruirHistorialDiario(hastaDia, ambienteBase) {
    growthEngine.reset();
    growthEngine.setEnvironment(ambienteBase);
    dailyHistory = [];
    let salud = 100;

    const climaInicial = generarClimaDiario(0, ambienteBase);
    const medicionInicial = growthEngine.generarMedicion(0);
    dailyHistory.push({
        ...medicionInicial,
        ambiente: climaInicial.ambiente,
        eventos: [],
        tipo_clima: climaInicial.tipoClima,
        clima: climaInicial.nombreClima,
        icono_clima: climaInicial.iconoClima,
        salud,
        hojas_perdidas: 0
    });

    for (let dia = 1; dia <= hastaDia; dia++) {
        const clima = generarClimaDiario(dia, ambienteBase);
        growthEngine.setEnvironment(clima.ambiente);
        const medicion = growthEngine.step();
        const estres = medicion.estres_total;
        const danoEstres = Math.max(0, estres - 24) * 0.1;
        const recuperacion = estres < 16 ? 0.65 : estres < 28 ? 0.2 : 0;
        const danoEventos = clima.eventos.reduce((total, evento) => total + evento.dano, 0);
        salud = limitar(salud + recuperacion - danoEstres - danoEventos, 0, 100);

        const hojasPerdidas = Math.min(arrayHojas.length, Math.round(((100 - salud) / 100) * arrayHojas.length * 0.82));
        medicion.salud = Math.round(salud);
        medicion.hojas_perdidas = hojasPerdidas;
        medicion.num_hojas = Math.max(0, medicion.num_hojas - Math.round((100 - salud) * 0.12));
        medicion.biomasa = Math.round(medicion.biomasa * (0.55 + salud * 0.0045) * 100) / 100;
        medicion.altura = Math.round(medicion.altura * (0.9 + salud * 0.001) * 100) / 100;
        medicion.ambiente = clima.ambiente;
        medicion.eventos = clima.eventos;
        medicion.tipo_clima = clima.tipoClima;
        medicion.clima = clima.nombreClima;
        medicion.icono_clima = clima.iconoClima;
        dailyHistory.push(medicion);
    }
}

// ============================================================
// 5. INICIALIZACIÓN Y CONEXIÓN API REST
// ============================================================
=======
>>>>>>> b1f99aa4c9685476098dc3daae5e6d0452556a41
async function initApp() {
    if (window.GrowthEngine) {
        growthEngine = new window.GrowthEngine();
    } else {
        console.error("GrowthEngine no está disponible");
        return;
    }

    setupTabNavigation();
    initCharts();
    setupEventListeners();
    await checkApiAndLoadSpecies();
}

async function checkApiAndLoadSpecies() {
    const statusText = document.getElementById('api-status-text');
    try {
        if (statusText) statusText.textContent = 'Conectando...';
        const especies = await window.API.getEspecies();
        if (especies && especies.length > 0) {
            especiesCatalogo = especies;
            if (statusText) { statusText.textContent = 'MySQL Online (FlightPHP)'; statusText.style.color = '#a8f060'; }
        } else throw new Error('Sin especies');
    } catch (e) {
        especiesCatalogo = CATALOGO_LOCAL;
        if (statusText) { statusText.textContent = 'Modo Local (PHP Inactivo)'; statusText.style.color = '#ffa726'; }
    }

    populateSpeciesDropdowns();
<<<<<<< HEAD
    
    // Seleccionar Plumeria Rubra por defecto
    const plumeria = especiesCatalogo.find(e => e.nombre_comun === 'Plumeria') || especiesCatalogo[0];
    seleccionarEspecie(plumeria);

    // Mostrar una trayectoria inicial para que el usuario pueda explorar el registro diario.
    maxSimulatedDay = Math.min(45, growthEngine.maxDias);
    actualizarGrowthTimeline(maxSimulatedDay);

=======
    seleccionarEspecie(especiesCatalogo[0]);
    actualizarGrowthTimeline(45);
>>>>>>> b1f99aa4c9685476098dc3daae5e6d0452556a41
    cargarHistorialSimulaciones();
    cargarReportesBio();
}

function populateSpeciesDropdowns() {
    const selMain = document.getElementById('sel-especie');
    const selAbA = document.getElementById('sel-ab-specie-a');
    const selAbB = document.getElementById('sel-ab-specie-b');

    if (selMain) selMain.innerHTML = '';
    if (selAbA) selAbA.innerHTML = '';
    if (selAbB) selAbB.innerHTML = '';

    especiesCatalogo.forEach(esp => {
        const opt = `<option value="${esp.id}">${esp.nombre_comun} (${esp.nombre_cientifico})</option>`;
        if (selMain) selMain.innerHTML += opt;
        if (selAbA) selAbA.innerHTML += opt;
        if (selAbB) selAbB.innerHTML += opt;
    });

    if (selAbB && selAbB.options.length > 1) selAbB.selectedIndex = 1;
}

<<<<<<< HEAD
function seleccionarEspecie(especie) {
    especieActual = especie;
    growthEngine.setEspecie(especie);
    document.getElementById('timeline-slider').max = growthEngine.maxDias;
    maxSimulatedDay = Math.min(maxSimulatedDay, growthEngine.maxDias);
=======
function seleccionarEspecie(esp) {
    especieActual = esp;
    if (growthEngine) growthEngine.setEspecie(esp);
>>>>>>> b1f99aa4c9685476098dc3daae5e6d0452556a41

    const selMain = document.getElementById('sel-especie');
    if (selMain) selMain.value = esp.id;

<<<<<<< HEAD
    // Actualizar badge botánico
    document.getElementById('badge-esp-nombre').textContent = `${especie.nombre_comun} (${especie.nombre_cientifico})`;
    document.getElementById('badge-esp-tipo').textContent = especie.tipo || 'planta';
    document.getElementById('badge-esp-desc').textContent = especie.descripcion || '';

    // Sugerencias óptimas
    document.getElementById('opt-temp').textContent = `(Ópt: ${especie.temp_optima}°C)`;
    document.getElementById('opt-agua').textContent = `(Ópt: ${especie.agua_optima}%)`;
    document.getElementById('opt-luz').textContent = `(Ópt: ${especie.luz_optima})`;
    document.getElementById('opt-nutrientes').textContent = `(Ópt: ${especie.nutrientes_opt}%)`;

    // Sincronizar inputs genéticos
    document.getElementById('input-r').value = especie.tasa_r || 0.12;
    document.getElementById('input-k').value = especie.capacidad_k || 150;

    // Paleta cromática 3D
    if (especie.color_tallo) matTallo.color.set(especie.color_tallo);
    if (especie.color_hoja) {
        matHoja.color.set(especie.color_hoja);
        plantInstances.forEach(instancia => instancia.hojas.forEach(hoja => hoja.material.color.set(especie.color_hoja)));
=======
    if (document.getElementById('badge-esp-nombre')) {
        document.getElementById('badge-esp-nombre').textContent = `${esp.nombre_comun} (${esp.nombre_cientifico})`;
        document.getElementById('badge-esp-tipo').textContent = esp.tipo || 'herbácea';
        document.getElementById('badge-esp-desc').textContent = esp.descripcion || 'Especie seleccionada.';
>>>>>>> b1f99aa4c9685476098dc3daae5e6d0452556a41
    }

    if (esp.color_hoja) arrayHojas.forEach(h => h.material.color.set(esp.color_hoja));
    actualizarParametrosDesdeUI();
}

function actualizarParametrosDesdeUI() {
    if (!growthEngine) return;

    const modelo = document.getElementById('sel-modelo')?.value || 'logistico';
    const r = parseFloat(document.getElementById('input-r')?.value) || 0.12;
    const K = parseFloat(document.getElementById('input-k')?.value) || 150;

<<<<<<< HEAD
    growthEngine.setModel(modelo);
    growthEngine.setParams(r, K, 1);
    growthEngine.setEnvironment(leerAmbienteBaseDesdeUI());
    actualizarDescripcionModelo();
    actualizarGrowthTimeline(growthEngine.dia);
}

const GUIA_MODELOS = {
    logistico: {
        titulo: 'Logístico de Verhulst',
        ecuacion: 'dN/dt = rN (1 − N/K)',
        descripcion: 'La curva tiene forma de S: comienza lentamente, acelera durante el crecimiento y después se frena al acercarse a K. Así representa la competencia por agua, luz, espacio y nutrientes.',
        uso: 'Útil cuando el cultivo tiene recursos limitados y una capacidad máxima.'
    },
    gompertz: {
        titulo: 'Gompertz',
        ecuacion: 'N(t) = K · exp(−exp(−r(t − t₀)))',
        descripcion: 'Describe una curva sigmoide asimétrica: el cambio más rápido ocurre antes que en el modelo logístico y luego la acumulación se desacelera gradualmente.',
        uso: 'Útil para aproximar desarrollo de frutos, biomasa y crecimiento con maduración prolongada.'
    },
    exponencial: {
        titulo: 'Exponencial de Malthus',
        ecuacion: 'N(t) = N₀ · e^(r·t)',
        descripcion: 'La tasa de aumento es proporcional al tamaño actual: mientras más biomasa hay, más rápido crece. En esta simulación se limita cerca de K para mantener una escala visual manejable.',
        uso: 'Útil para representar una fase inicial con recursos abundantes y poca competencia.'
    },
    lineal: {
        titulo: 'Lineal',
        ecuacion: 'N(t) = N₀ + a·t',
        descripcion: 'Suma una cantidad similar en cada unidad de tiempo y no cambia su pendiente según la biomasa. El resultado se detiene al llegar a la capacidad K.',
        uso: 'Útil como referencia sencilla para comparar una tasa constante de crecimiento.'
    }
};

function actualizarDescripcionModelo() {
    const modelo = document.getElementById('sel-modelo').value || 'logistico';
    const guia = GUIA_MODELOS[modelo] || GUIA_MODELOS.logistico;
    const tasa = Number.parseFloat(document.getElementById('input-r').value) || 0;
    const capacidad = Number.parseFloat(document.getElementById('input-k').value) || 0;

    document.getElementById('model-explanation-title').textContent = guia.titulo;
    document.getElementById('model-explanation-equation').textContent = guia.ecuacion;
    document.getElementById('model-explanation-text').textContent = guia.descripcion;
    document.getElementById('model-explanation-use').textContent = `Uso: ${guia.uso}`;
    document.getElementById('model-explanation-params').textContent = `r = ${tasa.toFixed(2)} · K = ${capacidad}`;
    document.getElementById('growth-model-explanation').dataset.model = modelo;
}

// ============================================================
// 6. DASHBOARD KPIS & DECISIONES
// ============================================================
function actualizarDashboardKPIs() {
    const dia = growthEngine.dia;
    const med = dailyHistory[dia] || growthEngine.generarMedicion(dia);
=======
    const env = {
        temperatura: parseFloat(document.getElementById('slider-temp')?.value || 25),
        luz: parseFloat(document.getElementById('slider-luz')?.value || 800),
        agua: parseFloat(document.getElementById('slider-agua')?.value || 55),
        nutrientes: parseFloat(document.getElementById('slider-nutrientes')?.value || 70),
        co2: parseFloat(document.getElementById('slider-co2')?.value || 400)
    };

    if (document.getElementById('val-temp')) document.getElementById('val-temp').textContent = env.temperatura;
    if (document.getElementById('val-agua')) document.getElementById('val-agua').textContent = env.agua;
    if (document.getElementById('val-luz')) document.getElementById('val-luz').textContent = env.luz;
    if (document.getElementById('val-nutrientes')) document.getElementById('val-nutrientes').textContent = env.nutrientes;
    if (document.getElementById('val-co2')) document.getElementById('val-co2').textContent = env.co2;

    growthEngine.setModel(modelo);
    growthEngine.setParams(r, K);
    growthEngine.setEnvironment(env);

    actualizarGrowthTimeline(growthEngine.dia);
}

function actualizarGrowthTimeline(dia) {
    if (!growthEngine) return;
>>>>>>> b1f99aa4c9685476098dc3daae5e6d0452556a41

    const med = growthEngine.simularHastaDia(dia);
    const normGrowth = Math.min(1.0, dia / (especieActual?.dias_madurez || 120));

    growableParts.forEach(part => {
        const d = part.userData;
        let progress = Math.max(0, Math.min(1, (normGrowth - d.growStart) / (d.growEnd - d.growStart)));
        let smooth = progress * progress * (3 - 2 * progress);
        part.scale.set(smooth * d.baseScale.x, smooth * d.baseScale.y, smooth * d.baseScale.z);
    });

    if (document.getElementById('timeline-slider')) document.getElementById('timeline-slider').value = dia;
    if (document.getElementById('timeline-day-val')) document.getElementById('timeline-day-val').textContent = dia;
    if (document.getElementById('salud-dia-val')) document.getElementById('salud-dia-val').textContent = dia;

    if (document.getElementById('kpi-dia')) document.getElementById('kpi-dia').textContent = med.dia;
    if (document.getElementById('kpi-altura')) document.getElementById('kpi-altura').textContent = `${med.altura.toFixed(1)} u`;
    if (document.getElementById('kpi-biomasa')) document.getElementById('kpi-biomasa').textContent = `${(med.biomasa * 5).toFixed(1)} g (5x)`;
    if (document.getElementById('kpi-hojas')) document.getElementById('kpi-hojas').textContent = med.num_hojas * 5;
    if (document.getElementById('kpi-ramas')) document.getElementById('kpi-ramas').textContent = med.num_ramas * 5;
    if (document.getElementById('kpi-icr')) document.getElementById('kpi-icr').textContent = med.icr.toFixed(4);

    if (document.getElementById('kpi-estres-total')) document.getElementById('kpi-estres-total').textContent = `${med.estres_total}%`;
    if (document.getElementById('kpi-estres-h')) document.getElementById('kpi-estres-h').textContent = `${med.indice_estres_hidrico}%`;
    if (document.getElementById('kpi-estres-t')) document.getElementById('kpi-estres-t').textContent = `${med.indice_estres_termico}%`;

    const barTotal = document.getElementById('bar-estres-total');
    if (barTotal) {
        barTotal.style.width = `${med.estres_total}%`;
        barTotal.style.background = med.estres_total < 25 ? '#4caf50' : (med.estres_total < 50 ? '#ffa726' : '#ef5350');
    }

    const listaSalud = document.getElementById('plantas-salud-lista');
    if (listaSalud) {
        listaSalud.innerHTML = '';
        growthEngine.plantasEstado.forEach(p => {
            const card = document.createElement('div');
            card.className = 'salud-card';
            card.innerHTML = `
                <h5>${p.nombre}</h5>
                <div><strong>Cómo se siente:</strong> <span style="color:#ffee58;">${p.sentimiento}</span></div>
                <div><strong>Turgencia:</strong> ${p.turgencia} | <strong>Vigor:</strong> ${p.vigor}</div>
                <div><strong>Biomasa:</strong> ${p.biomasa}g | <strong>Altura:</strong> ${p.altura}u | <strong>Estrés:</strong> ${p.estres}%</div>
                <div style="font-size:0.67rem; color:var(--text-muted); margin-top:2px;">${p.diagnostico}</div>
            `;
            listaSalud.appendChild(card);
        });
    }

<<<<<<< HEAD
    actualizarPanelDecisiones(dia);
    actualizarResumenTimeline(med);
}

function actualizarResumenTimeline(med) {
    const salud = Number.isFinite(Number(med.salud)) ? Number(med.salud) : 100;
    const estado = estadoDeSalud(salud);
    const clima = med.ambiente || growthEngine.environment;
    const eventos = med.eventos || [];
    const badge = document.getElementById('daily-health-badge');

    document.getElementById('daily-weather-icon').textContent = med.icono_clima || '☀️';
    document.getElementById('daily-weather-name').textContent = `${formatearTiempoCiclo(med.dia)} · ${med.clima || 'Condiciones estables'}`;
    const resumenEvento = document.getElementById('daily-event-summary');
    resumenEvento.textContent = eventos.length
        ? eventos.map(evento => `${evento.icono} ${evento.nombre}`).join(' · ')
        : 'Sin eventos extraordinarios; se registraron las condiciones del cultivo.';
    resumenEvento.title = eventos.map(evento => `${evento.nombre}: ${evento.detalle}`).join(' | ');
    document.getElementById('daily-temp').textContent = Number(clima.temperatura).toFixed(1);
    document.getElementById('daily-water').textContent = Math.round(clima.agua);
    document.getElementById('daily-light').textContent = Math.round(clima.luz);
    document.getElementById('daily-leaves').textContent = med.num_hojas;
    document.getElementById('daily-health-value').textContent = `${Math.round(salud)}%`;
    document.getElementById('daily-health-label').textContent = estado.etiqueta;
    document.getElementById('daily-health-bar').style.width = `${salud}%`;
    document.getElementById('daily-health-bar').style.backgroundColor = salud < 30 ? '#ef5350' : salud < 65 ? '#ffa726' : '#a8f060';
    badge.className = `plant-health-badge ${estado.clase}`.trim();

    actualizarLineaAgronomica();

    const list = document.getElementById('daily-timeline-list');
    list.innerHTML = '';
    const ventanaDias = 31;
    const inicioVentana = Math.max(0, Math.min(growthEngine.dia - 15, maxSimulatedDay - ventanaDias + 1));
    const registrosVisibles = dailyHistory.slice(inicioVentana, inicioVentana + ventanaDias);
    registrosVisibles.forEach(registro => {
        const diaEstado = estadoDeSalud(registro.salud);
        const eventoPrincipal = (registro.eventos || [])[0];
        const extraEventos = Math.max(0, (registro.eventos || []).length - 1);
        const card = document.createElement('button');
        card.type = 'button';
        card.className = `daily-day-card ${registro.dia === growthEngine.dia ? 'is-selected' : ''} ${diaEstado.clase}`.trim();
        card.dataset.day = registro.dia;
        card.setAttribute('aria-current', registro.dia === growthEngine.dia ? 'date' : 'false');
        card.setAttribute('aria-label', `${formatearTiempoCiclo(registro.dia)}: ${registro.clima}, ${Math.round(registro.salud)} por ciento de vigor`);
        card.title = (registro.eventos || []).map(evento => `${evento.nombre}: ${evento.detalle}`).join(' | ');
        card.innerHTML = `
            <span class="daily-day-top"><span>${formatearTiempoCiclo(registro.dia).toUpperCase()}</span><span class="day-health">${Math.round(registro.salud)}%</span></span>
            <strong>${registro.icono_clima} ${registro.clima}</strong>
            <small>${Number(registro.ambiente.temperatura).toFixed(1)}°C · 💧${Math.round(registro.ambiente.agua)}% · 🍃${registro.num_hojas}</small>
            <span class="daily-day-event ${eventoPrincipal ? 'has-event' : ''}">${eventoPrincipal ? `${eventoPrincipal.icono} ${eventoPrincipal.nombre}${extraEventos ? ` +${extraEventos}` : ''}` : '· Sin evento especial'}</span>
        `;
        card.addEventListener('click', () => {
            pausarSimulacion();
            document.getElementById('timeline-slider').value = registro.dia;
            actualizarGrowthTimeline(registro.dia);
        });
        list.appendChild(card);
    });

    const currentCard = list.querySelector('.daily-day-card.is-selected');
    if (currentCard) currentCard.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
}

function formatearTiempoCiclo(dia) {
    const maxDias = growthEngine.maxDias;
    if (maxDias < 365) return `Día ${dia}`;
    if (dia >= maxDias) return `Año ${Math.ceil(maxDias / 365)} · cierre`;
    const anio = Math.floor(dia / 365) + 1;
    return `Año ${anio} · día ${dia % 365}`;
}

function actualizarLineaAgronomica() {
    const maxDias = Math.max(1, growthEngine.maxDias);
    const diaActual = growthEngine.dia;
    const progreso = limitar((diaActual / maxDias) * 100, 0, 100);
    const llenado = document.getElementById('agronomic-track-fill');
    const hitos = document.getElementById('agronomic-milestones');
    const resumen = document.getElementById('agro-cycle-summary');

    llenado.style.width = `${progreso}%`;
    resumen.textContent = `${formatearTiempoCiclo(diaActual)} / ${formatearTiempoCiclo(maxDias)} · ${Math.round(progreso)}%`;
    hitos.innerHTML = '';

    const etapas = [
        { fraccion: 0, etiqueta: 'Inicio', icono: '🌱' },
        { fraccion: 0.22, etiqueta: 'Establecimiento', icono: '🌿' },
        { fraccion: 0.48, etiqueta: 'Crecimiento', icono: '🍃' },
        { fraccion: 0.74, etiqueta: 'Madurez', icono: '🌼' },
        { fraccion: 1, etiqueta: 'Cierre', icono: '🌾' }
    ];

    etapas.forEach((etapa, indice) => {
        const diaHito = Math.round(maxDias * etapa.fraccion);
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = `agro-milestone ${diaActual >= diaHito ? 'is-complete' : ''} ${indice === etapas.findIndex((hito, i) => diaActual >= Math.round(maxDias * hito.fraccion) && (i === etapas.length - 1 || diaActual < Math.round(maxDias * etapas[i + 1].fraccion))) ? 'is-current' : ''}`.trim();
        boton.classList.toggle('at-start', indice === 0);
        boton.classList.toggle('at-end', indice === etapas.length - 1);
        boton.style.left = `${etapa.fraccion * 100}%`;
        boton.title = `${etapa.etiqueta} · ${formatearTiempoCiclo(diaHito)}. Clic para ir a ese punto.`;
        boton.setAttribute('aria-label', `${etapa.etiqueta}, ${formatearTiempoCiclo(diaHito)}`);
        boton.innerHTML = `<span class="agro-milestone-dot">${etapa.icono}</span><span class="agro-milestone-label"><strong>${etapa.etiqueta}</strong><small>${formatearTiempoCiclo(diaHito)}</small></span>`;
        boton.addEventListener('click', () => {
            pausarSimulacion();
            actualizarGrowthTimeline(diaHito);
        });
        hitos.appendChild(boton);
    });

    const eventos = dailyHistory
        .filter(registro => (registro.eventos || []).length > 0)
        .slice(-6);
    eventos.forEach(registro => {
        const evento = registro.eventos[0];
        const marca = document.createElement('button');
        marca.type = 'button';
        marca.className = `agro-event-marker ${registro.dia <= diaActual ? 'is-past' : ''}`;
        marca.style.left = `${(registro.dia / maxDias) * 100}%`;
        marca.textContent = evento.icono;
        marca.title = `${formatearTiempoCiclo(registro.dia)} · ${evento.nombre}: ${evento.detalle}`;
        marca.setAttribute('aria-label', `${evento.nombre} en ${formatearTiempoCiclo(registro.dia)}`);
        marca.addEventListener('click', () => {
            pausarSimulacion();
            actualizarGrowthTimeline(registro.dia);
        });
        hitos.appendChild(marca);
    });
}

function actualizarAspectoPlanta(med) {
    plantHealth = Number.isFinite(Number(med.salud)) ? Number(med.salud) : 100;
    const severidad = (100 - plantHealth) / 100;
    const colorHojaBase = new THREE.Color(especieActual?.color_hoja || '#88d424');
    const colorTalloBase = new THREE.Color(especieActual?.color_tallo || '#365e38');
    const colorFlorBase = new THREE.Color(especieActual?.color_flor || '#fffcf7');
    const amarillo = new THREE.Color(0xd2b842);
    const marron = new THREE.Color(0x76503a);
    const hojasCaidas = med.hojas_perdidas || 0;

    plantInstances.forEach(instancia => {
        instancia.hojas.forEach((hoja, indice) => {
            const tono = colorHojaBase.clone()
                .lerp(amarillo, limitar(severidad * 1.05, 0, 0.82))
                .lerp(marron, limitar((65 - plantHealth) / 65, 0, 0.7));
            hoja.material.color.copy(tono);
            const rangoCaida = (indice * 7) % Math.max(1, instancia.hojas.length);
            hoja.userData.dropped = rangoCaida < hojasCaidas;
            hoja.visible = leavesVisible && !hoja.userData.dropped;
            if (hoja.parent) {
                hoja.parent.rotation.x = 0.14 + severidad * 0.42;
                hoja.parent.rotation.z = ((indice % 3) - 1) * severidad * 0.16;
            }
        });
        instancia.planta.scale.set(1 - severidad * 0.1, 1 - severidad * 0.24, 1 - severidad * 0.1);
    });

    matTallo.color.copy(colorTalloBase).lerp(marron, limitar(severidad * 0.7, 0, 0.58));
    matPetalo.color.copy(colorFlorBase).lerp(marron, limitar((55 - plantHealth) / 70, 0, 0.48));
}

function actualizarClimaEscenario(med, ambienteBase) {
    const factorLuz = limitar(med.ambiente.luz / Math.max(1, ambienteBase.luz), 0.38, 1.22);
    directionalLight.intensity = manualLightSetting * 1.25 * factorLuz;
    ambientLight.intensity = manualLightSetting * 0.45 * (0.82 + factorLuz * 0.18);

    const cielos = {
        soleado: new THREE.Color(0x7bc6eb),
        nublado: new THREE.Color(0x8295a0),
        lluvia: new THREE.Color(0x526d82),
        calor: new THREE.Color(0xe8a36c)
    };
    const cielo = cielos[med.tipo_clima] || cielos.soleado;
    scene.background = cielo;
    if (scene.fog) scene.fog.color.copy(cielo);
    particleMat.opacity = med.tipo_clima === 'lluvia' ? 0.18 : med.tipo_clima === 'nublado' ? 0.28 : 0.45;
=======
    if (liveChart) {
        liveChart.data.labels = growthEngine.mediciones.map(m => `D${m.dia}`);
        liveChart.data.datasets[0].data = growthEngine.mediciones.map(m => (m.biomasa * 5).toFixed(1));
        liveChart.update('none');
    }
>>>>>>> b1f99aa4c9685476098dc3daae5e6d0452556a41
}

function initCharts() {
<<<<<<< HEAD
    const ctxLive = document.getElementById('chart-crecimiento-live').getContext('2d');
    liveChart = new Chart(ctxLive, {
        type: 'line',
        data: {
            labels: [0],
            datasets: [
                {
                    label: 'Biomasa (g)',
                    data: [0],
                    borderColor: '#a8f060',
                    backgroundColor: 'rgba(168, 240, 96, 0.15)',
                    yAxisID: 'yBio',
                    tension: 0.35,
                    fill: true
                },
                {
                    label: 'Altura (u)',
                    data: [0],
                    borderColor: '#ffee58',
                    yAxisID: 'yAlt',
                    tension: 0.35
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: {
                x: { ticks: { color: '#8ca890', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.06)' } },
                yBio: {
                    type: 'linear', position: 'left',
                    ticks: { color: '#a8f060', font: { size: 9 } },
                    grid: { color: 'rgba(255,255,255,0.06)' },
                    title: { display: true, text: 'Biomasa (g)', color: '#a8f060', font: { size: 9 } }
                },
                yAlt: {
                    type: 'linear', position: 'right',
                    ticks: { color: '#ffee58', font: { size: 9 } },
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: 'Altura (u)', color: '#ffee58', font: { size: 9 } }
                }
            },
            plugins: {
                legend: { labels: { color: '#eef5ee', font: { size: 9 } } }
            }
        }
    });

    const ctxAb = document.getElementById('chart-ab-comparison').getContext('2d');
    abChart = new Chart(ctxAb, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Escenario A (Testigo)',
                    data: [],
                    borderColor: '#a8f060',
                    backgroundColor: 'rgba(168, 240, 96, 0.1)',
                    tension: 0.35
                },
                {
                    label: 'Escenario B (Tratamiento)',
                    data: [],
                    borderColor: '#29b6f6',
                    backgroundColor: 'rgba(41, 182, 246, 0.1)',
                    tension: 0.35
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { color: '#8ca890', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.06)' } },
                y: { ticks: { color: '#a8f060', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.06)' } }
            },
            plugins: {
                legend: { labels: { color: '#eef5ee', font: { size: 9 } } }
            }
        }
    });
}

function updateLiveChart() {
    if (!liveChart) return;
    const visibles = growthEngine.mediciones.filter(m => m.dia <= growthEngine.dia);
    const labels = visibles.map(m => `D${m.dia}`);
    const dataBio = visibles.map(m => m.biomasa);
    const dataAlt = visibles.map(m => m.altura);

    liveChart.data.labels = labels;
    liveChart.data.datasets[0].data = dataBio;
    liveChart.data.datasets[1].data = dataAlt;
    liveChart.update('none');
}

// ============================================================
// 8. ESCENARIO COMPARATIVO A/B
// ============================================================
function ejecutarComparacionAB() {
    const idA = parseInt(document.getElementById('sel-ab-specie-a').value);
    const idB = parseInt(document.getElementById('sel-ab-specie-b').value);

    const espA = especiesCatalogo.find(e => e.id == idA) || especiesCatalogo[0];
    const espB = especiesCatalogo.find(e => e.id == idB) || especiesCatalogo[1] || especiesCatalogo[0];

    const modA = document.getElementById('sel-ab-modelo-a').value;
    const modB = document.getElementById('sel-ab-modelo-b').value;

    const aguaA = parseFloat(document.getElementById('ab-slider-agua-a').value);
    const tempA = parseFloat(document.getElementById('ab-slider-temp-a').value);

    const aguaB = parseFloat(document.getElementById('ab-slider-agua-b').value);
    const tempB = parseFloat(document.getElementById('ab-slider-temp-b').value);

    const engA = new GrowthEngine();
    engA.setEspecie(espA);
    engA.setModel(modA);
    engA.setEnvironment({ agua: aguaA, temperatura: tempA, luz: 800, nutrientes: 70, co2: 400 });
    const medsA = engA.simularCompleto(60);

    const engB = new GrowthEngine();
    engB.setEspecie(espB);
    engB.setModel(modB);
    engB.setEnvironment({ agua: aguaB, temperatura: tempB, luz: 800, nutrientes: 70, co2: 400 });
    const medsB = engB.simularCompleto(60);

    const labels = medsA.map(m => `D${m.dia}`);
    abChart.data.labels = labels;
    abChart.data.datasets[0].label = `${espA.nombre_comun} (${modA}, Riego ${aguaA}%, ${tempA}°C)`;
    abChart.data.datasets[0].data = medsA.map(m => m.biomasa);
    abChart.data.datasets[1].label = `${espB.nombre_comun} (${modB}, Riego ${aguaB}%, ${tempB}°C)`;
    abChart.data.datasets[1].data = medsB.map(m => m.biomasa);
    abChart.update();

    const bioFinalA = medsA[medsA.length - 1].biomasa;
    const bioFinalB = medsB[medsB.length - 1].biomasa;
    const estresA = engA.calcularEstresTotal();
    const estresB = engB.calcularEstresTotal();

    const card = document.getElementById('ab-veredicto-card');
    const txt = document.getElementById('ab-veredicto-texto');
    card.style.display = 'block';

    const diffBio = Math.abs(bioFinalA - bioFinalB).toFixed(1);
    const mejorEscenario = bioFinalA >= bioFinalB ? 'Escenario A' : 'Escenario B';
    const especieGanadora = bioFinalA >= bioFinalB ? espA.nombre_comun : espB.nombre_comun;

    txt.innerHTML = `
        <strong>Dictamen Agronómico:</strong> Se recomienda aplicar el <strong>${mejorEscenario}</strong> (${especieGanadora}), el cual produce <strong>+${diffBio} g de biomasa</strong> (+${((diffBio / Math.max(1, Math.min(bioFinalA, bioFinalB))) * 100).toFixed(1)}%).<br>
        <span style="color:#a8f060;">• Tratamiento A: ${bioFinalA} g biomasa | Estrés: ${estresA}%</span><br>
        <span style="color:#29b6f6;">• Tratamiento B: ${bioFinalB} g biomasa | Estrés: ${estresB}%</span>
    `;
}

// ============================================================
// 9. PERSISTENCIA EN MYSQL
// ============================================================
async function guardarSimulacionMySQL() {
    const statusMsg = document.getElementById('save-status-msg');
    statusMsg.innerHTML = '<div class="loading-indicator">Persistiendo en MySQL...</div>';

    const nombre = document.getElementById('input-sim-nombre').value.trim() || 'Simulación';
    const notas = document.getElementById('input-sim-notas').value.trim();
    const diaActual = growthEngine.dia;

    if (diaActual === 0) {
        statusMsg.innerHTML = '<div class="status-msg status-error">Avanza al menos 1 día de cultivo antes de guardar.</div>';
        return;
    }

    const medActual = dailyHistory[diaActual] || growthEngine.generarMedicion(diaActual);
    const ambienteBase = leerAmbienteBaseDesdeUI();
    const payload = {
        nombre,
        especie_id: especieActual ? especieActual.id : 5,
        modelo: growthEngine.model,
        temperatura: ambienteBase.temperatura,
        luz: ambienteBase.luz,
        agua: ambienteBase.agua,
        nutrientes: ambienteBase.nutrientes,
        co2: ambienteBase.co2,
        param_r: growthEngine.params.r,
        param_k: growthEngine.params.K,
        dias_simulados: diaActual,
        estado: diaActual >= growthEngine.maxDias ? 'completada' : 'en_curso',
        notas,
        biomasa_final: medActual.biomasa,
        altura_final: medActual.altura,
        hojas_total: medActual.num_hojas,
        ramas_total: medActual.num_ramas,
        estres_promedio: medActual.estres_total
    };

    try {
        const res = await window.API.crearSimulacion(payload);
        const simId = res.id;

        const medicionesHastaHoy = growthEngine.mediciones.filter(m => m.dia <= diaActual);
        if (medicionesHastaHoy.length > 0) {
            const batch = medicionesHastaHoy.map(m => ({
                simulacion_id: simId,
                ...m
            }));
            await window.API.guardarMedicionesBatch(batch);
        }

        const decs = growthEngine.generarDecisiones(diaActual);
        for (const d of decs) {
            await window.API.guardarDecision({
                simulacion_id: simId,
                dia: diaActual,
                tipo: d.tipo,
                prioridad: d.prioridad,
                mensaje: d.mensaje,
                valor_actual: d.valor_actual,
                valor_sugerido: d.valor_sugerido
            });
        }

        statusMsg.innerHTML = `<div class="status-msg status-success">✓ Simulación #${simId} persistida en MySQL con mediciones por tick.</div>`;
        cargarHistorialSimulaciones();
        cargarReportesBio();
    } catch (err) {
        statusMsg.innerHTML = `<div class="status-msg status-error">Error al persistir: ${err.message}.</div>`;
=======
    const ctxLive = document.getElementById('chart-crecimiento-live')?.getContext('2d');
    if (ctxLive) {
        liveChart = new Chart(ctxLive, {
            type: 'line',
            data: { labels: [0], datasets: [{ label: 'Biomasa Total 5 Plantas (g)', data: [0], borderColor: '#a8f060', backgroundColor: 'rgba(168,240,96,0.15)', fill: true, tension: 0.35 }] },
            options: { responsive: true, maintainAspectRatio: false, animation: false }
        });
    }

    const ctxAb = document.getElementById('chart-ab-comparison')?.getContext('2d');
    if (ctxAb) {
        abChart = new Chart(ctxAb, {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Escenario A', data: [], borderColor: '#a8f060' }, { label: 'Escenario B', data: [], borderColor: '#29b6f6' }] },
            options: { responsive: true, maintainAspectRatio: false }
        });
>>>>>>> b1f99aa4c9685476098dc3daae5e6d0452556a41
    }
}

function ejecutarTestAB() {
    if (!growthEngine) return;

    const espA = especiesCatalogo.find(e => e.id == document.getElementById('sel-ab-specie-a')?.value) || especiesCatalogo[0];
    const espB = especiesCatalogo.find(e => e.id == document.getElementById('sel-ab-specie-b')?.value) || especiesCatalogo[1] || especiesCatalogo[0];

    const dataA = [], dataB = [], labels = [];
    for (let d = 0; d <= 90; d += 3) {
        labels.push(`D${d}`);
        const bioA = growthEngine.calcularBiomasaDia(d, 'logistico', { r: espA.tasa_r, K: espA.capacidad_k });
        const bioB = growthEngine.calcularBiomasaDia(d, 'gompertz', { r: espB.tasa_r, K: espB.capacidad_k });
        dataA.push((bioA * 5).toFixed(1));
        dataB.push((bioB * 5).toFixed(1));
    }

    if (abChart) {
        abChart.data.labels = labels;
        abChart.data.datasets[0].label = `A: ${espA.nombre_comun}`;
        abChart.data.datasets[0].data = dataA;
        abChart.data.datasets[1].label = `B: ${espB.nombre_comun}`;
        abChart.data.datasets[1].data = dataB;
        abChart.update();
    }
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON' || event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA') return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects, false);

    if (intersects.length > 0) {
        const data = intersects[0].object.userData;
        const plantIdx = data.plantIndex || 1;
        const estadoPlanta = typeof plantIdx === 'number' && growthEngine ? (growthEngine.plantasEstado[plantIdx - 1] || {}) : {};

        const panel = document.getElementById('info-panel');
        if (panel) {
            panel.classList.remove('hidden');
            document.getElementById('info-name').textContent = `${data.name} ${typeof plantIdx === 'number' ? `(Planta #\${plantIdx})` : ''}`;
            document.getElementById('info-especie').textContent = especieActual ? especieActual.nombre_comun : 'Plumeria Rubra';
            document.getElementById('info-type').textContent = data.type;
            document.getElementById('info-height').textContent = data.height || `${estadoPlanta.altura || 0} u`;
            document.getElementById('info-growth').textContent = `Día ${growthEngine ? growthEngine.dia : 0}`;
            document.getElementById('info-estres').textContent = `${estadoPlanta.estres || 0}%`;
            document.getElementById('info-biomasa').textContent = `${estadoPlanta.biomasa || 0} g`;
            document.getElementById('info-sentimiento').textContent = estadoPlanta.sentimiento || 'Óptimo';
            document.getElementById('info-desc').textContent = data.desc || 'Órgano vegetal.';
        }
    }
});

function exportarCSV() {
    if (!growthEngine) return;

    let csv = "Dia,Biomasa_Total,Altura,Hojas,Ramas,Estres_Total,ICR\n";
    growthEngine.mediciones.forEach(m => {
        csv += `${m.dia},${(m.biomasa * 5).toFixed(2)},${m.altura},${m.num_hojas * 5},${m.num_ramas * 5},${m.estres_total},${m.icr}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_cultivo_dia_${growthEngine.dia}.csv`;
    a.click();
}

async function cargarHistorialSimulaciones() {
    const list = document.getElementById('historial-lista');
    if (!list) return;

    try {
        const sims = await window.API.getSimulaciones();
        if (!sims || sims.length === 0) {
            list.innerHTML = '<p style="font-size:0.72rem; color:var(--text-muted);">Sin datos en MySQL.</p>';
            return;
        }

        list.innerHTML = '';
        sims.forEach(s => {
            const item = document.createElement('div');
            item.className = 'sim-list-item';
            item.innerHTML = `
                <div style="display:flex; justify-content:space-between;">
                    <span class="sim-name">#${s.id} ${s.nombre}</span>
                    <span class="sim-badge badge-${s.estado}">${s.estado}</span>
                </div>
                <div class="sim-meta">
                    Especie: <strong>${s.especie_nombre}</strong> | Biomasa: <strong>${s.biomasa_final}g</strong>
                </div>
            `;
            item.addEventListener('click', () => actualizarGrowthTimeline(parseInt(s.dias_simulados)));
            list.appendChild(item);
        });
    } catch (e) {
        list.innerHTML = '<p style="font-size:0.72rem; color:var(--text-muted);">Sin conexión MySQL local.</p>';
    }
}

<<<<<<< HEAD
async function reproducirSimulacionHistorica(id) {
    try {
        const sim = await window.API.getSimulacion(id);
        const meds = await window.API.getMediciones(id);
        if (!sim) return;

        const esp = especiesCatalogo.find(e => e.id == sim.especie_id) || {
            id: sim.especie_id,
            nombre_comun: sim.especie_nombre,
            tasa_r: sim.param_r,
            capacidad_k: sim.param_k
        };
        seleccionarEspecie(esp);

        document.getElementById('sel-modelo').value = sim.modelo;
        document.getElementById('slider-temp').value = sim.temperatura;
        document.getElementById('slider-agua').value = sim.agua;
        document.getElementById('slider-luz').value = sim.luz;
        document.getElementById('slider-nutrientes').value = sim.nutrientes;
        document.getElementById('slider-co2').value = sim.co2;

        actualizarParametrosDesdeUI();

        if (meds && meds.length > 0) {
            growthEngine.mediciones = meds.map(m => ({
                dia: parseInt(m.dia),
                altura: parseFloat(m.altura),
                biomasa: parseFloat(m.biomasa),
                num_hojas: parseInt(m.num_hojas),
                num_ramas: parseInt(m.num_ramas),
                indice_estres_hidrico: parseFloat(m.indice_estres_hidrico),
                indice_estres_termico: parseFloat(m.indice_estres_termico),
                indice_estres_luminico: parseFloat(m.indice_estres_luminico),
                indice_estres_nutricional: parseFloat(m.indice_estres_nutricional),
                estres_total: parseFloat(m.estres_total),
                icr: parseFloat(m.icr),
                prediccion_cosecha_dias: parseInt(m.prediccion_cosecha_dias)
            }));
            const maxDia = meds[meds.length - 1].dia;
            maxSimulatedDay = 0;
            actualizarGrowthTimeline(maxDia);
        }

        document.querySelector('[data-tab="tab-kpi"]').click();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

// ============================================================
// 10. REPORTES BIOINFORMÁTICOS
// ============================================================
=======
>>>>>>> b1f99aa4c9685476098dc3daae5e6d0452556a41
async function cargarReportesBio() {
    try {
        const reportes = await window.API.getReportesBio();
        const tbTop = document.querySelector('#tabla-top-biomasa tbody');
        if (tbTop && reportes.top_biomasa) {
            tbTop.innerHTML = '';
            reportes.top_biomasa.forEach(r => {
                tbTop.innerHTML += `<tr><td>${r.nombre}</td><td>${r.especie}</td><td>${r.modelo}</td><td><strong>${r.biomasa_final} g</strong></td><td>${r.altura_final} u</td></tr>`;
            });
        }
    } catch (e) {}
}

function setupEventListeners() {
    document.getElementById('timeline-slider')?.addEventListener('input', (e) => actualizarGrowthTimeline(parseInt(e.target.value)));
    document.getElementById('growth-speed-slider')?.addEventListener('input', (e) => simulationSpeed = parseFloat(e.target.value));
    document.getElementById('light-slider')?.addEventListener('input', (e) => dirLight.intensity = parseFloat(e.target.value));

<<<<<<< HEAD
    const headers = ['dia', 'clima', 'temperatura_C', 'humedad_sustrato_pct', 'radiacion', 'evento', 'vigor_pct', 'hojas_perdidas', 'altura_u', 'biomasa_g', 'num_hojas', 'num_ramas', 'estres_hidrico', 'estres_termico', 'estres_luminico', 'estres_nutricional', 'estres_total', 'icr', 'dias_cosecha'];
    const medicionesHastaHoy = growthEngine.mediciones.filter(m => m.dia <= growthEngine.dia);
    const rows = medicionesHastaHoy.map(m => [
        m.dia, m.clima, m.ambiente?.temperatura?.toFixed(1), m.ambiente?.agua, m.ambiente?.luz,
        (m.eventos || []).map(evento => evento.nombre).join(' | '), m.salud, m.hojas_perdidas,
        m.altura, m.biomasa, m.num_hojas, m.num_ramas,
        m.indice_estres_hidrico, m.indice_estres_termico, m.indice_estres_luminico, m.indice_estres_nutricional,
        m.estres_total, m.icr, m.prediccion_cosecha_dias
    ]);
    const escaparCSV = valor => `"${String(valor ?? '').replace(/"/g, '""')}"`;
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map(fila => fila.map(escaparCSV).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `simulacion_${especieActual ? especieActual.nombre_comun : 'planta'}_dia${growthEngine.dia}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
=======
    document.getElementById('btn-toggle-play')?.addEventListener('click', () => {
        isSimRunning = !isSimRunning;
        const btn = document.getElementById('btn-toggle-play');
        if (isSimRunning) {
            btn.textContent = '⏸ Pausar';
            simTimer = setInterval(() => {
                if (!growthEngine) return;
                let nextDia = growthEngine.dia + 1;
                if (nextDia > growthEngine.maxDias) {
                    clearInterval(simTimer);
                    isSimRunning = false;
                    btn.textContent = '▶ Play 3D';
                    return;
                }
                actualizarGrowthTimeline(nextDia);
            }, Math.max(50, 300 / simulationSpeed));
        } else {
            btn.textContent = '▶ Play 3D';
            clearInterval(simTimer);
        }
    });

    document.getElementById('btn-anim')?.addEventListener('click', () => {
        isWindy = !isWindy;
        document.getElementById('btn-anim').textContent = isWindy ? '🍃 Viento: ON' : '🍃 Viento: OFF';
    });

    document.getElementById('btn-toggle-hojas')?.addEventListener('click', () => {
        showFoliage = !showFoliage;
        arrayHojas.forEach(h => h.visible = showFoliage);
    });

    document.getElementById('btn-color-hojas')?.addEventListener('click', () => {
        const tonos = [0x88d424, 0x4caf50, 0x2e7d32, 0xa3e043, 0xd4e157];
        const randomColor = tonos[Math.floor(Math.random() * tonos.length)];
        arrayHojas.forEach(h => h.material.color.setHex(randomColor));
    });

    document.getElementById('btn-reset')?.addEventListener('click', () => {
        camera.position.set(0, 6.5, 15);
        controls.target.set(0, 2.0, 0);
    });

    document.getElementById('btn-jardin')?.addEventListener('click', () => {
        jardinVisible = !jardinVisible;
        jardinGroup.visible = jardinVisible;
        document.getElementById('btn-jardin').textContent = jardinVisible ? '🌳 Jardín Botánico: ON' : '🌳 Jardín Botánico: OFF';
    });

    document.getElementById('btn-cam-jardin')?.addEventListener('click', () => {
        camera.position.set(0, 14, 28);
        controls.target.set(0, 2, -5);
        controls.update();
    });

    document.getElementById('btn-export-csv')?.addEventListener('click', exportarCSV);
    document.getElementById('btn-ejecutar-ab')?.addEventListener('click', ejecutarTestAB);
    document.getElementById('btn-imprimir-reporte')?.addEventListener('click', () => window.print());

    document.getElementById('sel-especie')?.addEventListener('change', (e) => {
        const esp = especiesCatalogo.find(item => item.id == e.target.value);
        if (esp) seleccionarEspecie(esp);
    });

    document.getElementById('sel-modelo')?.addEventListener('change', () => actualizarParametrosDesdeUI());
    document.getElementById('slider-temp')?.addEventListener('input', () => actualizarParametrosDesdeUI());
    document.getElementById('slider-agua')?.addEventListener('input', () => actualizarParametrosDesdeUI());
    document.getElementById('slider-luz')?.addEventListener('input', () => actualizarParametrosDesdeUI());
    document.getElementById('slider-nutrientes')?.addEventListener('input', () => actualizarParametrosDesdeUI());

    document.getElementById('btn-guardar-mysql')?.addEventListener('click', async () => {
        if (!growthEngine) return;
        const statusMsg = document.getElementById('save-status-msg');
        if (statusMsg) statusMsg.innerHTML = '<div class="loading-indicator">Guardando...</div>';
        try {
            const med = growthEngine.generarMedicion(growthEngine.dia);
            const payload = {
                nombre: document.getElementById('input-sim-nombre')?.value || 'Ensayo 5 Plantas',
                especie_id: especieActual ? especieActual.id : 1,
                modelo: growthEngine.model,
                temperatura: growthEngine.environment.temperatura,
                luz: growthEngine.environment.luz,
                agua: growthEngine.environment.agua,
                nutrientes: growthEngine.environment.nutrientes,
                co2: growthEngine.environment.co2,
                param_r: growthEngine.params.r,
                param_k: growthEngine.params.K,
                dias_simulados: growthEngine.dia,
                estado: growthEngine.dia >= growthEngine.maxDias ? 'completada' : 'en_curso',
                notas: document.getElementById('input-sim-notas')?.value || '',
                biomasa_final: med.biomasa * 5,
                altura_final: med.altura,
                hojas_total: med.num_hojas * 5,
                ramas_total: med.num_ramas * 5,
                estres_promedio: med.estres_total
            };
            await window.API.crearSimulacion(payload);
            if (statusMsg) statusMsg.innerHTML = '<div class="status-msg status-success">✓ Guardado en MySQL.</div>';
            cargarHistorialSimulaciones();
        } catch (e) {
            if (statusMsg) statusMsg.innerHTML = `<div class="status-msg status-error">${e.message}</div>`;
        }
    });
}

function setupTabNavigation() {
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.tab-panel').forEach(c => c.classList.remove('active'));
            document.getElementById(tab.dataset.tab)?.classList.add('active');
        });
    });
>>>>>>> b1f99aa4c9685476098dc3daae5e6d0452556a41
}

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    if (isWindy) {
<<<<<<< HEAD
        plantInstances.forEach(instancia => {
            instancia.planta.rotation.z = Math.sin(elapsedTime * 1.6) * 0.035;
            instancia.planta.rotation.x = Math.cos(elapsedTime * 1.3) * 0.025;
            instancia.tallo.rotation.y = Math.sin(elapsedTime * 0.5) * 0.04;
=======
        plantasGroupArray.forEach((pGroup, idx) => {
            pGroup.rotation.z = Math.sin(elapsedTime * 1.4 + idx) * 0.02;
            pGroup.rotation.x = Math.cos(elapsedTime * 1.1 + idx) * 0.015;
>>>>>>> b1f99aa4c9685476098dc3daae5e6d0452556a41
        });
    }

    controls.update();
    renderer.render(scene, camera);
}

<<<<<<< HEAD
// ============================================================
// 12. RAYCASTING INTERACTIVO
// ============================================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const infoPanel = document.getElementById('info-panel');
const infoName = document.getElementById('info-name');
const infoEspecie = document.getElementById('info-especie');
const infoType = document.getElementById('info-type');
const infoHeight = document.getElementById('info-height');
const infoDesc = document.getElementById('info-desc');
const infoGrowth = document.getElementById('info-growth');
const infoEstres = document.getElementById('info-estres');
const infoBiomasa = document.getElementById('info-biomasa');

let objetoSeleccionado = null;
let objetoResaltado = null;

function actualizarPanelRaycasting() {
    if (objetoSeleccionado) {
        const data = objetoSeleccionado.userData;
        const dia = growthEngine.dia;
        const med = dailyHistory[dia] || growthEngine.generarMedicion(dia);

        infoName.textContent = data.name;
        infoEspecie.textContent = especieActual ? `${especieActual.nombre_comun} (${especieActual.nombre_cientifico})` : 'Plumeria Rubra';
        infoType.textContent = data.type;
        infoHeight.textContent = data.height;
        infoDesc.textContent = data.desc;
        infoGrowth.textContent = `${data.growthPercent !== undefined ? data.growthPercent : 100}%`;
        infoEstres.textContent = `${med.estres_total}%`;
        const bioParte = ((data.biomasaPct || 5) / 100 * med.biomasa).toFixed(1);
        infoBiomasa.textContent = `${bioParte} g (${data.biomasaPct || 5}% de biomasa)`;
    }
}

window.addEventListener('click', (event) => {
    if (event.target.closest('#sidebar') || event.target.closest('#viewport-controls') || event.target.closest('#daily-timeline-panel')) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects, false);

    if (intersects.length > 0) {
        objetoSeleccionado = intersects[0].object;
        actualizarPanelRaycasting();
        infoPanel.classList.remove('hidden');
    } else {
        objetoSeleccionado = null;
        infoPanel.classList.add('hidden');
    }
});

window.addEventListener('mousemove', (event) => {
    if (event.target.closest('#sidebar') || event.target.closest('#viewport-controls') || event.target.closest('#daily-timeline-panel')) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects, false);

    if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (objetoResaltado !== obj) {
            if (objetoResaltado && objetoResaltado.material.emissive) objetoResaltado.material.emissive.setHex(0x000000);
            objetoResaltado = obj;
            if (objetoResaltado.material.emissive) objetoResaltado.material.emissive.setHex(0x384a30);
            document.body.style.cursor = 'pointer';
        }
    } else {
        if (objetoResaltado) {
            if (objetoResaltado.material.emissive) objetoResaltado.material.emissive.setHex(0x000000);
            objetoResaltado = null;
            document.body.style.cursor = 'default';
        }
    }
});

// ============================================================
// 13. NAVEGACIÓN Y CONTROLADORES DE EVENTOS
// ============================================================
function setupTabNavigation() {
    const tabs = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const target = tab.getAttribute('data-tab');
            document.getElementById(target).classList.add('active');

            if (target === 'tab-reportes') cargarReportesBio();
            if (target === 'tab-historial') cargarHistorialSimulaciones();
        });
    });
}

function setupEventListeners() {
    document.getElementById('sel-especie').addEventListener('change', (e) => {
        const esp = especiesCatalogo.find(x => x.id == e.target.value);
        if (esp) seleccionarEspecie(esp);
    });

    document.getElementById('sel-modelo').addEventListener('change', actualizarParametrosDesdeUI);
    document.getElementById('input-r').addEventListener('input', actualizarParametrosDesdeUI);
    document.getElementById('input-k').addEventListener('input', actualizarParametrosDesdeUI);

    const bindSlider = (id, valId) => {
        const slider = document.getElementById(id);
        const display = document.getElementById(valId);
        slider.addEventListener('input', (e) => {
            display.textContent = e.target.value;
            actualizarParametrosDesdeUI();
        });
    };
    bindSlider('slider-temp', 'val-temp');
    bindSlider('slider-agua', 'val-agua');
    bindSlider('slider-luz', 'val-luz');
    bindSlider('slider-nutrientes', 'val-nutrientes');
    bindSlider('slider-co2', 'val-co2');

    document.getElementById('btn-sim-play').addEventListener('click', toggleSimulacionLoop);
    document.getElementById('btn-sim-pause').addEventListener('click', pausarSimulacion);
    document.getElementById('btn-sim-step').addEventListener('click', avanzarUnDia);
    document.getElementById('btn-sim-fast').addEventListener('click', simularCicloCompleto);
    document.getElementById('btn-sim-reset').addEventListener('click', resetearSimulacion);

    document.getElementById('btn-guardar-mysql').addEventListener('click', guardarSimulacionMySQL);
    document.getElementById('btn-refrescar-historial').addEventListener('click', cargarHistorialSimulaciones);
    document.getElementById('btn-export-csv').addEventListener('click', exportarCSV);
    document.getElementById('btn-recheck-api').addEventListener('click', checkApiAndLoadSpecies);
    document.getElementById('btn-imprimir-reporte').addEventListener('click', () => window.print());

    document.getElementById('btn-ejecutar-ab').addEventListener('click', ejecutarComparacionAB);
    document.getElementById('ab-slider-agua-a').addEventListener('input', (e) => document.getElementById('ab-val-agua-a').textContent = `${e.target.value}%`);
    document.getElementById('ab-slider-temp-a').addEventListener('input', (e) => document.getElementById('ab-val-temp-a').textContent = `${e.target.value}°C`);
    document.getElementById('ab-slider-agua-b').addEventListener('input', (e) => document.getElementById('ab-val-agua-b').textContent = `${e.target.value}%`);
    document.getElementById('ab-slider-temp-b').addEventListener('input', (e) => document.getElementById('ab-val-temp-b').textContent = `${e.target.value}°C`);

    // Scrubber interactivo de línea de tiempo
    const timelineSlider = document.getElementById('timeline-slider');
    timelineSlider.addEventListener('input', (e) => {
        pausarSimulacion();
        actualizarGrowthTimeline(parseInt(e.target.value));
    });

    document.getElementById('btn-toggle-play').addEventListener('click', toggleSimulacionLoop);
    document.getElementById('btn-restart-growth').addEventListener('click', resetearSimulacion);
    document.getElementById('btn-anim').addEventListener('click', (e) => {
        isWindy = !isWindy;
        e.target.textContent = isWindy ? '🍃 Viento: ON' : '🍃 Viento: OFF';
    });
    document.getElementById('btn-color-hojas').addEventListener('click', () => {
        const rnd = Math.random() * 0xffffff;
        plantInstances.forEach(instancia => instancia.hojas.forEach(hoja => hoja.material.color.setHex(rnd)));
    });
    document.getElementById('btn-toggle-hojas').addEventListener('click', () => {
        leavesVisible = !leavesVisible;
        plantInstances.forEach(instancia => instancia.hojas.forEach(hoja => hoja.visible = leavesVisible && !hoja.userData.dropped));
        document.getElementById('btn-toggle-hojas').textContent = leavesVisible ? '👁️ Follaje' : '🚫 Follaje';
    });
    document.getElementById('btn-reset').addEventListener('click', () => {
        camera.position.set(0, 5.1, 14);
        controls.target.set(0, 2.1, 0);
        controls.update();
    });
    document.getElementById('growth-speed-slider').addEventListener('input', (e) => {
        growthSpeed = parseFloat(e.target.value);
    });
    document.getElementById('light-slider').addEventListener('input', (e) => {
        manualLightSetting = parseFloat(e.target.value);
        const med = dailyHistory[growthEngine.dia];
        if (med) actualizarClimaEscenario(med, leerAmbienteBaseDesdeUI());
    });
}

function actualizarGrowthTimeline(dia) {
    const diaSeleccionado = limitar(Number.parseInt(dia, 10) || 0, 0, growthEngine.maxDias);
    maxSimulatedDay = limitar(Math.max(maxSimulatedDay, diaSeleccionado), 0, growthEngine.maxDias);
    const ambienteBase = leerAmbienteBaseDesdeUI();
    reconstruirHistorialDiario(maxSimulatedDay, ambienteBase);

    const registroActual = dailyHistory[diaSeleccionado] || dailyHistory[0];
    growthEngine.dia = diaSeleccionado;
    growthEngine.setEnvironment(registroActual.ambiente);
    plantHealth = registroActual.salud;
    normalizedGrowth = Math.min(1.35, (growthEngine.calcularCrecimiento(diaSeleccionado) / growthEngine.params.K) * 1.35);

    const timelineSlider = document.getElementById('timeline-slider');
    timelineSlider.max = growthEngine.maxDias;
    timelineSlider.value = diaSeleccionado;
    document.getElementById('timeline-day-val').textContent = diaSeleccionado;

    actualizarAspectoPlanta(registroActual);
    actualizarClimaEscenario(registroActual, ambienteBase);
    actualizarDashboardKPIs();
    updateLiveChart();
}
window.actualizarGrowthTimeline = actualizarGrowthTimeline;

function avanzarUnDia() {
    if (growthEngine.dia >= growthEngine.maxDias) return;
    actualizarGrowthTimeline(growthEngine.dia + 1);
}

function toggleSimulacionLoop() {
    if (isSimRunning) {
        pausarSimulacion();
    } else {
        isSimRunning = true;
        document.getElementById('btn-sim-play').textContent = '⏸ Pausar';
        document.getElementById('btn-toggle-play').textContent = '⏸ Pausa';
        simIntervalId = setInterval(() => {
            if (growthEngine.dia >= growthEngine.maxDias) {
                pausarSimulacion();
            } else {
                avanzarUnDia();
            }
        }, Math.max(40, 320 / growthSpeed));
    }
}

function pausarSimulacion() {
    isSimRunning = false;
    clearInterval(simIntervalId);
    document.getElementById('btn-sim-play').textContent = '▶ Iniciar Simulación';
    document.getElementById('btn-toggle-play').textContent = '▶ Play/Pausa';
}

function simularCicloCompleto() {
    pausarSimulacion();
    actualizarGrowthTimeline(growthEngine.maxDias);
}

function resetearSimulacion() {
    pausarSimulacion();
    maxSimulatedDay = 0;
    actualizarGrowthTimeline(0);
}

window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

=======
// Iniciar aplicación
>>>>>>> b1f99aa4c9685476098dc3daae5e6d0452556a41
initApp();
animate();