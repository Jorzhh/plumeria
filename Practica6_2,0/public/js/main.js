import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ============================================================
// 1. CONFIGURACIÓN DE ESCENA THREE.JS (PRÁCTICA 04 EXTENDIDA)
// ============================================================
const container = document.getElementById('viewport-container');
const scene = new THREE.Scene();
const skyColor = new THREE.Color(0x7bc6eb);
scene.background = skyColor;
scene.fog = new THREE.FogExp2(0x7bc6eb, 0.022);

const camera = new THREE.PerspectiveCamera(52, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 5.1, 14);

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 2.1, 0);
controls.maxPolarAngle = Math.PI / 2 - 0.02; // No traspasar suelo

// ============================================================
// 2. ILUMINACIÓN & ENTORNO BOTÁNICO MEJORADO
// ============================================================
// Luz hemisférica natural (cielo azul / rebote verde en suelo)
const hemiLight = new THREE.HemisphereLight(0xb1e1ff, 0x385530, 0.65);
scene.add(hemiLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xfff8e7, 1.35);
directionalLight.position.set(7, 14, 7);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.bias = -0.0005;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 35;
directionalLight.shadow.camera.left = -8;
directionalLight.shadow.camera.right = 8;
directionalLight.shadow.camera.top = 8;
directionalLight.shadow.camera.bottom = -8;
scene.add(directionalLight);

// Suelo del Jardín Botánico
const pisoGeo = new THREE.PlaneGeometry(70, 70);
const pisoMat = new THREE.MeshStandardMaterial({ color: 0x2e5c3c, roughness: 0.85 });
const piso = new THREE.Mesh(pisoGeo, pisoMat);
piso.rotation.x = -Math.PI / 2;
piso.receiveShadow = true;
scene.add(piso);

// Camino de Adoquín / Piedra
const caminoGeo = new THREE.PlaneGeometry(4.5, 70);
const caminoMat = new THREE.MeshStandardMaterial({ color: 0x828882, roughness: 0.95 });
const camino = new THREE.Mesh(caminoGeo, caminoMat);
camino.rotation.x = -Math.PI / 2;
camino.position.set(10, 0.015, 0);
camino.receiveShadow = true;
scene.add(camino);

// Árboles de fondo
function crearArbolFondo(x, z, escala = 1) {
    const arbol = new THREE.Group();
    const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.36, 2.8, 12), new THREE.MeshStandardMaterial({ color: 0x3d2716, roughness: 0.9 }));
    tronco.position.y = 1.4;
    tronco.castShadow = true;
    arbol.add(tronco);

    const copa = new THREE.Mesh(new THREE.SphereGeometry(1.7, 16, 16), new THREE.MeshStandardMaterial({ color: 0x1f4724, roughness: 0.85 }));
    copa.position.y = 3.4;
    copa.castShadow = true;
    arbol.add(copa);

    arbol.position.set(x, 0, z);
    arbol.scale.set(escala, escala, escala);
    scene.add(arbol);
}
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

