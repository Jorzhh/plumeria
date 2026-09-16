import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 1, 2 y 3. Escena, Cámara y Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight * 0.7), 0.1, 1000);
camera.position.set(0, 3, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight * 0.7);
document.body.insertBefore(renderer.domElement, document.getElementById('teoria'));

// 7. OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 6. Iluminación
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// 4 y 5. Geometrías básicas y Materiales
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0x00ff88, roughness: 0.3 })
);
cube.position.set(-2, 0.5, 0);
cube.name = "Cubo Verde";
scene.add(cube);

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.7, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0xff4444, metalness: 0.2 })
);
sphere.position.set(2, 0.7, 0);
sphere.name = "Esfera Roja";
scene.add(sphere);

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({ color: 0x333333, side: THREE.DoubleSide })
);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// 9. Carga de modelo .glb
const loader = new GLTFLoader();
loader.load('models/objeto.glb', (gltf) => {
  const model = gltf.scene;
  model.position.set(0, 0, 0);
  model.scale.set(0.5, 0.5, 0.5);
  model.name = "Modelo GLTF External";
  scene.add(model);
}, undefined, (error) => {
  console.warn('Asegúrate de colocar un archivo .glb válido en la carpeta models/', error);
});

// 10 y 11. Raycasting e Interacción
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const infoDiv = document.getElementById('info');

window.addEventListener('click', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  if (event.clientY > rect.bottom) return;

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const selected = intersects[0].object;
    if (selected !== plane) {
      // Cambiar color aleatorio
      selected.material.color.setHex(Math.random() * 0xffffff);
      infoDiv.innerText = `Seleccionado: ${selected.name || 'Objeto 3D'}`;
      console.log('Información del objeto:', selected);
    }
  }
});

// 8. Bucle de Animación
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.y += 0.01;
  sphere.rotation.x += 0.01;
  controls.update();
  renderer.render(scene, camera);
}
animate();