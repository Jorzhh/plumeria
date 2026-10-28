import { spawn } from 'child_process';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const args = [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,900',
    '--user-data-dir=C:\\Users\\Josue\\AppData\\Local\\Temp\\cdp_node_tmp',
    'http://localhost:3006'
];

const proc = spawn(edgePath, args);
await new Promise(r => setTimeout(r, 4000));

try {
    const res = await fetch('http://localhost:9222/json');
    const targets = await res.json();
    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    const wsUrl = pageTarget.webSocketDebuggerUrl;

    const ws = new WebSocket(wsUrl);

    let msgId = 1;
    function sendCommand(method, params = {}) {
        return new Promise((resolve, reject) => {
            const currentId = msgId++;
            const handler = (event) => {
                const data = JSON.parse(event.data);
                if (data.id === currentId) {
                    ws.removeEventListener('message', handler);
                    if (data.error) reject(data.error);
                    else resolve(data.result);
                }
            };
            ws.addEventListener('message', handler);
            ws.send(JSON.stringify({ id: currentId, method, params }));
        });
    }

    await new Promise((resolve) => ws.onopen = resolve);

    async function evalCode(expression) {
        return await sendCommand('Runtime.evaluate', { expression, awaitPromise: true });
    }

    async function takeScreenshot(filename) {
        const res = await sendCommand('Page.captureScreenshot', { format: 'png' });
        const buffer = Buffer.from(res.data, 'base64');
        fs.writeFileSync(filename, buffer);
        console.log(`Saved ${filename} (${buffer.length} bytes)`);
    }

    // 1. Simular crecimiento a Día 85 (Planta madura con ramas, follaje y flores)
    console.log('Simulando ciclo de cultivo a Día 85...');
    await evalCode(`
        const sel = document.getElementById('sel-especie');
        const optPlumeria = Array.from(sel.options).find(o => o.text.includes('Plumeria'));
        if (optPlumeria) {
            sel.value = optPlumeria.value;
            sel.dispatchEvent(new Event('change'));
        }
        actualizarGrowthTimeline(85);
    `);
    await new Promise(r => setTimeout(r, 2500));

    // Captura principal (Planta 3D crecida + panel)
    await takeScreenshot('captura.png');

    // 2. Cambiar a Pestaña de KPIs y Analítica
    console.log('Capturando KPIs...');
    await evalCode(`
        document.querySelector('[data-tab="tab-kpi"]').click();
    `);
    await new Promise(r => setTimeout(r, 1000));
    await takeScreenshot('captura_kpis.png');

    // 3. Cambiar a Escenario A/B y ejecutar simulación comparativa
    console.log('Capturando Escenario A/B...');
    await evalCode(`
        document.querySelector('[data-tab="tab-ab"]').click();
        document.getElementById('btn-ejecutar-ab').click();
    `);
    await new Promise(r => setTimeout(r, 1200));
    await takeScreenshot('captura_ab.png');

    // 4. Cambiar a Pestaña de Reportes
    console.log('Capturando Reportes...');
    await evalCode(`
        document.querySelector('[data-tab="tab-reportes"]').click();
    `);
    await new Promise(r => setTimeout(r, 1000));
    await takeScreenshot('captura_reportes.png');

    // 5. Evidencia del Observatorio Global y consultas de datos reales
    console.log('Capturando el globo geoespacial...');
    await evalCode(`document.querySelector('[data-tab="tab-observatorio"]').click();`);
    await new Promise(r => setTimeout(r, 1200));
    await takeScreenshot('captura_globo.png');
    await evalCode(`document.getElementById('geo-query').click();`);
    await new Promise(r => setTimeout(r, 18000));
    await takeScreenshot('captura_panel_datos.png');
    await evalCode(`document.getElementById('geo-compare').click();`);
    await new Promise(r => setTimeout(r, 18000));
    await takeScreenshot('captura_ab_geografico.png');
    await evalCode(`document.getElementById('geo-ranking-refresh').click();`);
    await new Promise(r => setTimeout(r, 1200));
    await takeScreenshot('captura_ranking_idoneidad.png');
    ws.close();
} catch (err) {
    console.error('Error durante capturas:', err);
} finally {
    proc.kill();
    await new Promise(r => setTimeout(r, 1000));
    process.exit(0);
}