// Partículas atmosféricas de polen/esporas en suspensión
const particleCount = 180;
const particleGeo = new THREE.BufferGeometry();
const particlePos = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i += 3) {
    particlePos[i] = (Math.random() - 0.5) * 20;
    particlePos[i + 1] = Math.random() * 8 + 0.5;
    particlePos[i + 2] = (Math.random() - 0.5) * 20;
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
const particleMat = new THREE.PointsMaterial({ color: 0xf5f5dc, size: 0.08, transparent: true, opacity: 0.45 });
const particleSystem = new THREE.Points(particleGeo, particleMat);
scene.add(particleSystem);

// ============================================================
// 3. ESTRUCTURA PROCEDURAL DE LA PLANTA (PLUMERIA 3D)
// ============================================================
const interactableObjects = [];
const arrayHojas = [];
const growableParts = [];
const plantInstances = [];

let isWindy = true;
let isGrowthPaused = false;
let growthSpeed = 1.0;
let normalizedGrowth = 0.65; // Iniciado en fase visible para impacto estético inmediato

// Materiales reactivos PBR
const matMaceta = new THREE.MeshStandardMaterial({ color: 0x8a482b, roughness: 0.75 });
const matBorde = new THREE.MeshStandardMaterial({ color: 0x5e2d18, roughness: 0.75 });
const matTierra = new THREE.MeshStandardMaterial({ color: 0x2b1a10, roughness: 1.0 });
const matTallo = new THREE.MeshStandardMaterial({ color: 0x365e38, roughness: 0.65 });
const matHoja = new THREE.MeshStandardMaterial({ color: 0x88d424, roughness: 0.35, side: THREE.DoubleSide });
const matPetalo = new THREE.MeshStandardMaterial({ color: 0xfffcf7, roughness: 0.25 });
const matCentroFlor = new THREE.MeshStandardMaterial({ color: 0xffbe0b, roughness: 0.2, emissive: 0xff9100, emissiveIntensity: 0.25 });

function crearParteInteractiva(geometria, material, nombre, tipo, altura, desc, biomasaPct = 0) {
    const mesh = new THREE.Mesh(geometria, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { 
        name: nombre, 
        type: tipo, 
        height: altura, 
        desc: desc, 
        growthPercent: 100,
        biomasaPct: biomasaPct
    };
    interactableObjects.push(mesh);
    return mesh;
}

function crearParteCrecimiento(geometria, material, nombre, tipo, altura, desc, growStart, growEnd, baseScale = new THREE.Vector3(1, 1, 1), biomasaPct = 5) {
    const mesh = crearParteInteractiva(geometria, material, nombre, tipo, altura, desc, biomasaPct);
    mesh.scale.set(0, 0, 0);
    mesh.userData.growStart = growStart;
    mesh.userData.growEnd = growEnd;
    mesh.userData.baseScale = baseScale.clone();
    mesh.userData.growthPercent = 0;
    growableParts.push(mesh);
    return mesh;
}

// Maceta de Terracota
const macetaGroup = new THREE.Group();
const baseMaceta = crearParteInteractiva(new THREE.CylinderGeometry(1.35, 0.85, 1.9, 32), matMaceta, "Base de Maceta", "Cilindro Terracota", "0 a 20 cm", "Contiene sustrato y cepellón radicular.", 0);
baseMaceta.position.y = 0.95;
macetaGroup.add(baseMaceta);

const bordeMaceta = crearParteInteractiva(new THREE.CylinderGeometry(1.5, 1.4, 0.3, 32), matBorde, "Borde de Maceta", "Anillo Superior", "20 cm", "Refuerzo perimetral de barro cocido.", 0);
bordeMaceta.position.y = 1.9;
macetaGroup.add(bordeMaceta);

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

// Creador de coronas foliares y flores de Plumeria
function crearCopaPlumeria(posY, rotZ, rotX, delay, escalaCopa = 1.0) {
    const ramaGroup = new THREE.Group();
    ramaGroup.position.set(0, posY, 0);
    ramaGroup.rotation.set(rotX, 0, rotZ);

    const ramaGeo = new THREE.CylinderGeometry(0.11, 0.16, 1.5, 16);
    ramaGeo.translate(0, 0.75, 0);
    const rama = crearParteCrecimiento(ramaGeo, matTallo, "Rama Secundaria", "CylinderGeometry", "65 a 85 cm", "Ramificación de soporte foliar.", 0.22 + delay, 0.52 + delay, new THREE.Vector3(1,1,1), 10);
    ramaGroup.add(rama);

    // Corona de Hojas (5 hojas por corona)
    const coronaHojas = new THREE.Group();
    coronaHojas.position.y = 1.45;
    ramaGroup.add(coronaHojas);

    const geoHoja = new THREE.SphereGeometry(0.5, 16, 16);
    geoHoja.translate(0, 0, 0.5);

    for (let i = 0; i < 5; i++) {
        const escalaHoja = new THREE.Vector3(0.72 * escalaCopa, 0.05, 2.8 * escalaCopa);
        const hojaMatClone = matHoja.clone();
        const hoja = crearParteCrecimiento(geoHoja, hojaMatClone, "Hoja de Plumeria", "SphereGeometry (Laminar)", "~85 cm", "Órgano fotosintético y transpiratorio.", 0.45 + delay, 0.75 + delay, escalaHoja, 4);

        const pivotHoja = new THREE.Group();
        pivotHoja.rotation.y = (i * Math.PI * 2) / 5;
        pivotHoja.rotation.x = 0.14;
        pivotHoja.add(hoja);

        coronaHojas.add(pivotHoja);
        arrayHojas.push(hoja);
    }

    // Inflorescencia de Plumeria (Centro amarillo + 5 pétalos blancos)
    const florGroup = new THREE.Group();
    florGroup.position.y = 1.5;

    const centro = crearParteCrecimiento(new THREE.ConeGeometry(0.24, 0.22, 16), matCentroFlor, "Centro Floral (Pistilo)", "ConeGeometry", "~88 cm", "Gineceo con polen y fragancia.", 0.68 + delay, 0.98 + delay, new THREE.Vector3(1,1,1), 2);
    centro.rotation.x = Math.PI;
    florGroup.add(centro);

    const geoPetalo = new THREE.SphereGeometry(0.34, 16, 16);
    geoPetalo.translate(0, 0, 0.34);

    for (let i = 0; i < 5; i++) {
        const escalaPetalo = new THREE.Vector3(0.68 * escalaCopa, 0.08, 1.1 * escalaCopa);
        const petalo = crearParteCrecimiento(geoPetalo, matPetalo, "Pétalo Blanco de Plumeria", "SphereGeometry", "~88 cm", "Atracción visual de polinizadores.", 0.72 + delay, 1.05 + delay, escalaPetalo, 1);

        const pivotPetalo = new THREE.Group();
        pivotPetalo.rotation.y = (i * Math.PI * 2) / 5;
        pivotPetalo.rotation.x = 0.18;
        pivotPetalo.add(petalo);
        florGroup.add(pivotPetalo);
    }

    ramaGroup.add(florGroup);
    tallo.add(ramaGroup);
}

// 4 Ramificaciones exuberantes
crearCopaPlumeria(3.1, 0.0, 0.0, 0.0, 1.05);          // Copa apical central
crearCopaPlumeria(2.4, 0.58, -0.25, 0.10, 0.95);      // Rama derecha
crearCopaPlumeria(2.1, -0.58, 0.25, 0.18, 0.92);      // Rama izquierda
crearCopaPlumeria(1.8, 0.15, 0.55, 0.24, 0.88);       // Rama frontal

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
// 4. MOTOR BIOINFORMÁTICO Y ESTADO DE LA APLICACIÓN
// ============================================================
const growthEngine = new GrowthEngine();
let especiesCatalogo = [];
let especieActual = null;
let liveChart = null;
let abChart = null;
let isSimRunning = false;
let simIntervalId = null;
let dailyHistory = [];
let maxSimulatedDay = 0;
let plantHealth = 100;
let leavesVisible = true;
let manualLightSetting = 1.1;

const CATALOGO_LOCAL = [
    { id: 5, nombre_comun: 'Plumeria', nombre_cientifico: 'Plumeria rubra', tipo: 'arbórea', temp_optima: 27, temp_min: 15, temp_max: 38, luz_optima: 1000, luz_min: 300, luz_max: 2200, agua_optima: 40, agua_min: 20, agua_max: 60, nutrientes_opt: 60, co2_optimo: 400, tasa_r: 0.12, capacidad_k: 150, dias_madurez: 120, biomasa_max: 1200, color_tallo: '#365e38', color_hoja: '#88d424', color_flor: '#fffcf7', descripcion: 'Árbol tropical ornamental con flores fragantes de 5 pétalos. Especie nativa mesoamericana.' },
    { id: 1, nombre_comun: 'Maíz', nombre_cientifico: 'Zea mays', tipo: 'herbácea', temp_optima: 28, temp_min: 10, temp_max: 40, luz_optima: 1000, luz_min: 300, luz_max: 2200, agua_optima: 55, agua_min: 30, agua_max: 75, nutrientes_opt: 75, co2_optimo: 400, tasa_r: 0.18, capacidad_k: 120, dias_madurez: 120, biomasa_max: 800, color_tallo: '#3d6b28', color_hoja: '#5cb31a', color_flor: '#f5e642', descripcion: 'Cereal de alto rendimiento originario de Mesoamérica. Base alimentaria mundial.' },
    { id: 3, nombre_comun: 'Tomate', nombre_cientifico: 'Solanum lycopersicum', tipo: 'herbácea', temp_optima: 26, temp_min: 13, temp_max: 38, luz_optima: 850, luz_min: 250, luz_max: 2000, agua_optima: 60, agua_min: 40, agua_max: 80, nutrientes_opt: 70, co2_optimo: 400, tasa_r: 0.16, capacidad_k: 110, dias_madurez: 100, biomasa_max: 600, color_tallo: '#2e6b18', color_hoja: '#4caf50', color_flor: '#ffd700', descripcion: 'Hortaliza de fruto rojo ampliamente cultivada en invernaderos tecnificados.' },
    { id: 2, nombre_comun: 'Frijol', nombre_cientifico: 'Phaseolus vulgaris', tipo: 'herbácea', temp_optima: 24, temp_min: 12, temp_max: 35, luz_optima: 700, luz_min: 200, luz_max: 1800, agua_optima: 50, agua_min: 35, agua_max: 70, nutrientes_opt: 65, co2_optimo: 380, tasa_r: 0.14, capacidad_k: 80, dias_madurez: 85, biomasa_max: 350, color_tallo: '#2d5a1e', color_hoja: '#3d8b2f', color_flor: '#ffffff', descripcion: 'Leguminosa con fijación biológica de nitrógeno en el suelo.' },
    { id: 4, nombre_comun: 'Arabidopsis', nombre_cientifico: 'Arabidopsis thaliana', tipo: 'herbácea', temp_optima: 22, temp_min: 8, temp_max: 30, luz_optima: 500, luz_min: 100, luz_max: 1200, agua_optima: 45, agua_min: 25, agua_max: 65, nutrientes_opt: 60, co2_optimo: 400, tasa_r: 0.20, capacidad_k: 30, dias_madurez: 45, biomasa_max: 50, color_tallo: '#3a7a3a', color_hoja: '#7cc87c', color_flor: '#eeeeee', descripcion: 'Planta modelo con genoma completamente mapeado en biología vegetal.' }
];

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
async function initApp() {
    setupTabNavigation();
    initCharts();
    setupEventListeners();
    await checkApiAndLoadSpecies();
}

async function checkApiAndLoadSpecies() {
    const statusText = document.getElementById('api-status-text');
    try {
        statusText.textContent = 'Conectando...';
        statusText.style.color = '#ffb74d';
        
        const especies = await window.API.getEspecies();
        if (especies && especies.length > 0) {
            especiesCatalogo = especies;
            statusText.textContent = 'MySQL Online (FlightPHP)';
            statusText.style.color = '#a8f060';
        } else {
            throw new Error('Catálogo vacío');
        }
    } catch (err) {
        console.warn('API no disponible. Usando catálogo local:', err);
        especiesCatalogo = CATALOGO_LOCAL;
        statusText.textContent = 'API/MySQL sin conexión · Modo local';
        statusText.title = err.message;
        statusText.style.color = '#ffa726';
    }

    populateSpeciesDropdowns();
    
    // Seleccionar Plumeria Rubra por defecto
    const plumeria = especiesCatalogo.find(e => e.nombre_comun === 'Plumeria') || especiesCatalogo[0];
    seleccionarEspecie(plumeria);

    // Mostrar una trayectoria inicial para que el usuario pueda explorar el registro diario.
    maxSimulatedDay = Math.min(45, growthEngine.maxDias);
    actualizarGrowthTimeline(maxSimulatedDay);

    cargarHistorialSimulaciones();
    cargarReportesBio();
}

function populateSpeciesDropdowns() {
    const selMain = document.getElementById('sel-especie');
    const selAbA = document.getElementById('sel-ab-specie-a');
    const selAbB = document.getElementById('sel-ab-specie-b');

    selMain.innerHTML = '';
    selAbA.innerHTML = '';
    selAbB.innerHTML = '';

    especiesCatalogo.forEach(esp => {
        const opt = `<option value="${esp.id}">${esp.nombre_comun} (${esp.nombre_cientifico})</option>`;
        selMain.innerHTML += opt;
        selAbA.innerHTML += opt;
        selAbB.innerHTML += opt;
    });

    if (selAbB.options.length > 1) selAbB.selectedIndex = 1;
}

function seleccionarEspecie(especie) {
    especieActual = especie;
    growthEngine.setEspecie(especie);
    document.getElementById('timeline-slider').max = growthEngine.maxDias;
    maxSimulatedDay = Math.min(maxSimulatedDay, growthEngine.maxDias);

    const selMain = document.getElementById('sel-especie');
    if (selMain) selMain.value = especie.id;

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
    }
    if (especie.color_flor) matPetalo.color.set(especie.color_flor);

    actualizarParametrosDesdeUI();
}

function actualizarParametrosDesdeUI() {
    const modelo = document.getElementById('sel-modelo').value;
    const r = parseFloat(document.getElementById('input-r').value) || 0.12;
    const K = parseFloat(document.getElementById('input-k').value) || 150;

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

    document.getElementById('kpi-dia').textContent = dia;
    document.getElementById('kpi-altura').textContent = `${med.altura.toFixed(1)} u`;
    document.getElementById('kpi-biomasa').textContent = `${med.biomasa.toFixed(1)} g`;
    document.getElementById('kpi-hojas').textContent = med.num_hojas;
    document.getElementById('kpi-ramas').textContent = med.num_ramas;
    document.getElementById('kpi-icr').textContent = med.icr.toFixed(3);

    // Estrés
    document.getElementById('kpi-estres-total').textContent = `${med.estres_total}%`;
    document.getElementById('kpi-estres-h').textContent = `${med.indice_estres_hidrico}%`;
    document.getElementById('kpi-estres-t').textContent = `${med.indice_estres_termico}%`;
    document.getElementById('kpi-estres-l').textContent = `${med.indice_estres_luminico}%`;
    document.getElementById('kpi-estres-n').textContent = `${med.indice_estres_nutricional}%`;

    const barTotal = document.getElementById('bar-estres-total');
    barTotal.style.width = `${med.estres_total}%`;
    if (med.estres_total < 25) {
        barTotal.style.background = '#4caf50';
    } else if (med.estres_total < 55) {
        barTotal.style.background = '#ffa726';
    } else {
        barTotal.style.background = '#ef5350';
    }

    // Pronóstico cosecha
    const diasRest = med.prediccion_cosecha_dias;
    const elCosecha = document.getElementById('kpi-cosecha');
    if (diasRest === 0) {
        elCosecha.textContent = '¡Madurez biológica alcanzada! Óptimo para cosecha.';
        elCosecha.style.color = '#a8f060';
    } else {
        elCosecha.textContent = `Aprox. ${diasRest} días para madurez completa`;
        elCosecha.style.color = '#ffee58';
    }

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
}

function actualizarPanelDecisiones(dia) {
    const decisiones = growthEngine.generarDecisiones(dia);
    const container = document.getElementById('decisiones-container');
    container.innerHTML = '';

    decisiones.forEach(dec => {
        const div = document.createElement('div');
        div.className = `decision-card prioridad-${dec.prioridad}`;
        div.innerHTML = `
            <div class="decision-tipo">${dec.tipo.toUpperCase()} · PRIORIDAD ${dec.prioridad.toUpperCase()}</div>
            <div class="decision-msg">${dec.mensaje}</div>
        `;
        container.appendChild(div);
    });
}

// ============================================================
// 7. CHART.JS EN VIVO & COMPARATIVA A/B
// ============================================================
function initCharts() {
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
        if (window.GeoObservatory) { try { await window.GeoObservatory.linkSimulation(simId); } catch (geoErr) { console.warn("No se pudo asociar el análisis geográfico:", geoErr.message); } }

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
    }
}

