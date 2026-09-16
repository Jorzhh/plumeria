// 1. Escena y fondo blanco
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); 

const gridHelper = new THREE.GridHelper(15, 15);
scene.add(gridHelper);

// 2. Cámara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 4, 6); 

// 3. Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 6. Luces
const luzAmbiental = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(luzAmbiental);
const luzDireccional = new THREE.DirectionalLight(0xffffff, 0.8);
luzDireccional.position.set(5, 10, 5);
scene.add(luzDireccional);

const objetosInteractivos = []; 

// --- ESFERA ROSA ---
const geometriaEsfera = new THREE.SphereGeometry(0.8, 32, 32);
const materialEsfera = new THREE.MeshStandardMaterial({ color: 0xff66cc }); 
const esfera = new THREE.Mesh(geometriaEsfera, materialEsfera);
esfera.position.set(-2, 0.8, -1);
esfera.name = "Esfera Rosa";
// Asignar respuestas a la esfera
esfera.userData = {
    nombre: "Esfera Rosa",
    respuestas: `
        <p><b>¿Qué hace el renderer?</b><br>Calcula los gráficos matemáticamente y dibuja la escena 3D en el Canvas de la pantalla.</p>
        <p><b>¿Qué permite hacer OrbitControls?</b><br>Interactuar libremente con la cámara: rotarla, acercarla y alejarla usando el mouse.</p>
    `
};
scene.add(esfera);
objetosInteractivos.push(esfera);

// --- CUBO AZUL ---
const geometriaCubo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
const materialCubo = new THREE.MeshStandardMaterial({ color: 0x33ccff });
const cubo = new THREE.Mesh(geometriaCubo, materialCubo);
cubo.position.set(0, 0.6, -1);
cubo.name = "Cubo Azul";
// Asignar respuestas al cubo
cubo.userData = {
    nombre: "Cubo Azul",
    respuestas: `
        <p><b>¿Qué función cumple la escena?</b><br>Es el "mundo virtual" contenedor principal donde agregamos todos los modelos, luces y cámaras.</p>
        <p><b>¿Para qué sirve la cámara?</b><br>Define el punto de vista desde el cual el usuario observa este entorno 3D.</p>
    `
};
scene.add(cubo);
objetosInteractivos.push(cubo);

// --- PLANO BEIGE ---
const geometriaPlano = new THREE.PlaneGeometry(1.5, 1.5);
const materialPlano = new THREE.MeshStandardMaterial({ color: 0xd2b48c, side: THREE.DoubleSide });
const plano = new THREE.Mesh(geometriaPlano, materialPlano);
plano.position.set(2, 0.75, -1);
plano.name = "Plano Beige";
// Asignar respuestas al plano
plano.userData = {
    nombre: "Plano Beige",
    respuestas: `
        <p><b>¿Qué es el raycasting y para qué lo usaste?</b><br>Es una técnica que proyecta un rayo desde el mouse hacia la escena 3D. Lo usé para detectar qué figura tocas, cambiar su color y mostrar sus respuestas.</p>
    `
};
scene.add(plano);
objetosInteractivos.push(plano);

// 9. Cargar modelo 3D (Animal)
const loader = new THREE.GLTFLoader();
loader.load(
    'models/animal.glb',
    function (gltf) {
        const modelo = gltf.scene;
        modelo.position.set(0, 0, 1.5); 
        modelo.scale.set(0.5, 0.5, 0.5); 
        modelo.name = "Mi Animal 3D";
        scene.add(modelo);
        
        modelo.traverse((hijo) => {
            if (hijo.isMesh) {
                hijo.name = "Mi Animal 3D";
                // Asignar respuestas a todo el modelo GLB
                hijo.userData = {
                    nombre: "Modelo 3D Externo",
                    respuestas: `
                        <p><b>¿Qué dificultades tuviste al cargar .glb?</b><br>Separar el formato correcto para que cargaran bien las texturas, ajustar la escala para que no se viera gigante y asegurar su ruta en la carpeta local.</p>
                        <p><b>¿Cómo usarías este visor en proyectos reales?</b><br>Podría visualizar y analizar visualmente secuencias de genes o estructuras moleculares de bases de datos genómicas, crear entornos de simulación interactivos, o usarlo para inspeccionar modelos de videojuegos en el navegador.</p>
                    `
                };
                objetosInteractivos.push(hijo);
            }
        });
    }
);

// 7. OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 10. Raycasting interactivo con panel HTML
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objetosInteractivos);

    const panel = document.getElementById('panel-respuestas');

    if (intersects.length > 0) {
        const obj = intersects[0].object;
        
        // Cambiar color
        if (obj.material && obj.material.color) {
            obj.material.color.setHex(Math.random() * 0xffffff);
        }
        
        // Actualizar UI superior
        document.getElementById('ui-info').innerText = "Seleccionaste: " + obj.name;

        // Mostrar respuestas en el panel lateral
        if(obj.userData && obj.userData.respuestas) {
            document.getElementById('titulo-objeto').innerText = obj.userData.nombre;
            document.getElementById('contenido-respuestas').innerHTML = obj.userData.respuestas;
            panel.style.display = "block"; // Hace visible el panel
        }
    } else {
        // Si hace clic en el vacío, oculta el panel
        panel.style.display = "none";
        document.getElementById('ui-info').innerText = "Selecciona un objeto con el mouse";
    }
});

// 8. Animación
function animacion() {
    requestAnimationFrame(animacion);
    cubo.rotation.y += 0.01;
    esfera.rotation.x += 0.01;
    controls.update();
    renderer.render(scene, camera);
}
animacion();