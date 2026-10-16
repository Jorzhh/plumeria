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
camera.position.set(0, 4.5, 10.5);

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
controls.target.set(0, 2.3, 0);
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
const caminoGeo = new THREE.PlaneGeometry(5.5, 70);
const caminoMat = new THREE.MeshStandardMaterial({ color: 0x828882, roughness: 0.95 });
const camino = new THREE.Mesh(caminoGeo, caminoMat);
camino.rotation.x = -Math.PI / 2;
camino.position.set(5.5, 0.015, 0);
camino.receiveShadow = true;
scene.add(camino);

// Árboles de fondo
function crearArbolFondo(x, z, escala = 1) {
    const arbol = new THREE.Group();
    const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.85, 4.0, 12), new THREE.MeshStandardMaterial({ color: 0x3d2716, roughness: 0.9 }));
    tronco.position.y = 2.0;
    tronco.castShadow = true;
    arbol.add(tronco);

    const copa = new THREE.Mesh(new THREE.SphereGeometry(3.4, 16, 16), new THREE.MeshStandardMaterial({ color: 0x1f4724, roughness: 0.85 }));
    copa.position.y = 5.2;
    copa.castShadow = true;
    arbol.add(copa);

    arbol.position.set(x, 0, z);
    arbol.scale.set(escala, escala, escala);
    scene.add(arbol);
}
crearArbolFondo(-10, -8, 1.8);
crearArbolFondo(12, -9, 2.1);
crearArbolFondo(-12, 6, 1.6);
crearArbolFondo(12, 13, 1.7);
crearArbolFondo(-6, 14, 1.9);
crearArbolFondo(6, -15, 2.0);

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
scene.add(macetaGroup);

// Grupo Jerárquico de la Planta
const planta = new THREE.Group();
planta.position.y = 1.85;
scene.add(planta);

// Tallo principal
const geoTallo = new THREE.CylinderGeometry(0.18, 0.25, 3.2, 16);
geoTallo.translate(0, 1.6, 0);
const tallo = crearParteCrecimiento(geoTallo, matTallo, "Tallo Principal (Xilema y Floema)", "CylinderGeometry", "20 a 65 cm", "Eje vascular leñoso de soporte y conducción.", 0.0, 0.35, new THREE.Vector3(1,1,1), 40);
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

