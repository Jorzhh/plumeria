const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); 

const gridHelper = new THREE.GridHelper(15, 15);
scene.add(gridHelper);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 4, 6); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const luzAmbiental = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(luzAmbiental);
const luzDireccional = new THREE.DirectionalLight(0xffffff, 0.8);
luzDireccional.position.set(5, 10, 5);
scene.add(luzDireccional);

const objetosInteractivos = []; 

// ESFERA
const esfera = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 32, 32), 
    new THREE.MeshStandardMaterial({ color: 0xff66cc })
);
esfera.position.set(-2, 0.8, -1);
esfera.userData = {
    nombre: "Esfera Rosa",
    respuestas: `
        <p><b>¿Qué hace el renderer?</b><br>Calcula los gráficos matemáticamente y dibuja la escena 3D en la pantalla.</p>
        <p><b>¿Qué permite hacer OrbitControls?</b><br>Interactuar libremente con la cámara: rotarla, acercarla y alejarla con el mouse.</p>
    `
};
scene.add(esfera);
objetosInteractivos.push(esfera);

// CUBO
const cubo = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.2, 1.2), 
    new THREE.MeshStandardMaterial({ color: 0x33ccff })
);
cubo.position.set(0, 0.6, -1);
cubo.userData = {
    nombre: "Cubo Azul",
    respuestas: `
        <p><b>¿Qué función cumple la escena?</b><br>Es el "mundo virtual" contenedor donde agregamos todos los modelos, luces y cámaras.</p>
        <p><b>¿Para qué sirve la cámara?</b><br>Define el punto de vista desde el cual el usuario observa el entorno 3D.</p>
    `
};
scene.add(cubo);
objetosInteractivos.push(cubo);

// PLANO
const plano = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.5), 
    new THREE.MeshStandardMaterial({ color: 0xd2b48c, side: THREE.DoubleSide })
);
plano.position.set(2, 0.75, -1);
plano.userData = {
    nombre: "Plano Beige",
    respuestas: `
        <p><b>¿Qué es el raycasting y para qué lo usaste?</b><br>Es una técnica que proyecta un rayo desde el mouse hacia la escena. Lo usé para detectar qué figura tocas y mostrar sus respuestas.</p>
    `
};
scene.add(plano);
objetosInteractivos.push(plano);

// ANIMAL (GLB)
const loader = new THREE.GLTFLoader();
loader.load('models/animal.glb', function (gltf) {
    const modelo = gltf.scene;
    modelo.position.set(0, 0, 1.5); 
    modelo.scale.set(0.5, 0.5, 0.5); 
    modelo.rotation.y = Math.PI; // Rota 180 grados en radianes
    scene.add(modelo);
    
    modelo.traverse((hijo) => {
        if (hijo.isMesh) {
            hijo.userData = {
                nombre: "Modelo 3D Externo",
                respuestas: `
                    <p><b>¿Qué dificultades tuviste al cargar .glb?</b><br>Separar el formato correcto para que cargaran bien las texturas y ajustar la escala.</p>
                    <p><b>¿Cómo usarías esto en proyectos reales?</b><br>Para visualizar secuencias de genes o estructuras de bases de datos genómicas.</p>
                `
            };
            objetosInteractivos.push(hijo);
        }
    });
});

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// ==========================================
// FUNCIONALIDAD DE LOS BOTONES HTML Y EL PANEL
// ==========================================
const panel = document.getElementById('panel-respuestas');
const btnToggle = document.getElementById('btn-toggle-panel');
const btnCerrar = document.getElementById('btn-cerrar-panel');

btnToggle.addEventListener('click', () => {
    if (panel.style.display === "none" || panel.style.display === "") {
        panel.style.display = "block";
        btnToggle.innerText = "Ocultar Preguntas";
    } else {
        panel.style.display = "none";
        btnToggle.innerText = "Ver Preguntas";
    }
});

btnCerrar.addEventListener('click', () => {
    panel.style.display = "none";
    btnToggle.innerText = "Ver Preguntas";
});

// CLIC EN EL CANVAS (Para las figuras)
renderer.domElement.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objetosInteractivos, true);

    const info = document.getElementById('ui-info');

    if (intersects.length > 0) {
        const obj = intersects[0].object;
        
        if (obj.material && obj.material.color) {
            obj.material.color.setHex(Math.random() * 0xffffff);
        }
        
        if (info) info.innerText = "Seleccionaste: " + (obj.userData.nombre || "Objeto");

        // Actualizar el panel
        if (panel && obj.userData && obj.userData.respuestas) {
            document.getElementById('titulo-objeto').innerText = obj.userData.nombre;
            document.getElementById('contenido-respuestas').innerHTML = obj.userData.respuestas;
            
            // Mostrar panel automáticamente y sincronizar botón
            panel.style.display = "block";
            btnToggle.innerText = "Ocultar Preguntas";
        }
    } else {
        if (info) info.innerText = "Selecciona un objeto con el mouse";
    }
});

function animacion() {
    requestAnimationFrame(animacion);
    cubo.rotation.y += 0.01;
    esfera.rotation.x += 0.01;
    controls.update();
    renderer.render(scene, camera);
}
animacion();