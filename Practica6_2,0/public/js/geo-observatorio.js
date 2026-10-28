import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const root = document.getElementById('geo-globe');

if (!root) {
  throw new Error('Falta #geo-globe');
}

const api = window.API_BASE || (() => {
  const url = new URL('/api', window.location.href);
  url.port = '8086';
  return url.toString().replace(/\/$/, '');
})();

let selected = null;
let markerGroup = null;
let lastData = null;
let latestConsultation = 0;
const speciesCatalog = new Map();

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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35000);
  let response;
  let json;
  try {
    response = await fetch(api + path, { ...options, signal: options?.signal || controller.signal });
    json = await response.json();
  } finally {
    clearTimeout(timeout);
  }

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

function numeric(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function firstNumeric(...values) {
  for (const value of values) {
    const parsed = numeric(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

function selectedSpecies() {
  return speciesCatalog.get(String(document.getElementById('geo-species').value)) || null;
}

function soilPercent(soil, property) {
  const entry = soil?.propiedades?.[property];
  const value = numeric(entry?.valor);
  if (value === null) return null;
  const unit = String(entry?.unidad || '').toLowerCase();
  const percent = unit.includes('g/kg') ? value / 10 :
    (unit.includes('%') || unit.includes('percent') ? value : value / 10);
  return percent >= 0 && percent <= 100 ? percent : null;
}

function temperatureScore(value, species) {
  const optimal = numeric(species?.temp_optima) ?? 25;
  const minimum = numeric(species?.temp_min) ?? optimal - 15;
  const maximum = numeric(species?.temp_max) ?? optimal + 10;
  const span = value <= optimal
    ? Math.max(1, optimal - minimum)
    : Math.max(1, maximum - optimal);
  return Math.max(0, Math.min(100, 100 - Math.abs(value - optimal) / span * 100));
}

function scoreLocal(climate, soil, occurrences, species) {
  const weights = {
    temperatura: 0.25,
    precipitacion: 0.25,
    suelo_ph: 0.20,
    textura_suelo: 0.20,
    evidencia_gbif: 0.10
  };
  const components = {};
  const temperature = numeric(climate.temperatura_media_c);
  const rain = numeric(climate.precipitacion_total_mm);
  const rawPh = numeric(soil?.propiedades?.phh2o?.valor);
  const ph = rawPh === null ? null : rawPh / 10;
  const clay = soilPercent(soil, 'clay');
  const sand = soilPercent(soil, 'sand');

  if (temperature !== null) components.temperatura = temperatureScore(temperature, species);
  if (rain !== null) components.precipitacion = Math.max(0, Math.min(100, rain / 4));
  if (ph !== null) components.suelo_ph = Math.max(0, Math.min(100, 100 - Math.abs(ph - 6.5) * 25));
  if (clay !== null && sand !== null) {
    const clayPenalty = clay < 15 ? (15 - clay) * 2 : (clay > 35 ? (clay - 35) * 2 : 0);
    const sandPenalty = sand < 20 ? (20 - sand) * 1.2 : (sand > 65 ? (sand - 65) * 1.2 : 0);
    components.textura_suelo = Math.max(0, Math.min(100, 100 - clayPenalty - sandPenalty));
  }
  if (occurrences !== null) {
    components.evidencia_gbif = occurrences === 0
      ? 0
      : Math.max(0, Math.min(100, Math.log10(occurrences + 1) / Math.log10(11) * 100));
  }

  const available = Object.entries(components);
  const availableWeight = available.reduce((sum, [key]) => sum + weights[key], 0);
  const score = availableWeight > 0
    ? Math.round(available.reduce((sum, [key, value]) => sum + value * weights[key], 0) / availableWeight)
    : null;
  const recommendations = [];
  if (rain !== null && rain < 400) recommendations.push({ prioridad: 'crítica', mensaje: 'Precipitación anual inferior a 400 mm: planifica riego suplementario.' });
  if (temperature !== null && temperature > 35) recommendations.push({ prioridad: 'alta', mensaje: 'Temperatura media superior a 35 °C: evalúa una variedad con tolerancia al calor.' });
  if (occurrences === 0) recommendations.push({ prioridad: 'alta', mensaje: 'GBIF no reporta ocurrencias cercanas para esta especie; la adaptación local tiene más incertidumbre.' });
  if (ph !== null && ph < 5.5) recommendations.push({ prioridad: 'media', mensaje: 'Suelo ácido (pH menor a 5.5): analiza una muestra de parcela antes de encalar.' });
  if (clay !== null && clay >= 40) recommendations.push({ prioridad: 'media', mensaje: 'Contenido de arcilla alto (≥40%): revisa drenaje y riesgo de compactación.' });
  else if (sand !== null && clay !== null && sand >= 75 && clay <= 10) recommendations.push({ prioridad: 'media', mensaje: 'Suelo predominantemente arenoso: vigila retención de agua y materia orgánica.' });
  const radiation = numeric(climate.radiacion_media_mj_m2_dia);
  if (radiation !== null && radiation > 25) recommendations.push({ prioridad: 'media', mensaje: 'Radiación superior a 25 MJ/m²/día: evalúa sombra parcial según la especie.' });
  if (score === null) recommendations.push({ prioridad: 'baja', mensaje: 'No hay suficientes variables disponibles para calcular un índice de idoneidad.' });
  else if (available.length < Object.keys(weights).length) recommendations.push({ prioridad: 'baja', mensaje: 'El índice se normalizó con las variables disponibles; interpreta el resultado con cautela.' });
  else if (!recommendations.length) recommendations.push({ prioridad: 'baja', mensaje: 'Sin alertas en las variables observadas; valida la decisión con datos de parcela.' });
  return { score, components, weights, recommendations };
}

function mergedClimate(historical, nasa) {
  const history = historical || {};
  const power = nasa || {};
  const metrics = [
    'temperatura_media_c',
    'precipitacion_total_mm',
    'radiacion_media_mj_m2_dia',
    'evapotranspiracion_media_mm_dia'
  ];
  const merged = {};
  const sources = new Set();
  const periods = new Map();

  for (const key of metrics) {
    const historyValue = numeric(history[key]);
    const powerValue = numeric(power[key]);
    merged[key] = historyValue ?? powerValue;
    const source = historyValue !== null ? history.fuente : (powerValue !== null ? power.fuente : null);
    if (source) {
      sources.add(source);
      const period = source === history.fuente ? history.periodo : power.periodo;
      if (period) periods.set(source, period);
    }
  }
  merged.fuente = [...sources].filter(Boolean).join(' + ') || 'Sin datos históricos';
  merged.periodos = [...periods.entries()].map(([fuente, periodo]) => ({ fuente, ...periodo }));
  merged.periodo = periods.size === 1 ? [...periods.values()][0] : null;
  merged.dias = history.dias ?? power.dias ?? null;
  return merged;
}

async function fetchLocation(lat, lon, { save = true, species = selectedSpecies() } = {}) {
  if (!species) throw new Error('Selecciona una especie del catálogo antes de consultar.');

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
      encodeURIComponent(species.nombre_cientifico)
    ),
    get('/geo/lugar?' + coordinates)
  ]);

  const value = index =>
    settled[index].status === 'fulfilled' ? settled[index].value : null;

  const historical = value(1) || {};
  const nasa = value(2) || {};
  const climate = mergedClimate(historical, nasa);
  const soil = value(3) || {};
  const occurrences = value(4) || {};
  const place = value(5) || {};
  const occurrenceCount = occurrences.disponible === false ? null : numeric(occurrences.total);
  const localFit = scoreLocal(climate, soil, occurrenceCount, species);
  let score = localFit.score;
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
          especie_id: species.id,
          clima: climate,
          suelo: soil,
          ocurrencias_gbif: occurrenceCount
        })
      });

      score = saved.indice_idoneidad ?? localFit.score;
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
    nasa,
    soil,
    occ: occurrences,
    species,
    score,
    components: saved?.componentes || localFit.components,
    weights: saved?.pesos || localFit.weights,
    recommendations: saved?.recomendaciones || localFit.recommendations,
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
  const soilData = data.soil || {};
  const soil = soilData.propiedades || {};
  const occurrences = data.occ || {};
  const labels = {
    temperatura: 'Temperatura de la especie · 25%',
    precipitacion: 'Precipitación anual · 25%',
    suelo_ph: 'pH del suelo · 20%',
    textura_suelo: 'Textura general · 20%',
    evidencia_gbif: 'Evidencia GBIF · 10%'
  };
  const format = (value, digits = 1) => {
    const parsed = numeric(value);
    return parsed === null ? 'Sin dato' : parsed.toLocaleString('es-MX', { maximumFractionDigits: digits });
  };
  const scoreLabel = data.score === null ? 'Datos insuficientes' : `${esc(data.score)}/100`;
  const availableComponents = Object.keys(data.components || {}).length;
  const periodDescription = (climate.periodos || []).map(period =>
    `${period.fuente}: ${period.inicio} – ${period.fin}`
  ).join('; ') || (climate.periodo ? `${climate.periodo.inicio} – ${climate.periodo.fin}` : 'Periodo no disponible');
  const componentRows = Object.entries(data.components || {}).map(([key, value]) => `
    <div class="geo-component">
      <div><span>${esc(labels[key] || key)}</span><strong>${format(value, 0)}</strong></div>
      <span class="geo-component-track"><i style="width:${Math.max(0, Math.min(100, Number(value) || 0))}%"></i></span>
    </div>
  `).join('');
  const recommendations = (data.recommendations || []).map(item => `
    <li class="geo-advice geo-advice-${esc(item.prioridad)}"><span>${esc(item.prioridad)}</span>${esc(item.mensaje)}</li>
  `).join('');
  const occurrenceCount = occurrences.disponible === false ? 'Sin coincidencia' : format(occurrences.total, 0);
  const rawPh = numeric(soil.phh2o?.valor);
  const ph = rawPh === null ? null : rawPh / 10;

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
        Temperatura: ${format(weather.temperatura_c)} °C
        · Humedad relativa: ${format(weather.humedad_relativa_pct, 0)}%
        · Lluvia actual: ${format(weather.precipitacion_mm)} mm
      </p>
    </div>

    <div class="geo-card">
      <strong>Histórico climático · ${esc(climate.fuente || nasa.fuente || 'Sin datos')}</strong>
      <p>
        Media: ${format(climate.temperatura_media_c)} °C
        · Precipitación: ${format(climate.precipitacion_total_mm, 0)} mm
        · Radiación: ${format(climate.radiacion_media_mj_m2_dia)} MJ/m²/día<br>
        Periodo de referencia: ${esc(periodDescription)}
      </p>
    </div>

    <div class="geo-card">
      <strong>Suelo · SoilGrids</strong>
      <p>
        Arcilla: ${format(soilPercent(soilData, 'clay'))}%
        · Arena: ${format(soilPercent(soilData, 'sand'))}%
        · Carbono orgánico: ${format(soil.soc?.valor)} ${esc(soil.soc?.unidad || '')}
        · pH: ${format(ph)}
      </p>
    </div>

    <div class="geo-card">
      <strong>Biodiversidad · GBIF</strong>
      <p>
        ${esc(occurrences.nombre_aceptado || occurrences.nombre_consultado || data.species.nombre_cientifico)}:
        ${esc(occurrenceCount)} registros en ventana aproximada de 1° × 1°; ${esc(occurrences.limite_mostrado ?? 0)} puntos visibles.
      </p>
    </div>

    <div class="geo-card">
      <strong>Idoneidad orientativa · ${scoreLabel}</strong>
      <p>${availableComponents}/5 variables disponibles. Temperatura usa el rango de ${esc(data.species.nombre_comun)}; lluvia, pH y textura usan umbrales generales.</p>
      ${componentRows || '<p>No hay componentes disponibles.</p>'}
    </div>

    <div class="geo-card">
      <strong>Recomendaciones geo-agronómicas</strong>
      <ul class="geo-advice-list">${recommendations || '<li>Sin recomendaciones disponibles.</li>'}</ul>
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
  document.getElementById('geo-map-card').innerHTML = `<h3>Idoneidad orientativa · ${scoreLabel}</h3>${html}`;

  document.getElementById('geo-map-coordinates').textContent =
    data.place?.nombre ||
    `${data.lat.toFixed(4)}°, ${data.lon.toFixed(4)}°`;

  const sourceStatus = data.errors.length ? ` ${data.errors.length} fuente(s) sin respuesta.` : '';
  document.getElementById('geo-status').textContent = data.saved
    ? `Consulta guardada en MySQL.${data.score === null ? ' No hubo datos suficientes para puntuar.' : ''}${sourceStatus}`
    : `Datos consultados; MySQL no confirmó el guardado.${sourceStatus}`;

  document.getElementById('geo-run-sim').disabled = false;
  setPins(data.occ?.puntos || []);
}

