import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ==========================================
// 1. CONFIGURACIÓN BÁSICA DEL ENTORNO
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2c3e50);
scene.fog = new THREE.FogExp2(0x2c3e50, 0.03);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; 
controls.target.set(0, 2, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(10, 15, 10);
dirLight.castShadow = true;
scene.add(dirLight);

// Suelo del laboratorio
const piso = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.MeshStandardMaterial({ color: 0x111a1f }));
piso.rotation.x = -Math.PI / 2;
piso.receiveShadow = true;
scene.add(piso);

// ==========================================
// 2. SHADERS PERSONALIZADOS (GLSL)
// ==========================================
// Vertex Shader: Desplaza los vértices en X dependiendo de la altura (Y) y el tiempo
const leafVertexShader = `
    uniform float time;
    uniform float windIntensity;
    varying vec2 vUv;
    void main() {
        vUv = uv;
        vec3 pos = position;
        // La hoja se dobla más en la punta que en la base
        pos.x += sin(time * 3.0 + pos.y * 5.0) * windIntensity * pos.y * 0.2;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

// Fragment Shader: Crea un degradado de color vertical
const leafFragmentShader = `
    uniform vec3 colorBottom;
    uniform vec3 colorTop;
    varying vec2 vUv;
    void main() {
        vec3 finalColor = mix(colorBottom, colorTop, vUv.y);
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

// Variables que conectan JS con el Shader
const shaderUniforms = {
    time: { value: 0 },
    windIntensity: { value: 0.5 },
    colorBottom: { value: new THREE.Color(0x1e4311) }, // Verde oscuro
    colorTop: { value: new THREE.Color(0x4CAF50) }     // Verde claro
};

const leafMaterial = new THREE.ShaderMaterial({
    vertexShader: leafVertexShader,
    fragmentShader: leafFragmentShader,
    uniforms: shaderUniforms,
    side: THREE.DoubleSide
});

// ==========================================
// 3. CONSTRUCCIÓN Y JERARQUÍA DE CRECIMIENTO
// ==========================================
const interactableObjects = [];
const growableParts = []; 

// Función mejorada: Registra tiempos de inicio/fin de crecimiento y escala final
function crearParteAnimada(geometria, material, nombre, tipo, start, end, baseScale = new THREE.Vector3(1,1,1)) {
    const mesh = new THREE.Mesh(geometria, material);
    mesh.castShadow = true; 
    mesh.receiveShadow = true;
    mesh.scale.set(0, 0, 0); // Inician con tamaño cero
    
    mesh.userData = { 
        name: nombre, type: tipo, percentage: "0%", 
        growStart: start, growEnd: end, baseScale: baseScale 
    };
    
    interactableObjects.push(mesh);
    growableParts.push(mesh);
    return mesh;
}

const planta = new THREE.Group();
planta.position.y = 0; 
scene.add(planta);

const materialTallo = new THREE.MeshStandardMaterial({ color: 0x2E4B24 });

// Tallo: Crece en la etapa 0.0 a 0.4
const tallo = crearParteAnimada(new THREE.CylinderGeometry(0.2, 0.3, 4, 16), materialTallo, "Tallo Principal", "Cilindro", 0.0, 0.4);
tallo.position.y = 2; 
planta.add(tallo);

function crearRamaProcedural(posY, rotZ, rotX, delay) {
    const ramaGroup = new THREE.Group();
    ramaGroup.position.set(0, posY, 0);
    ramaGroup.rotation.set(rotX, 0, rotZ);
    
    // Rama: Crece después del tallo
    const rama = crearParteAnimada(new THREE.CylinderGeometry(0.1, 0.15, 2, 16), materialTallo, "Rama", "Cilindro", 0.3 + delay, 0.7 + delay);
    rama.position.y = 1;
    ramaGroup.add(rama);

    const coronaHojas = new THREE.Group();
    coronaHojas.position.y = 2;
    ramaGroup.add(coronaHojas);

    for(let i = 0; i < 5; i++) {
        // Hoja: Usa el Shader GLSL y crece al final
        const escalaHoja = new THREE.Vector3(1, 0.1, 3);
        const hoja = crearParteAnimada(new THREE.SphereGeometry(0.4, 16, 16), leafMaterial, "Hoja (GLSL)", "Esfera Shader", 0.6 + delay, 1.0 + delay, escalaHoja);
        hoja.position.z = 1.2;
        
        const pivot = new THREE.Group();
        pivot.rotation.y = (i * Math.PI * 2) / 5;
        pivot.rotation.x = 0.3;
        pivot.add(hoja);
        coronaHojas.add(pivot);
    }
    tallo.add(ramaGroup);
}

// 3 Ramas con desfase de tiempo para crecimiento orgánico
crearRamaProcedural(1.0, 0.6, 0, 0.0);       
crearRamaProcedural(0.5, -0.5, 0.4, 0.1);    
crearRamaProcedural(-0.5, -0.2, -0.5, 0.2);  

// ==========================================
// 4. LÓGICA DE SIMULACIÓN Y CONTROLES
// ==========================================
let globalGrowth = 0; 
let isPaused = false;
let growthSpeed = 1.0;

document.getElementById('btn-pause').addEventListener('click', () => isPaused = !isPaused);
document.getElementById('btn-restart').addEventListener('click', () => globalGrowth = 0);
document.getElementById('speed-slider').addEventListener('input', (e) => growthSpeed = parseFloat(e.target.value));
document.getElementById('wind-slider').addEventListener('input', (e) => shaderUniforms.windIntensity.value = parseFloat(e.target.value));
document.getElementById('btn-cam-reset').addEventListener('click', () => { camera.position.set(0, 5, 12); controls.target.set(0,2,0); });

document.getElementById('btn-color').addEventListener('click', () => {
    shaderUniforms.colorTop.value.setHex(Math.random() * 0xffffff);
});

// ==========================================
// 5. RAYCASTING (Selección)
// ==========================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const infoPanel = document.getElementById('info-panel');
const dName = document.getElementById('info-name'), dType = document.getElementById('info-type'), dGrowth = document.getElementById('info-growth');

window.addEventListener('click', (event) => {
    if(event.target.tagName === 'BUTTON' || event.target.tagName === 'INPUT') return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(interactableObjects, false);
    if (intersects.length > 0) {
        const data = intersects[0].object.userData;
        dName.textContent = data.name; 
        dType.textContent = data.type; 
        dGrowth.textContent = data.percentage;
        infoPanel.classList.remove('hidden');
    } else {
        infoPanel.classList.add('hidden');
    }
});

// ==========================================
// 6. BUCLE DE ANIMACIÓN (requestAnimationFrame)
// ==========================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // 1. Actualizar Shader
    shaderUniforms.time.value = time;

    // 2. Lógica de Crecimiento
    if (!isPaused && globalGrowth < 1.3) {
        globalGrowth += delta * 0.1 * growthSpeed; 
    }

    growableParts.forEach(part => {
        const data = part.userData;
        // Calcular porcentaje local (0 a 1)
        let localGrowth = Math.max(0, Math.min(1, (globalGrowth - data.growStart) / (data.growEnd - data.growStart)));
        
        // Suavizado (Cubic Ease-Out) para que no parezca mecánico
        const smoothGrowth = 1 - Math.pow(1 - localGrowth, 3);
        
        // Aplicar la escala usando la base original
        part.scale.set(
            smoothGrowth * data.baseScale.x, 
            smoothGrowth * data.baseScale.y, 
            smoothGrowth * data.baseScale.z
        );
        
        // Actualizar el string para el Raycaster
        data.percentage = Math.floor(localGrowth * 100) + "%";
    });

    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();