const CATALOGO_LOCAL = [
    { id: 5, nombre_comun: 'Plumeria', nombre_cientifico: 'Plumeria rubra', tipo: 'arbórea', temp_optima: 27, temp_min: 15, temp_max: 38, luz_optima: 1000, luz_min: 300, luz_max: 2200, agua_optima: 40, agua_min: 20, agua_max: 60, nutrientes_opt: 60, co2_optimo: 400, tasa_r: 0.12, capacidad_k: 150, dias_madurez: 120, biomasa_max: 1200, color_tallo: '#365e38', color_hoja: '#88d424', color_flor: '#fffcf7', descripcion: 'Árbol tropical ornamental con flores fragantes de 5 pétalos. Especie nativa mesoamericana.' },
    { id: 1, nombre_comun: 'Maíz', nombre_cientifico: 'Zea mays', tipo: 'herbácea', temp_optima: 28, temp_min: 10, temp_max: 40, luz_optima: 1000, luz_min: 300, luz_max: 2200, agua_optima: 55, agua_min: 30, agua_max: 75, nutrientes_opt: 75, co2_optimo: 400, tasa_r: 0.18, capacidad_k: 120, dias_madurez: 120, biomasa_max: 800, color_tallo: '#3d6b28', color_hoja: '#5cb31a', color_flor: '#f5e642', descripcion: 'Cereal de alto rendimiento originario de Mesoamérica. Base alimentaria mundial.' },
    { id: 3, nombre_comun: 'Tomate', nombre_cientifico: 'Solanum lycopersicum', tipo: 'herbácea', temp_optima: 26, temp_min: 13, temp_max: 38, luz_optima: 850, luz_min: 250, luz_max: 2000, agua_optima: 60, agua_min: 40, agua_max: 80, nutrientes_opt: 70, co2_optimo: 400, tasa_r: 0.16, capacidad_k: 110, dias_madurez: 100, biomasa_max: 600, color_tallo: '#2e6b18', color_hoja: '#4caf50', color_flor: '#ffd700', descripcion: 'Hortaliza de fruto rojo ampliamente cultivada en invernaderos tecnificados.' },
    { id: 2, nombre_comun: 'Frijol', nombre_cientifico: 'Phaseolus vulgaris', tipo: 'herbácea', temp_optima: 24, temp_min: 12, temp_max: 35, luz_optima: 700, luz_min: 200, luz_max: 1800, agua_optima: 50, agua_min: 35, agua_max: 70, nutrientes_opt: 65, co2_optimo: 380, tasa_r: 0.14, capacidad_k: 80, dias_madurez: 85, biomasa_max: 350, color_tallo: '#2d5a1e', color_hoja: '#3d8b2f', color_flor: '#ffffff', descripcion: 'Leguminosa con fijación biológica de nitrógeno en el suelo.' },
    { id: 4, nombre_comun: 'Arabidopsis', nombre_cientifico: 'Arabidopsis thaliana', tipo: 'herbácea', temp_optima: 22, temp_min: 8, temp_max: 30, luz_optima: 500, luz_min: 100, luz_max: 1200, agua_optima: 45, agua_min: 25, agua_max: 65, nutrientes_opt: 60, co2_optimo: 400, tasa_r: 0.20, capacidad_k: 30, dias_madurez: 45, biomasa_max: 50, color_tallo: '#3a7a3a', color_hoja: '#7cc87c', color_flor: '#eeeeee', descripcion: 'Planta modelo con genoma completamente mapeado en biología vegetal.' }
];

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
        statusText.textContent = 'Modo Local (Inicia PHP en :8080)';
        statusText.style.color = '#ffa726';
    }

    populateSpeciesDropdowns();
    
    // Seleccionar Plumeria Rubra por defecto
    const plumeria = especiesCatalogo.find(e => e.nombre_comun === 'Plumeria') || especiesCatalogo[0];
    seleccionarEspecie(plumeria);

    // Inicializar simulación a Día 45 para renderizado visual pleno inmediato
    growthEngine.simularCompleto(45);
    actualizarGrowthTimeline(45);

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
        arrayHojas.forEach(h => h.material.color.set(especie.color_hoja));
    }
    if (especie.color_flor) matPetalo.color.set(especie.color_flor);

    actualizarParametrosDesdeUI();
}

function actualizarParametrosDesdeUI() {
    const modelo = document.getElementById('sel-modelo').value;
    const r = parseFloat(document.getElementById('input-r').value) || 0.12;
    const K = parseFloat(document.getElementById('input-k').value) || 150;

    const env = {
        temperatura: parseFloat(document.getElementById('slider-temp').value),
        luz: parseFloat(document.getElementById('slider-luz').value),
        agua: parseFloat(document.getElementById('slider-agua').value),
        nutrientes: parseFloat(document.getElementById('slider-nutrientes').value),
        co2: parseFloat(document.getElementById('slider-co2').value)
    };

    growthEngine.setModel(modelo);
    growthEngine.setParams(r, K, 1);
    growthEngine.setEnvironment(env);

    // Efecto visual de clorosis/marchitamiento por estrés
    const estresTotal = growthEngine.calcularEstresTotal();
    const estresH = growthEngine.calcularEstresHidrico();
    if (estresH > 40 || estresTotal > 45) {
        const factor = Math.min(1, (estresTotal - 40) / 60);
        const clrMarchito = new THREE.Color(0xb5a642).lerp(new THREE.Color(0x754320), factor);
        arrayHojas.forEach(h => h.material.color.set(clrMarchito));
    } else if (especieActual && especieActual.color_hoja) {
        arrayHojas.forEach(h => h.material.color.set(especieActual.color_hoja));
    }

    actualizarDashboardKPIs();
}

