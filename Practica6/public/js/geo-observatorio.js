import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const root = document.getElementById('geo-globe');

if (!root) {
  throw new Error('Falta #geo-globe');
}

const api = 'http://localhost:8086/api';

let selected = null;
let markerGroup = null;
let lastData = null;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x071622);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(0, 0, 7.4);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});

renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
root.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 4.4;
controls.maxDistance = 11;

scene.add(new THREE.AmbientLight(0xffffff, 1.8));

const sun = new THREE.DirectionalLight(0xffffff, 2.4);
sun.position.set(-4, 3, 6);
scene.add(sun);

/*
 * Carga una imagen terrestre con los continentes.
 * Requiere conexión a internet.
 */
function makeMapTexture() {
  const texture = new THREE.TextureLoader().load(
    'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
    undefined,
    undefined,
    (error) => {
      console.error('No se pudo cargar el mapa terrestre:', error);
    }
  );

  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const globe = new THREE.Mesh(
  new THREE.SphereGeometry(2.5, 96, 64),
  new THREE.MeshStandardMaterial({
    map: makeMapTexture(),
    roughness: 0.92,
    metalness: 0.02
  })
);

scene.add(globe);

const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(2.57, 64, 48),
  new THREE.MeshBasicMaterial({
    color: 0x53c7e8,
    transparent: true,
    opacity: 0.09,
    side: THREE.BackSide
  })
);

scene.add(atmosphere);

markerGroup = new THREE.Group();
scene.add(markerGroup);

function xyz(lat, lon, radius = 2.53) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function addMarker(lat, lon, color, size = 0.045) {
  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(size, 12, 10),
    new THREE.MeshBasicMaterial({ color })
  );

  marker.position.copy(xyz(lat, lon, 2.55));
  markerGroup.add(marker);

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(size * 2.3, 12, 10),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.25
    })
  );

  halo.position.copy(marker.position);
  markerGroup.add(halo);
}

function setPins(points = [], ab = []) {
  markerGroup.clear();

  if (selected) {
    addMarker(selected.lat, selected.lon, 0xffdf55, 0.075);
  }

  for (const point of points.slice(0, 180)) {
    addMarker(point.lat, point.lon, 0xc28aff, 0.025);
  }

  for (const [index, point] of ab.entries()) {
    addMarker(
      point.lat,
      point.lon,
      index === 0 ? 0xff8755 : 0x60d5ff,
      0.07
    );
  }

  if (ab.length === 2) {
    const point1 = xyz(ab[0].lat, ab[0].lon, 2.57);
    const point2 = xyz(ab[1].lat, ab[1].lon, 2.57);

    const controlPoint = point1
      .clone()
      .add(point2)
      .normalize()
      .multiplyScalar(3.15);

    const curve = new THREE.QuadraticBezierCurve3(
      point1,
      controlPoint,
      point2
    );

    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)),
      new THREE.LineBasicMaterial({
        color: 0xff9d55,
        transparent: true,
        opacity: 0.85
      })
    );

    markerGroup.add(line);
  }
}