async function cargarHistorialSimulaciones() {
    const list = document.getElementById('historial-lista');
    try {
        const sims = await window.API.getSimulaciones();
        if (!sims || sims.length === 0) {
            list.innerHTML = '<p style="font-size:0.75rem; color:var(--text-muted);">Sin simulaciones registradas.</p>';
            return;
        }

        list.innerHTML = '';
        sims.forEach(s => {
            const item = document.createElement('div');
            item.className = 'sim-list-item';
            item.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="sim-name">#${s.id} ${s.nombre}</span>
                    <span class="sim-badge badge-${s.estado}">${s.estado}</span>
                </div>
                <div class="sim-meta">
                    Especie: <strong>${s.especie_nombre || 'Planta'}</strong> | Modelo: <strong>${s.modelo}</strong><br>
                    Biomasa: <strong>${s.biomasa_final}g</strong> | Días: <strong>${s.dias_simulados}</strong> | Estrés: <strong>${s.estres_promedio}%</strong>
                </div>
                <div style="margin-top: 6px; display:flex; gap:6px;">
                    <button class="btn btn-sm btn-secondary btn-cargar-sim" data-id="${s.id}">Cargar y Reproducir</button>
                    <button class="btn btn-sm btn-danger btn-borrar-sim" data-id="${s.id}">Eliminar</button>
                </div>
            `;
            list.appendChild(item);
        });

        list.querySelectorAll('.btn-cargar-sim').forEach(b => {
            b.addEventListener('click', (e) => {
                reproducirSimulacionHistorica(e.target.getAttribute('data-id'));
            });
        });

        list.querySelectorAll('.btn-borrar-sim').forEach(b => {
            b.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm(`¿Eliminar simulación #${id}?`)) {
                    await window.API.eliminarSimulacion(id);
                    cargarHistorialSimulaciones();
                    cargarReportesBio();
                }
            });
        });
    } catch (err) {
        list.innerHTML = '<p style="font-size:0.72rem; color:#ef9a9a;">API en modo local o desconectada.</p>';
    }
}

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
async function cargarReportesBio() {
    try {
        const top = await window.API.getTopBiomasa();
        const tbodyTop = document.querySelector('#tabla-top-biomasa tbody');
        if (top && top.length > 0) {
            tbodyTop.innerHTML = top.map(r => `
                <tr>
                    <td><strong>${r.nombre}</strong></td>
                    <td>${r.especie}</td>
                    <td>${r.modelo}</td>
                    <td><strong style="color:var(--accent-glow);">${r.biomasa_final} g</strong></td>
                    <td>${r.altura_final} u</td>
                </tr>
            `).join('');
        }

        const ef = await window.API.getEficiencia();
        const tbodyEf = document.querySelector('#tabla-eficiencia tbody');
        if (ef && ef.length > 0) {
            tbodyEf.innerHTML = ef.map(r => `
                <tr>
                    <td><strong>${r.nombre_comun}</strong></td>
                    <td><strong style="color:var(--accent-yellow);">${r.eficiencia_g_dia} g/d</strong></td>
                    <td>${r.estres_promedio}%</td>
                    <td>${r.num_simulaciones}</td>
                </tr>
            `).join('');
        }

        const mad = await window.API.getPromedioMadurez();
        const tbodyMad = document.querySelector('#tabla-madurez tbody');
        if (mad && mad.length > 0) {
            tbodyMad.innerHTML = mad.map(r => `
                <tr>
                    <td><strong>${r.nombre_comun}</strong></td>
                    <td>${r.madurez_teorica} días</td>
                    <td>${r.dias_promedio_simulados} días</td>
                </tr>
            `).join('');
        }
    } catch (e) {
        console.warn('Reportes no disponibles offline');
    }
}