async function consult(
  lat = Number(document.getElementById('geo-lat').value),
  lon = Number(document.getElementById('geo-lon').value)
) {
  const status = document.getElementById('geo-status');
  const queryButton = document.getElementById('geo-query');
  const species = selectedSpecies();
  if (!species) {
    status.textContent = 'Carga el catálogo de especies y elige una antes de consultar.';
    return null;
  }

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    Math.abs(lat) > 90 ||
    Math.abs(lon) > 180
  ) {
    status.textContent = 'Revisa las coordenadas: latitud ±90, longitud ±180.';
    return null;
  }

  const requestId = ++latestConsultation;
  selected = { lat, lon };
  lastData = null;
  document.getElementById('geo-run-sim').disabled = true;
  queryButton.disabled = true;

  document.getElementById('geo-lat').value = lat.toFixed(4);
  document.getElementById('geo-lon').value = lon.toFixed(4);

  setPins();

  status.textContent = `Consultando ${species.nombre_comun}, clima, suelo y ocurrencias GBIF…`;

  try {
    const result = await fetchLocation(lat, lon, { species });
    if (requestId !== latestConsultation) return null;
    lastData = result;
    renderData(lastData);
    return lastData;
  } catch (error) {
    if (requestId === latestConsultation) status.textContent = `No se pudo cargar el análisis: ${error.message}`;
    return null;
  } finally {
    if (requestId === latestConsultation) queryButton.disabled = false;
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

    const speciesSelect = document.getElementById('sel-especie');
    if (speciesSelect && String(speciesSelect.value) !== String(lastData.species.id)) {
      speciesSelect.value = lastData.species.id;
      speciesSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const climate = lastData.climate || lastData.nasa || {};
    const weather = lastData.weather?.actual || {};

    const temperature = firstNumeric(climate.temperatura_media_c, weather.temperatura_c);

    if (Number.isFinite(temperature)) {
      setControl(
        'slider-temp',
        Math.min(45, Math.max(5, Math.round(temperature)))
      );
    }

    const radiation = firstNumeric(
      climate.radiacion_media_mj_m2_dia,
      lastData.nasa?.radiacion_media_mj_m2_dia
    );

    if (Number.isFinite(radiation)) {
      setControl(
        'slider-luz',
        Math.min(2500, Math.max(100, Math.round(radiation * 24)))
      );
    }

    const rain = firstNumeric(
      climate.precipitacion_total_mm,
      lastData.nasa?.precipitacion_total_mm
    );
    const clay = soilPercent(lastData.soil, 'clay');

    if (Number.isFinite(rain)) {
      const waterProxy = Math.max(
        15,
        Math.min(
          90,
          Math.round(25 + rain / 50 + (clay !== null ? clay * 0.15 : 0))
        )
      );

      setControl('slider-agua', waterProxy);
    }

    const phRaw = numeric(lastData.soil?.propiedades?.phh2o?.valor);

    if (phRaw !== null) {
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
        `SoilGrids pH ${numeric(lastData.soil?.propiedades?.phh2o?.valor) === null ? 'sin dato' : (Number(lastData.soil.propiedades.phh2o.valor) / 10).toFixed(1)}; ` +
        `registros GBIF ${lastData.occ?.disponible === false ? 'sin coincidencia' : (lastData.occ?.total ?? 'sin dato')}. ` +
        `La precipitación queda como contexto, no como medición de humedad del sustrato. ` +
        `Idoneidad ${lastData.score === null ? 'sin datos suficientes' : `${lastData.score}/100`}.`;
    }

    document.querySelector('[data-tab="tab-cultivo"]').click();
    document.getElementById('btn-sim-play')?.click();
  });

