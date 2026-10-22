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
camera.position.set(0, 6.5, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 2.0, 0);

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

const surco = new THREE.Mesh(new THREE.BoxGeometry(16, 0.06, 3.5), new THREE.MeshStandardMaterial({ color: 0x2b1a10, roughness: 1.0 }));
surco.position.set(0, 0.03, 0);
surco.receiveShadow = true;
scene.add(surco);

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
    arbol.position.set(x, 0.05, z);

    const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.3 * escala, 0.5 * escala, 3 * escala, 12), matTroncoRobusto);
    tronco.position.y = (1.5 * escala);
    tronco.castShadow = true;
    tronco.userData = { name: "Encino del Jardín Botánico", type: "Árbol Leñoso", height: `${(3 * escala).toFixed(1)} m`, desc: "Especie arbórea frondosa.", plantIndex: "Jardín" };
    arbol.add(tronco);
    interactableObjects.push(tronco);

    const copaGeo = new THREE.DodecahedronGeometry(1.8 * escala, 1);
    const copa1 = new THREE.Mesh(copaGeo, matCopaFrondosa);
    copa1.position.y = (3.5 * escala);
    copa1.castShadow = true;
    arbol.add(copa1);

    jardinGroup.add(arbol);
}

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

// ============================================================
// 6. INTEGRADOR BIOINFORMÁTICO
// ============================================================
let growthEngine = null;
let especiesCatalogo = [];
let especieActual = null;
let liveChart = null;
let abChart = null;

const CATALOGO_LOCAL = [
    { id: 1, nombre_comun: 'Plumeria', nombre_cientifico: 'Plumeria rubra', tipo: 'arbórea', temp_optima: 27, agua_optima: 40, luz_optima: 1000, nutrientes_opt: 60, tasa_r: 0.12, capacidad_k: 150, dias_madurez: 120, color_hoja: '#88d424', descripcion: 'Arbusto leñoso tropical.' },
    { id: 2, nombre_comun: 'Maíz', nombre_cientifico: 'Zea mays', tipo: 'herbácea', temp_optima: 28, agua_optima: 55, luz_optima: 1000, nutrientes_opt: 75, tasa_r: 0.18, capacidad_k: 120, dias_madurez: 90, color_hoja: '#5cb31a', descripcion: 'Cereal fotosintético C4.' }
];

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
    seleccionarEspecie(especiesCatalogo[0]);
    actualizarGrowthTimeline(45);
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

function seleccionarEspecie(esp) {
    especieActual = esp;
    if (growthEngine) growthEngine.setEspecie(esp);

    const selMain = document.getElementById('sel-especie');
    if (selMain) selMain.value = esp.id;

    if (document.getElementById('badge-esp-nombre')) {
        document.getElementById('badge-esp-nombre').textContent = `${esp.nombre_comun} (${esp.nombre_cientifico})`;
        document.getElementById('badge-esp-tipo').textContent = esp.tipo || 'herbácea';
        document.getElementById('badge-esp-desc').textContent = esp.descripcion || 'Especie seleccionada.';
    }

    if (esp.color_hoja) arrayHojas.forEach(h => h.material.color.set(esp.color_hoja));
    actualizarParametrosDesdeUI();
}

function actualizarParametrosDesdeUI() {
    if (!growthEngine) return;

    const modelo = document.getElementById('sel-modelo')?.value || 'logistico';
    const r = parseFloat(document.getElementById('input-r')?.value) || 0.12;
    const K = parseFloat(document.getElementById('input-k')?.value) || 150;

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

    if (liveChart) {
        liveChart.data.labels = growthEngine.mediciones.map(m => `D${m.dia}`);
        liveChart.data.datasets[0].data = growthEngine.mediciones.map(m => (m.biomasa * 5).toFixed(1));
        liveChart.update('none');
    }
}

function initCharts() {
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
}

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    if (isWindy) {
        plantasGroupArray.forEach((pGroup, idx) => {
            pGroup.rotation.z = Math.sin(elapsedTime * 1.4 + idx) * 0.02;
            pGroup.rotation.x = Math.cos(elapsedTime * 1.1 + idx) * 0.015;
        });
    }

    controls.update();
    renderer.render(scene, camera);
}

// Iniciar aplicación
initApp();
animate();