function exportarCSV() {
    if (growthEngine.mediciones.length === 0) {
        alert('No hay mediciones en la simulación actual para exportar.');
        return;
    }

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
}

// ============================================================
// 11. BUCLE DE ANIMACIÓN Y RENDER THREE.JS
// ============================================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Actualización de escala de partes de la planta con curva suave
    growableParts.forEach(part => {
        const data = part.userData;
        let rawProgress = (normalizedGrowth - data.growStart) / (data.growEnd - data.growStart);
        let progress = Math.max(0, Math.min(1, rawProgress));

        let smooth = progress * progress * (3 - 2 * progress);
        part.scale.set(
            smooth * data.baseScale.x,
            smooth * data.baseScale.y,
            smooth * data.baseScale.z
        );
        data.growthPercent = Math.floor(progress * 100);
    });

    // Viento suave orgánico
    if (isWindy) {
        plantInstances.forEach(instancia => {
            instancia.planta.rotation.z = Math.sin(elapsedTime * 1.6) * 0.035;
            instancia.planta.rotation.x = Math.cos(elapsedTime * 1.3) * 0.025;
            instancia.tallo.rotation.y = Math.sin(elapsedTime * 0.5) * 0.04;
        });
    }

    // Deriva suave de partículas atmosféricas
    if (particleSystem) {
        const pos = particleSystem.geometry.attributes.position.array;
        for (let i = 1; i < pos.length; i += 3) {
            pos[i] -= delta * 0.15;
            if (pos[i] < 0.2) pos[i] = 7.5;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    actualizarPanelRaycasting();
    controls.update();
    renderer.render(scene, camera);
}

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

initApp();
animate();