// ============================================================
// 6. DASHBOARD KPIS & DECISIONES
// ============================================================
function actualizarDashboardKPIs() {
    const dia = growthEngine.dia;
    const med = growthEngine.generarMedicion(dia);

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
    const labels = growthEngine.mediciones.map(m => `D${m.dia}`);
    const dataBio = growthEngine.mediciones.map(m => m.biomasa);
    const dataAlt = growthEngine.mediciones.map(m => m.altura);

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

    const medActual = growthEngine.generarMedicion(diaActual);
    const payload = {
        nombre,
        especie_id: especieActual ? especieActual.id : 5,
        modelo: growthEngine.model,
        temperatura: growthEngine.environment.temperatura,
        luz: growthEngine.environment.luz,
        agua: growthEngine.environment.agua,
        nutrientes: growthEngine.environment.nutrientes,
        co2: growthEngine.environment.co2,
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

        if (growthEngine.mediciones.length > 0) {
            const batch = growthEngine.mediciones.map(m => ({
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

    const headers = ['dia', 'altura_u', 'biomasa_g', 'num_hojas', 'num_ramas', 'estres_hidrico', 'estres_termico', 'estres_luminico', 'estres_nutricional', 'estres_total', 'icr', 'dias_cosecha'];
    const rows = growthEngine.mediciones.map(m => [
        m.dia, m.altura, m.biomasa, m.num_hojas, m.num_ramas,
        m.indice_estres_hidrico, m.indice_estres_termico, m.indice_estres_luminico, m.indice_estres_nutricional,
        m.estres_total, m.icr, m.prediccion_cosecha_dias
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + rows.map(e => e.join(',')).join('\n');
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
        planta.rotation.z = Math.sin(elapsedTime * 1.6) * 0.035;
        planta.rotation.x = Math.cos(elapsedTime * 1.3) * 0.025;
        tallo.rotation.y = Math.sin(elapsedTime * 0.5) * 0.04;
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
        const med = growthEngine.generarMedicion(dia);

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
    if (event.target.closest('#sidebar') || event.target.closest('#viewport-controls')) return;

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
    if (event.target.closest('#sidebar') || event.target.closest('#viewport-controls')) return;

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
        arrayHojas.forEach(h => h.material.color.setHex(rnd));
    });
    document.getElementById('btn-toggle-hojas').addEventListener('click', () => {
        arrayHojas.forEach(h => h.visible = !h.visible);
    });
    document.getElementById('btn-reset').addEventListener('click', () => {
        camera.position.set(0, 4.5, 10.5);
        controls.target.set(0, 2.3, 0);
        controls.update();
    });
    document.getElementById('growth-speed-slider').addEventListener('input', (e) => {
        growthSpeed = parseFloat(e.target.value);
    });
    document.getElementById('light-slider').addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        directionalLight.intensity = val * 1.25;
        ambientLight.intensity = val * 0.45;
        const skyTint = skyColor.clone().multiplyScalar(Math.max(0.12, val));
        scene.background = skyTint;
        if (scene.fog) scene.fog.color = skyTint;
    });
}

function actualizarGrowthTimeline(dia) {
    growthEngine.simularCompleto(dia);
    growthEngine.dia = dia;
    normalizedGrowth = Math.min(1.35, (growthEngine.calcularCrecimiento(dia) / growthEngine.params.K) * 1.35);

    document.getElementById('timeline-slider').value = dia;
    document.getElementById('timeline-day-val').textContent = dia;

    actualizarDashboardKPIs();
    updateLiveChart();
}
window.actualizarGrowthTimeline = actualizarGrowthTimeline;

function avanzarUnDia() {
    if (growthEngine.dia >= growthEngine.maxDias) return;
    const med = growthEngine.step();
    actualizarGrowthTimeline(med.dia);
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
    actualizarGrowthTimeline(0);
}

window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

initApp();
animate();