function resize() {
  const width = root.clientWidth || 600;
  const height = root.clientHeight || 500;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

new ResizeObserver(resize).observe(root);
resize();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

async function get(path, options) {
  const response = await fetch(api + path, options);
  const json = await response.json();

  if (!response.ok || json.status === 'error') {
    throw new Error(json.message || `HTTP ${response.status}`);
  }

  return json.data;
}

function qcoords(lat, lon) {
  return `lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
}

function esc(value) {
  return String(value ?? '—').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));
}

function scoreLocal(climate, soil, count) {
  const temperature = Number(climate.temperatura_media_c ?? 25);
  const rain = Number(climate.precipitacion_total_mm ?? 0);
  const rawPh = soil?.propiedades?.phh2o?.valor;
  const ph = Number.isFinite(Number(rawPh)) ? Number(rawPh) / 10 : null;

  return Math.round(
    Math.max(0, 100 - Math.abs(temperature - 25) * 4) * 0.3 +
    Math.min(100, rain / 4) * 0.25 +
    (ph === null ? 50 : Math.max(0, 100 - Math.abs(ph - 6.5) * 25)) * 0.25 +
    (count > 0 ? 100 : 35) * 0.2
  );
}

async function fetchLocation(lat, lon, { save = true } = {}) {
  const species =
    document.getElementById('geo-species').value.trim() || 'Plumeria rubra';

  const coordinates = qcoords(lat, lon);

  const settled = await Promise.allSettled([
    get('/geo/clima?' + coordinates),
    get('/geo/historico?' + coordinates),
    get('/geo/nasa?' + coordinates),
    get('/geo/suelo?' + coordinates),
    get(
      '/geo/ocurrencias?' +
      coordinates +
      '&especie=' +
      encodeURIComponent(species)
    ),
    get('/geo/lugar?' + coordinates)
  ]);

  const value = index =>
    settled[index].status === 'fulfilled' ? settled[index].value : null;

  const climate = value(1) || value(2) || {};
  const soil = value(3) || {};
  const occurrences = value(4) || {};
  const place = value(5) || {};

  let score = scoreLocal(climate, soil, occurrences.total || 0);
  let saved = null;

  if (save) {
    try {
      saved = await get('/geo/analisis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat,
          lon,
          nombre_lugar:
            place.nombre ||
            place.display_name ||
            `${lat.toFixed(3)}, ${lon.toFixed(3)}`,
          especie_id: document.getElementById('sel-especie')?.value || null,
          clima: climate,
          suelo: soil,
          ocurrencias_gbif: occurrences.total || 0
        })
      });

      score = saved.indice_idoneidad;
    } catch (error) {
      console.warn('No se pudo guardar el análisis:', error.message);
    }
  }

  return {
    lat,
    lon,
    place,
    weather: value(0),
    climate,
    nasa: value(2),
    soil,
    occ: occurrences,
    score,
    saved,
    errors: settled
      .map((result, index) =>
        result.status === 'rejected'
          ? `${[
              'Open-Meteo',
              'Histórico',
              'NASA POWER',
              'SoilGrids',
              'GBIF',
              'Geocodificación'
            ][index]}: ${result.reason.message}`
          : null
      )
      .filter(Boolean)
  };
}

function renderData(data) {
  const weather = data.weather?.actual || {};
  const climate = data.climate || {};
  const nasa = data.nasa || {};
  const soil = data.soil?.propiedades || {};
  const occurrences = data.occ || {};

  const location = esc(
    data.place?.nombre ||
    data.place?.display_name ||
    `${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}`
  );

  const html = `
    <div class="geo-card">
      <strong>Ubicación · ${location}</strong>
      <p>
        ${esc(data.place?.pais || 'País sin identificar')}
        · ${esc(data.place?.atribucion || '')}
      </p>
    </div>

    <div class="geo-card">
      <strong>Clima actual · Open-Meteo</strong>
      <p>
        Temperatura: ${esc(weather.temperatura_c)} °C
        · Humedad: ${esc(weather.humedad_relativa_pct)}%
        · Lluvia: ${esc(weather.precipitacion_mm)} mm
      </p>
    </div>

    <div class="geo-card">
      <strong>Histórico climático · ${esc(climate.fuente || nasa.fuente || 'Sin datos')}</strong>
      <p>
        Media: ${esc(climate.temperatura_media_c ?? nasa.temperatura_media_c)} °C
        · Precipitación: ${esc(climate.precipitacion_total_mm ?? nasa.precipitacion_total_mm)} mm/año
        · Radiación: ${esc(climate.radiacion_media_mj_m2_dia ?? nasa.radiacion_media_mj_m2_dia)} MJ/m²/día
      </p>
    </div>

    <div class="geo-card">
      <strong>Suelo · SoilGrids</strong>
      <p>
        Arcilla: ${esc(soil.clay?.valor)}
        · Arena: ${esc(soil.sand?.valor)}
        · Carbono: ${esc(soil.soc?.valor)}
        · pH×10: ${esc(soil.phh2o?.valor)}
      </p>
    </div>

    <div class="geo-card">
      <strong>Biodiversidad · GBIF</strong>
      <p>
        ${esc(occurrences.nombre_aceptado || occurrences.nombre_consultado)}:
        ${esc(occurrences.total)} ocurrencias en radio aproximado de 0.5°.
      </p>
    </div>

    <div class="geo-card">
      <strong>Idoneidad estimada: ${data.score}/100</strong>
      <p>
        Temperatura 30% · precipitación 25% · pH 25% · evidencia GBIF 20%.
      </p>
    </div>

    ${
      data.errors.length
        ? `
          <div class="geo-card">
            <strong>Fuentes sin respuesta</strong>
            <p>${data.errors.map(esc).join('<br>')}</p>
          </div>
        `
        : ''
    }
  `;

  document.getElementById('geo-summary').innerHTML = html;
  document.getElementById('geo-map-card').innerHTML =
    `<h3>Idoneidad: ${data.score}/100</h3>${html}`;

  document.getElementById('geo-map-coordinates').textContent =
    data.place?.nombre ||
    `${data.lat.toFixed(4)}°, ${data.lon.toFixed(4)}°`;

  document.getElementById('geo-status').textContent = data.saved
    ? 'Datos consultados y análisis guardado en MySQL.'
    : 'Datos consultados; MySQL no confirmó el guardado.';

  document.getElementById('geo-run-sim').disabled = false;
  setPins(data.occ?.puntos || []);
}

async function consult(
  lat = Number(document.getElementById('geo-lat').value),
  lon = Number(document.getElementById('geo-lon').value)
) {
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    Math.abs(lat) > 90 ||
    Math.abs(lon) > 180
  ) {
    document.getElementById('geo-status').textContent =
      'Revisa las coordenadas: latitud ±90, longitud ±180.';
    return null;
  }

  selected = { lat, lon };

  document.getElementById('geo-lat').value = lat.toFixed(4);
  document.getElementById('geo-lon').value = lon.toFixed(4);

  setPins();

  document.getElementById('geo-status').textContent =
    'Consultando Open-Meteo, NASA POWER, SoilGrids y GBIF…';

  try {
    lastData = await fetchLocation(lat, lon);
    renderData(lastData);
    return lastData;
  } catch (error) {
    document.getElementById('geo-status').textContent =
      `No se pudo cargar el análisis: ${error.message}`;
    return null;
  }
}

document
  .getElementById('geo-query')
  .addEventListener('click', () => consult());

renderer.domElement.addEventListener('click', async event => {
  if (controls.state !== -1 && controls.state !== 0) return;

  const rect = renderer.domElement.getBoundingClientRect();

  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const hit = raycaster.intersectObject(globe);
  if (!hit.length) return;

  const point = hit[0].point.clone().normalize();
  const lat = Math.asin(point.y) * 180 / Math.PI;
  const lon = Math.atan2(-point.z, point.x) * 180 / Math.PI;

  await consult(lat, lon);
});

function setControl(id, value) {
  const element = document.getElementById(id);

  if (!element || !Number.isFinite(Number(value))) return;

  element.value = String(value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
}

document
  .getElementById('geo-run-sim')
  .addEventListener('click', () => {
    if (!lastData) return;

    const climate = lastData.climate || lastData.nasa || {};
    const weather = lastData.weather?.actual || {};

    const temperature = Number(
      climate.temperatura_media_c ?? weather.temperatura_c
    );

    if (Number.isFinite(temperature)) {
      setControl(
        'slider-temp',
        Math.min(45, Math.max(5, Math.round(temperature)))
      );
    }

    const radiation = Number(
      climate.radiacion_media_mj_m2_dia ??
      lastData.nasa?.radiacion_media_mj_m2_dia
    );

    if (Number.isFinite(radiation)) {
      setControl(
        'slider-luz',
        Math.min(2500, Math.max(100, Math.round(radiation * 24)))
      );
    }

    const rain = Number(
      climate.precipitacion_total_mm ??
      lastData.nasa?.precipitacion_total_mm
    );

    const clay = Number(lastData.soil?.propiedades?.clay?.valor) / 10;

    if (Number.isFinite(rain)) {
      const waterProxy = Math.max(
        15,
        Math.min(
          90,
          Math.round(25 + rain / 50 + (Number.isFinite(clay) ? clay * 0.15 : 0))
        )
      );

      setControl('slider-agua', waterProxy);
    }

    const phRaw = Number(lastData.soil?.propiedades?.phh2o?.valor);

    if (Number.isFinite(phRaw)) {
      const ph = phRaw / 10;
      const nutrientProxy = Math.max(
        15,
        Math.min(90, Math.round(90 - Math.abs(ph - 6.5) * 18))
      );

      setControl('slider-nutrientes', nutrientProxy);
    }

    const notes = document.getElementById('input-sim-notas');

    if (notes) {
      notes.value =
        `Ubicación ${lastData.place?.nombre || `${lastData.lat.toFixed(4)}, ${lastData.lon.toFixed(4)}`}. ` +
        `Temperatura media ${climate.temperatura_media_c ?? weather.temperatura_c ?? 'sin dato'} °C; ` +
        `precipitación anual ${climate.precipitacion_total_mm ?? lastData.nasa?.precipitacion_total_mm ?? 'sin dato'} mm; ` +
        `radiación media ${climate.radiacion_media_mj_m2_dia ?? lastData.nasa?.radiacion_media_mj_m2_dia ?? 'sin dato'} MJ/m²/día; ` +
        `SoilGrids pH×10 ${lastData.soil?.propiedades?.phh2o?.valor ?? 'sin dato'}; ` +
        `registros GBIF ${lastData.occ?.total ?? 0}. ` +
        `La precipitación queda como contexto, no como medición de humedad del sustrato. ` +
        `Idoneidad ${lastData.score}/100.`;
    }

    document.querySelector('[data-tab="tab-cultivo"]').click();
    document.getElementById('btn-sim-play')?.click();
  });

function parsePair(id) {
  const parts = document
    .getElementById(id)
    .value.split(',')
    .map(Number);

  return (
    parts.length === 2 &&
    parts.every(Number.isFinite) &&
    Math.abs(parts[0]) <= 90 &&
    Math.abs(parts[1]) <= 180
  )
    ? parts
    : null;
}

document
  .getElementById('geo-compare')
  .addEventListener('click', async () => {
    const a = parsePair('geo-a');
    const b = parsePair('geo-b');
    const output = document.getElementById('geo-ab-result');

    if (!a || !b) {
      output.textContent =
        'Usa el formato latitud, longitud en ambos campos.';
      return;
    }

    output.textContent = 'Consultando y comparando ubicaciones…';

    try {
      const [dataA, dataB] = await Promise.all([
        fetchLocation(a[0], a[1]),
        fetchLocation(b[0], b[1])
      ]);

      setPins(
        [
          ...(dataA.occ?.puntos || []),
          ...(dataB.occ?.puntos || [])
        ],
        [
          { lat: a[0], lon: a[1] },
          { lat: b[0], lon: b[1] }
        ]
      );

      const winner =
        dataA.score === dataB.score
          ? 'Empate'
          : dataA.score > dataB.score
            ? 'Ubicación A'
            : 'Ubicación B';

      output.innerHTML = `
        <div class="geo-card">
          <strong>${winner}</strong>
          <p>
            A: ${dataA.score}/100 · ${a[0]}, ${a[1]}<br>
            B: ${dataB.score}/100 · ${b[0]}, ${b[1]}
          </p>
          <p>
            El índice pondera temperatura, precipitación anual, pH y registros GBIF.
          </p>
        </div>
      `;

      await refreshRanking();
    } catch (error) {
      output.textContent = `No se pudo comparar: ${error.message}`;
    }
  });

async function loadGeoSites() {
  const select = document.getElementById('geo-preset');

  try {
    const sites = await get('/geo/ubicaciones');

    select.innerHTML =
      '<option value="">Elige una ubicación…</option>';

    for (const site of sites) {
      const option = document.createElement('option');

      option.value = `${Number(site.lat)},${Number(site.lon)}`;
      option.textContent = `${site.nombre}, ${site.pais}`;

      select.appendChild(option);
    }
  } catch (error) {
    select.innerHTML =
      '<option value="">Importa schema.sql y seed.sql para cargar ejemplos</option>';
  }
}

document
  .getElementById('geo-preset')
  .addEventListener('change', () => {
    const pair = parsePair('geo-preset');
    if (!pair) return;

    const name =
      document.getElementById('geo-preset').selectedOptions[0]?.textContent || '';

    if (name.toLowerCase().includes('córdoba')) {
      document.getElementById('geo-b').value = `${pair[0]}, ${pair[1]}`;
    } else {
      document.getElementById('geo-a').value = `${pair[0]}, ${pair[1]}`;
    }
  });

async function refreshRanking() {
  const list = document.getElementById('geo-ranking');

  try {
    const rows = await get('/geo/ranking');

    list.innerHTML = rows.length
      ? rows
          .slice(0, 10)
          .map(
            row => `
              <li>
                <strong>${esc(row.especie || 'Cultivo')}</strong>
                · ${esc(row.indice_idoneidad)}/100<br>
                ${esc(row.nombre_lugar || `${row.lat}, ${row.lon}`)}
                · GBIF ${esc(row.ocurrencias_gbif)}
              </li>
            `
          )
          .join('')
      : '<li>Aún no hay análisis guardados.</li>';
  } catch (error) {
    list.innerHTML =
      '<li>No se pudo cargar el ranking; revisa MySQL y schema.sql.</li>';
  }
}

document
  .getElementById('geo-ranking-refresh')
  .addEventListener('click', refreshRanking);

refreshRanking();
loadGeoSites();

for (const tab of document.querySelectorAll('.tab-btn')) {
  tab.addEventListener('click', () => {
    const active = tab.dataset.tab === 'tab-observatorio';

    document.getElementById('geo-observatory').hidden = !active;
    document.body.classList.toggle('geo-mode', active);

    if (active) resize();
  });
}

document.getElementById('geo-observatory').hidden = true;

window.GeoObservatory = {
  linkSimulation: async simulationId => {
    if (!lastData?.saved?.id) return;

    return get(
      `/geo/analisis/${lastData.saved.id}/simulacion`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulacion_id: simulationId })
      }
    );
  }
};