function parsePair(id) {
  const rawParts = document.getElementById(id).value.split(',').map(value => value.trim());
  if (rawParts.length !== 2 || rawParts.some(value => value === '')) return null;
  const parts = rawParts.map(Number);

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

    const species = selectedSpecies();
    if (!species) {
      output.textContent = 'Selecciona una especie del catálogo antes de comparar.';
      return;
    }

    output.textContent = 'Consultando y comparando ubicaciones…';
    const compareButton = document.getElementById('geo-compare');
    compareButton.disabled = true;

    try {
      const [dataA, dataB] = await Promise.all([
        fetchLocation(a[0], a[1], { species }),
        fetchLocation(b[0], b[1], { species })
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

      const winner = dataA.score === null || dataB.score === null
        ? 'Faltan datos para declarar un ganador'
        : dataA.score === dataB.score
          ? 'Empate técnico'
          : dataA.score > dataB.score
            ? 'Mejor índice: ubicación A'
            : 'Mejor índice: ubicación B';

      const comparisonCard = (label, data) => {
        const place = data.place?.nombre || `${data.lat.toFixed(3)}, ${data.lon.toFixed(3)}`;
        const pHValue = numeric(data.soil?.propiedades?.phh2o?.valor);
        return `
          <div class="geo-card">
            <strong>${label} · ${esc(place)}</strong>
            <p>
              Idoneidad ${data.score === null ? 'sin datos' : `${esc(data.score)}/100`}
              · Temp. ${esc(numeric(data.climate.temperatura_media_c) === null ? '—' : `${Number(data.climate.temperatura_media_c).toFixed(1)} °C`)}
              · Lluvia ${esc(numeric(data.climate.precipitacion_total_mm) === null ? '—' : `${Math.round(Number(data.climate.precipitacion_total_mm))} mm`)}<br>
              pH ${esc(pHValue === null ? '—' : (pHValue / 10).toFixed(1))}
              · GBIF ${esc(data.occ.disponible === false ? 'sin coincidencia' : (data.occ.total ?? '—'))}
            </p>
          </div>
        `;
      };

      output.innerHTML = `
        <div class="geo-card">
          <strong>${winner}</strong>
          <p>
            Comparación de ${esc(species.nombre_comun)} (${esc(species.nombre_cientifico)}).
          </p>
        </div>
        ${comparisonCard('Ubicación A', dataA)}
        ${comparisonCard('Ubicación B', dataB)}
        <p class="geo-help">El ganador es quien tiene mayor índice orientativo con las variables disponibles. Revisa los componentes y alertas antes de decidir.</p>
      `;

      await refreshRanking();
    } catch (error) {
      output.textContent = `No se pudo comparar: ${error.message}`;
    } finally {
      compareButton.disabled = false;
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
      '<option value="">Inicia MySQL y carga schema.sql + seed.sql</option>';
  }
}

async function loadSpeciesCatalog() {
  const select = document.getElementById('geo-species');
  const queryButton = document.getElementById('geo-query');
  const compareButton = document.getElementById('geo-compare');
  try {
    const species = await window.API.getEspecies();
    if (!Array.isArray(species) || !species.length) throw new Error('El catálogo está vacío.');

    speciesCatalog.clear();
    select.replaceChildren();
    for (const item of species) {
      speciesCatalog.set(String(item.id), item);
      const option = document.createElement('option');
      option.value = String(item.id);
      option.textContent = `${item.nombre_comun} (${item.nombre_cientifico})`;
      select.appendChild(option);
    }

    const mainSpeciesId = document.getElementById('sel-especie')?.value;
    const defaultSpecies = species.find(item => String(item.id) === String(mainSpeciesId)) ||
      species.find(item => String(item.nombre_cientifico).toLowerCase() === 'plumeria rubra') ||
      species[0];
    select.value = String(defaultSpecies.id);
    select.disabled = false;
    queryButton.disabled = false;
    compareButton.disabled = false;
  } catch (error) {
    select.replaceChildren();
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'No se pudo cargar el catálogo';
    select.appendChild(option);
    select.disabled = true;
    queryButton.disabled = true;
    compareButton.disabled = true;
    document.getElementById('geo-status').textContent = `No se pudo cargar el catálogo MySQL: ${error.message}`;
  }
}

document.getElementById('geo-species').addEventListener('change', () => {
  latestConsultation += 1;
  lastData = null;
  document.getElementById('geo-run-sim').disabled = true;
  document.getElementById('geo-status').textContent = 'Especie actualizada. Consulta de nuevo para cargar sus ocurrencias y calcular idoneidad.';
});

document.getElementById('sel-especie')?.addEventListener('change', event => {
  if (lastData && String(lastData.species.id) !== String(event.target.value)) {
    lastData = null;
    document.getElementById('geo-run-sim').disabled = true;
    document.getElementById('geo-status').textContent = 'Cambió la especie del cultivo. Consulta de nuevo para asociar el análisis correcto.';
  }
});

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
                · ${row.indice_idoneidad === null ? 'Datos insuficientes' : `${esc(row.indice_idoneidad)}/100`}
                · ${row.variables_disponibles === null ? 'cobertura anterior sin dato' : `${esc(row.variables_disponibles)}/5 variables`}<br>
                ${esc(row.nombre_lugar || `${row.lat}, ${row.lon}`)}
                · GBIF ${row.ocurrencias_gbif === null ? 'sin dato' : esc(row.ocurrencias_gbif)}
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
loadSpeciesCatalog();

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
    if (String(document.getElementById('sel-especie')?.value) !== String(lastData.species.id)) {
      throw new Error('La especie de la simulación no coincide con el análisis geográfico.');
    }

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
