# Práctica 05: Persistencia de Datos y Simulaciones para la Toma de Decisiones

**Laboratorio Bioinformático de Cultivo 3D con Persistencia en MySQL y API REST en FlightPHP**

* **Materia:** Graficación y Simulación / Computación Visual
* **Integrantes:**
  * Humberto Josué Orozco Espinosa
  * Irlanda Goreti Álvarez Lomeli
* **Base previa:** [Práctica 04 – Simulación Procedural de Crecimiento Vegetal (Plumeria Rubra 3D)](https://github.com/Jorzhh/plumeria/tree/main/Practica4)

---

## 📌 Resumen de la Práctica

En la **Práctica 04** se desarrolló una planta procedural animada en Three.js con jerarquías anatómicas, viento y animaciones basadas en `requestAnimationFrame`. 

La **Práctica 05** extiende esa base visual convirtiéndola en un **Laboratorio Bioinformático de Cultivo** con una arquitectura de 3 capas, conectada a una base de datos relacional MySQL 8 mediante una API REST en PHP (FlightPHP). Esto transforma la simulación de un simple render animado a una **herramienta científica de apoyo a la toma de decisiones agronómicas**.

---

## 🏗️ Arquitectura del Sistema (3 Capas)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CAPA DE PRESENTACIÓN (Frontend)                          │
│   • Three.js (WebGL): Visor 3D con iluminación física,      │
│     materiales PBR, sombras suaves, shaders y viento.       │
│   • Chart.js: Curvas de crecimiento y analítica en vivo.    │
│   • HTML5 / CSS3: Tablero de KPIs, panel de decisiones,    │
│     comparador A/B, historial y reportes.                   │
│   • Raycasting: Selección 3D de órganos vegetales con       │
│     cálculo de estrés y biomasa atribuida.                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ fetch() / async-await
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CAPA DE LÓGICA (JavaScript ES Modules)                   │
│   • GrowthEngine.js: Motor bioinformático con 4 modelos     │
│     matemáticos de crecimiento vegetal.                     │
│   • Cálculo de estrés fisiológico multidimensional.         │
│   • Motor de decisiones agronómicas y alertas.              │
│   • Generador y evaluador de escenarios A/B.                │
│   • API Client: Comunicación asíncrona con el backend.      │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON REST API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. CAPA DE DATOS (Backend & Base de Datos)                  │
│   • FlightPHP Micro-framework: Rutas REST, CORS y PDO.     │
│   • MySQL 8 / MariaDB: Base `practica05_bioinformatica`.   │
│   • Catálogo de especies con óptimos biológicos.            │
│   • Persistencia de simulaciones, mediciones por tick       │
│     y recomendaciones agronómicas.                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔬 Modelos Matemáticos de Crecimiento Implementados

El simulador permite alternar dinámicamente entre 4 modelos clásicos de la biología computacional:

1. **Lineal:**
   $$N(t) = a \cdot t + b$$
   * Tasa constante. Modela crecimiento temprano o fases independientes de recursos.
2. **Exponencial (Malthusiano):**
   $$N(t) = N_0 \cdot e^{r \cdot t}$$
   * Crecimiento proporcional al tamaño actual sin límites ambientales inmediatos.
3. **Logístico de Verhulst (Curva Sigmoidea S):**
   $$\frac{dN}{dt} = r \cdot N \cdot \left(1 - \frac{N}{K}\right)$$
   $$N(t) = \frac{K}{1 + \left(\frac{K - N_0}{N_0}\right) \cdot e^{-r \cdot t}}$$
   * Introduce la **capacidad de carga $K$**. La velocidad decrece a medida que los recursos del entorno se saturan.
4. **Gompertz (Asimétrico):**
   $$N(t) = K \cdot \exp\left(-\exp\left(-r \cdot (t - t_0)\right)\right)$$
   * Tasa de crecimiento relativa decreciente de forma exponencial. Estándar para modelar crecimiento de frutos, tallos leñosos y coronas foliares.

---

## 🌡️ Índices de Estrés Fisiológico

El sistema evalúa continuamente la desviación respecto al óptimo de cada especie:

$$\text{Estrés}(V) = \min\left(100, \frac{|V - V_{\text{óptimo}}|}{V_{\text{máx}} - V_{\text{mín}}} \times 100\right)$$

* **Estrés Hídrico ($E_H$, 35% peso):** Humedad en sustrato vs óptimo. Provoca marchitamiento y clorosis visual en las hojas 3D.
* **Estrés Térmico ($E_T$, 25% peso):** Temperatura ambiente vs tolerancia biológica.
* **Estrés Lumínico ($E_L$, 20% peso):** Radiación fotosintética activa (PAR) en $\mu\text{mol}\cdot\text{m}^{-2}\cdot\text{s}^{-1}$.
* **Estrés Nutricional ($E_N$, 20% peso):** Concentración de macronutrientes N-P-K.

El **Estrés Total Ponderado** reduce la tasa intrínseca de crecimiento $r$ en la simulación:
$$r_{\text{efectivo}} = r \times \max\left(0.10, 1 - \frac{\text{Estrés Total}}{200}\right)$$

---

## 🗄️ Modelo Relacional de Base de Datos (MySQL)

Base de datos: `practica05_bioinformatica`

* **`especies`**: Catálogo botánico (Maíz, Frijol, Tomate, Arabidopsis, Plumeria, Girasol, Agave, Lavanda) con rangos óptimos y paleta cromática 3D.
* **`simulaciones`**: Cabecera de experimentos agronómicos con parámetros genéticos ($r, K$), ambientales y métricas finales acumuladas.
* **`mediciones`**: Serie temporal día a día (altura, biomasa, hojas, ramas, estrés desglosado, ICR y días para cosecha).
* **`decisiones`**: Bitácora de sugerencias agronómicas generadas por el motor con niveles de prioridad (`baja`, `media`, `alta`, `crítica`).

Los scripts SQL están en la carpeta `database/`:
* `database/schema.sql` (Creación de tablas, llaves foráneas e índices)
* `database/seed.sql` (Catálogo completo de 8 especies, 6 simulaciones históricas y 57 mediciones precargadas)

---

## 🚀 Rutas de la API REST (FlightPHP)

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/especies` | Listar catálogo completo de especies |
| `GET` | `/api/especies/@id` | Obtener datos biológicos de una especie |
| `GET` | `/api/simulaciones` | Listar historial de simulaciones |
| `GET` | `/api/simulaciones/@id` | Detalle de una simulación |
| `POST` | `/api/simulaciones` | Registrar nueva corrida en MySQL |
| `PUT` | `/api/simulaciones/@id` | Actualizar estado o métricas finales |
| `DELETE` | `/api/simulaciones/@id` | Eliminar simulación |
| `GET` | `/api/simulaciones/@id/mediciones` | Serie temporal de mediciones por tick |
| `POST` | `/api/mediciones/batch` | Inserción en lote de mediciones |
| `GET` | `/api/simulaciones/@id/decisiones` | Recomendaciones registradas |
| `POST` | `/api/decisiones` | Guardar sugerencia generada |
| `GET` | `/api/reportes/top-biomasa` | Top 5 simulaciones con mayor biomasa |
| `GET` | `/api/reportes/eficiencia` | Ranking de eficiencia agronómica ($g/\text{día}$) |
| `GET` | `/api/reportes/promedio-madurez` | Días promedio a madurez observados |
| `GET` | `/api/reportes/comparar/@id1/@id2` | Comparativa directa A/B |

---

## 💻 Instrucciones de Instalación y Ejecución

### Prerrequisitos
* XAMPP (Apache + MySQL / MariaDB) o PHP 8.0+ y MySQL 8 instalados.

### Paso 1: Importar Base de Datos
Abre tu consola de MySQL o phpMyAdmin e importa los scripts:
```bash
mysql -u root < database/schema.sql
mysql -u root < database/seed.sql
```

### Paso 2: Iniciar Servidores con 1 Clic (Windows)
Haz doble clic sobre el archivo:
```text
iniciar_servidores.bat
```
Este script iniciará automáticamente:
1. La API REST en PHP: `http://localhost:8080`
2. El servidor web de la aplicación: `http://localhost:3000`
3. Tu navegador web listo para interactuar.

*(Alternativa manual desde terminal:)*
```bash
# Terminal 1: Iniciar API REST
cd api
php -S localhost:8080 index.php

# Terminal 2: Iniciar Frontend
cd public
php -S localhost:3000
```

---

## 🎯 Funcionalidades Clave Evaluables

1. **Catálogo de Especies Dinámico:** Selección desde MySQL con adaptación morfológica 3D (tamaño y colores PBR).
2. **Motor Matemático Intercambiable:** Compara visualmente las curvas Lineal, Exponencial, Logística y Gompertz en tiempo real.
3. **Escenario A/B en Paralelo:** Prueba dos tratamientos agronómicos y recibe un dictamen automatizado de cuál estrategia genera mayor biomasa y menor estrés.
4. **Raycasting Enriquecido:** Haz clic sobre cualquier parte de la planta para ver su órgano, crecimiento, estrés fisiológico actual y biomasa atribuida.
5. **Persistencia Completa en MySQL:** Guarda corridas completas con sus series de tiempo de mediciones y recupéralas desde la pestaña de Historial para reproducirlas.
6. **Reportes y Exportación:** Tablas de eficiencia agronómica, top biomasa y exportador CSV con un clic.
