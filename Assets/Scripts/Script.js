// Set up scene
const scene = new THREE.Scene();

// Load background texture (Starfield)
const loader = new THREE.TextureLoader();
const bgTexture = loader.load('Assets/Images/background.jpg');
scene.background = bgTexture;

// Set up camera and view states
let isZoomedIn = false;
let zoomTarget = null;
let lastClickedPlanet = null;
let zoomInProgress = false;
let isManualControl = false; // Control para detectar interacción manual
const minZoomDistance = 5;
const maxZoomDistance = 100;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 100);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit controls
const orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.1;
orbitControls.enableZoom = true;
orbitControls.enablePan = true;
orbitControls.enableRotate = true;
orbitControls.touchPan = true;
orbitControls.touchRotate = true;
orbitControls.minDistance = minZoomDistance;
orbitControls.maxDistance = maxZoomDistance;

// Detecta cuando el usuario toma control manual de la cámara
orbitControls.addEventListener('start', () => {
    isManualControl = true; // Se está moviendo la cámara manualmente
});
orbitControls.addEventListener('end', () => {
    isManualControl = false; // Se ha terminado el control manual
});

// Load celestial bodies textures
const sunTexture = loader.load('Assets/Images/sun.jpg');
const earthTexture = loader.load('Assets/Images/earth.jpg');
const moonTexture = loader.load('Assets/Images/moon.jpg');
const mercuryTexture = loader.load('Assets/Images/mercury.jpg');
const venusTexture = loader.load('Assets/Images/venus.jpg');
const marsTexture = loader.load('Assets/Images/mars.jpg');
const jupiterTexture = loader.load('Assets/Images/jupiter.jpg');
const saturnTexture = loader.load('Assets/Images/saturn.jpg');
const saturnRingTexture = loader.load('Assets/Images/rings.png');
const uranusTexture = loader.load('Assets/Images/uranus.jpg');
const neptuneTexture = loader.load('Assets/Images/neptune.jpg');
const plutoTexture = loader.load('Assets/Images/pluto.jpg');
const ceresTexture = loader.load('Assets/Images/ceres.jpg');
const erisTexture = loader.load('Assets/Images/eris.jpg');

// Create celestial bodies
const planets = [];
const sun = createCelestialBody(5, sunTexture, 'sun');
const mercury = createCelestialBody(0.5, mercuryTexture, 'mercury');
const venus = createCelestialBody(0.9, venusTexture, 'venus');
const earth = createCelestialBody(1, earthTexture, 'earth');
const moon = createCelestialBody(0.27, moonTexture, 'moon');
const mars = createCelestialBody(0.8, marsTexture, 'mars');
const jupiter = createCelestialBody(2, jupiterTexture, 'jupiter');
const saturn = createCelestialBody(1.8, saturnTexture, 'saturn');
const uranus = createCelestialBody(1.2, uranusTexture, 'uranus');
const neptune = createCelestialBody(1.3, neptuneTexture, 'neptune');
const pluto = createCelestialBody(0.18, plutoTexture, 'pluto');
const ceres = createCelestialBody(0.15, ceresTexture, 'ceres');
const eris = createCelestialBody(0.2, erisTexture, 'eris');

// Add Saturn's rings
function createSaturnRings() {
    const ringGeometry = new THREE.RingGeometry(2.5, 3.5, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
        map: saturnRingTexture,
        side: THREE.DoubleSide,
        transparent: true
    });
    const saturnRings = new THREE.Mesh(ringGeometry, ringMaterial);
    saturnRings.rotation.x = Math.PI / 2;
    saturn.add(saturnRings);
}

createSaturnRings();

planets.push(sun, mercury, venus, earth, moon, mars, jupiter, saturn, uranus, neptune, pluto, ceres, eris);

// Add labels
const labels = [];
labels.push(createLabel('Sun', sun));
labels.push(createLabel('Mercury', mercury));
labels.push(createLabel('Venus', venus));
labels.push(createLabel('Earth', earth));
labels.push(createLabel('Moon', moon));
labels.push(createLabel('Mars', mars));
labels.push(createLabel('Jupiter', jupiter));
labels.push(createLabel('Saturn', saturn));
labels.push(createLabel('Uranus', uranus));
labels.push(createLabel('Neptune', neptune));
labels.push(createLabel('Pluto', pluto));
labels.push(createLabel('Ceres', ceres));
labels.push(createLabel('Eris', eris));

// Add orbits
const orbits = [];
orbits.push(createOrbit(8, 0xaaaaaa));
orbits.push(createOrbit(20, 0x00ff00));
orbits.push(createOrbit(30, 0xff0000));
orbits.push(createOrbit(15, 0x0000ff));
orbits.push(createOrbitAroundPlanet(2, 0xffffff, earth));
orbits.push(createOrbit(40, 0xffa500));
orbits.push(createOrbit(50, 0xffff00));
orbits.push(createOrbit(60, 0x00ffff));
orbits.push(createOrbit(70, 0x0000ff));
orbits.push(createOrbit(80, 0xaaaaaa)); // Orbit of Pluto
orbits.push(createOrbit(35, 0xaaaaaa)); // Orbit of Ceres
orbits.push(createOrbit(90, 0xaaaaaa)); // Orbit of Eris

// Handle asteroid belt
// Handle asteroid belt between Mars and Jupiter
function createAsteroidBelt() {
    const asteroidGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const asteroidMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
    const asteroidCount = 300;  // Increased number of asteroids for a denser belt
    const beltInnerRadius = 35; // Inner radius just outside Mars's orbit (Mars has an orbit radius of 30)
    const beltOuterRadius = 39; // Outer radius before Jupiter's orbit (Jupiter has an orbit radius of 40)

    for (let i = 0; i < asteroidCount; i++) {
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        const angle = Math.random() * Math.PI * 2;
        const radius = beltInnerRadius + Math.random() * (beltOuterRadius - beltInnerRadius);
        asteroid.position.set(Math.cos(angle) * radius, Math.random() * 2 - 1, Math.sin(angle) * radius);
        scene.add(asteroid);
    }
}

createAsteroidBelt();

// Información de los cuerpos celestes
const celestialBodiesInfo = {
    sun: {
        name: "Sun",
        gravity: "273.0",
        atmosphere: "Hydrogen, Helium",
        type: "Star",
        discoverer: "N/A",
        life: "No",
        effect: "You would burn instantly.",
        fact: "The Sun contains 99.86% of the mass in the Solar System."
    },
    mercury: {
        name: "Mercury",
        gravity: 3.7,
        atmosphere: "None",
        type: "Rocky",
        discoverer: "Unknown",
        life: "No",
        effect: "Your weight would be much lighter.",
        fact: "Mercury is the closest planet to the Sun but not the hottest."
    },
    venus: {
        name: "Venus",
        gravity: 8.87,
        atmosphere: "Carbon Dioxide",
        type: "Rocky",
        discoverer: "Unknown",
        life: "No",
        effect: "Your body would experience crushing pressure.",
        fact: "Venus has temperatures over 450°C."
    },
    earth: {
        name: "Earth",
        gravity: 9.81,
        atmosphere: "Nitrogen and Oxygen",
        type: "Rocky",
        discoverer: "Unknown",
        life: "Yes",
        effect: "Your body would function normally.",
        fact: "Earth is the only known planet to harbor life."
    },
    mars: {
        name: "Mars",
        gravity: 3.71,
        atmosphere: "Carbon Dioxide",
        type: "Rocky",
        discoverer: "Galileo Galilei",
        life: "No",
        effect: "Your weight would be much lighter.",
        fact: "Mars is home to the tallest mountain in the solar system."
    },
    jupiter: {
        name: "Jupiter",
        gravity: 24.79,
        atmosphere: "Hydrogen and Helium",
        type: "Gas Giant",
        discoverer: "Galileo Galilei",
        life: "No",
        effect: "Your weight would be more than double.",
        fact: "Jupiter is so large it could fit over 1,300 Earths inside it."
    },
    saturn: {
        name: "Saturn",
        gravity: 10.44,
        atmosphere: "Hydrogen and Helium",
        type: "Gas Giant",
        discoverer: "Galileo Galilei",
        life: "No",
        effect: "Your weight would be heavier.",
        fact: "Saturn is known for its stunning ring system."
    },
    uranus: {
        name: "Uranus",
        gravity: 8.69,
        atmosphere: "Hydrogen and Helium",
        type: "Gas Giant",
        discoverer: "William Herschel",
        life: "No",
        effect: "Your weight would be slightly less.",
        fact: "Uranus rotates on its side."
    },
    neptune: {
        name: "Neptune",
        gravity: 11.15,
        atmosphere: "Hydrogen, Helium, and Methane",
        type: "Gas Giant",
        discoverer: "Johann Galle",
        life: "No",
        effect: "Your weight would be heavier.",
        fact: "Neptune has supersonic winds."
    },
    pluto: {
        name: "Pluto",
        gravity: 0.62,
        atmosphere: "Nitrogen, Methane, and Carbon Monoxide",
        type: "Dwarf Planet",
        discoverer: "Clyde Tombaugh",
        life: "No",
        effect: "Your weight would be negligible.",
        fact: "Pluto is no longer classified as a planet."
    },
    ceres: {
        name: "Ceres",
        gravity: 0.27,
        atmosphere: "None",
        type: "Dwarf Planet",
        discoverer: "Giuseppe Piazzi",
        life: "No",
        effect: "Your weight would be even less.",
        fact: "Ceres is the largest object in the asteroid belt."
    },
    eris: {
        name: "Eris",
        gravity: 0.43,
        atmosphere: "None",
        type: "Dwarf Planet",
        discoverer: "Mike Brown",
        life: "No",
        effect: "Your weight would be extremely light.",
        fact: "Eris is one of the most massive dwarf planets."
    },
    moon:{
        name: "Moon",
        gravity: "1.62 m/s²",
        atmosphere: "None",
        type: "Natural Satellite",
        discoverer: "Unknown",
        life: "No",
        effect: "You would feel much lighter.",
        fact: "The Moon always shows the same face to the Earth due to synchronous rotation."
    }
};

// Función para mostrar la información del planeta seleccionado
function showPlanetInfo(planetName) {
    const info = celestialBodiesInfo[planetName.toLowerCase()];

    if (info) {
        document.getElementById('planet-name').textContent = info.name;
        document.getElementById('planet-gravity').textContent = info.gravity;
        document.getElementById('planet-atmosphere').textContent = info.atmosphere;
        document.getElementById('planet-type').textContent = info.type;
        document.getElementById('planet-discoverer').textContent = info.discoverer;
        document.getElementById('planet-life').textContent = info.life;
        document.getElementById('planet-effect').textContent = info.effect;
        document.getElementById('planet-fact').textContent = info.fact;
        document.getElementById('info-container').style.display = 'block';  // Muestra el contenedor
    } else {
        console.log("No se encontró información para el planeta: ", planetName);
    }
}

let labelsVisible = true;
let orbitsVisible = true;
let timeSpeed = 1;

// Detener la propagación de eventos de desplazamiento en el contenedor de información
const infoContainer = document.getElementById('info-container');

infoContainer.addEventListener('wheel', (event) => {
    event.stopPropagation();  // Detiene que el scroll del contenedor afecte el orbitControls
});

infoContainer.addEventListener('touchmove', (event) => {
    event.stopPropagation();  // Evita que el toque al desplazarse afecte el orbitControls
}, { passive: true });


// Raycaster for detecting clicks on planets
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Function to create celestial bodies
function createCelestialBody(size, texture, name) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const body = new THREE.Mesh(geometry, material);
    body.name = name;
    scene.add(body);
    return body;
}

// Function to create labels
function createLabel(name, planet) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = '30px Arial';
    context.fillStyle = 'white';
    context.fillText(name, 0, 30);
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(4, 2, 1);
    scene.add(sprite);
    return { sprite, planet };
}

// Function to create orbits
// Function to create elliptical orbits with inclination
function createOrbit(orbitRadius, eccentricity, inclination, color) {
    const semiMajorAxis = orbitRadius;
    const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - Math.pow(eccentricity, 2)); // Elipse basada en la excentricidad

    const curve = new THREE.EllipseCurve(
        0, 0, // Centro de la elipse
        semiMajorAxis, semiMinorAxis, // Ejes mayor y menor
        0, 2 * Math.PI, // Ángulo de inicio y final
        false, 0
    );

    const points = curve.getPoints(100); // Más puntos para mayor detalle
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: color });
    const orbit = new THREE.Line(geometry, material);

    // Aplicar inclinación en el eje Y (debido a la rotación de la órbita en el plano XZ)
    orbit.rotation.x = THREE.Math.degToRad(inclination);

    scene.add(orbit);
    return orbit;
}



function createOrbitAroundPlanet(radius, color, planet) {
    const curve = new THREE.EllipseCurve(
        planet.position.x, planet.position.z,
        radius, radius,
        0, 2 * Math.PI, false, 0
    );
    const points = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: color });
    const orbit = new THREE.Line(geometry, material);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);
    return orbit;
}

// Toggle functions for UI controls
function toggleLabels() {
    labelsVisible = !labelsVisible;
    labels.forEach(label => label.sprite.visible = labelsVisible);
}

function toggleOrbits() {
    orbitsVisible = !orbitsVisible;
    orbits.forEach(orbit => {
        orbit.visible = orbitsVisible;
    });
}

// Handle click and touch events
// Variables para doble click
let lastClickTime = 0;
const doubleClickThreshold = 300; // Tiempo en milisegundos para considerar un doble click

// Handle click and touch events
window.addEventListener('click', onMouseClick, false);
window.addEventListener('touchstart', onTouchStart, false);

function onMouseClick(event) {
    event.preventDefault();

    const currentTime = new Date().getTime();
    const timeDifference = currentTime - lastClickTime;
    lastClickTime = currentTime;

    if (timeDifference < doubleClickThreshold) {
        // Si el intervalo entre los clics es muy corto, se considera doble click, evitar salir del planeta.
        return;
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    handleClickOrTouch();
}

function onTouchStart(event) {
    event.preventDefault();

    mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    handleClickOrTouch();
}

function handleClickOrTouch() {
    if (zoomInProgress) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets);

    if (intersects.length > 0) {
        const selectedPlanet = intersects[0].object.name.toLowerCase();
        showPlanetInfo(selectedPlanet);
        zoomToPlanet(intersects[0].object);
    } else if (isZoomedIn) {
        resetZoom();
    }
}

// Function to zoom into a planet
function zoomToPlanet(planet) {
    if (zoomInProgress || lastClickedPlanet === planet) {
        return;  // Prevent multiple clicks or quick clicks
    }
    isZoomedIn = true;
    zoomTarget = planet;
    orbitControls.enabled = true;
    orbitControls.target.copy(planet.position);
    orbitControls.update();

    lastClickedPlanet = planet;  // Store the last clicked planet
    zoomInProgress = true;  // Indicate that a zoom is in progress

    const zoomDuration = 1;
    const initialPosition = camera.position.clone();
    let targetPosition;

    // Adjust zoom based on the size of the planet (e.g., difference between Earth and Moon)
    if (planet === moon) {
        targetPosition = planet.position.clone().setLength(Math.max(5, minZoomDistance));  // Closer zoom for the Moon
    } else {
        targetPosition = planet.position.clone().setLength(Math.min(10, maxZoomDistance)); // Zoom for other planets
    }

    let zoomProgress = 0;
    const zoomInterval = setInterval(() => {
        zoomProgress += 0.02;
        if (zoomProgress >= 1) {
            clearInterval(zoomInterval);
            zoomInProgress = false;  // Finish zoom process
        }
        camera.position.lerpVectors(initialPosition, targetPosition, zoomProgress);
        camera.lookAt(planet.position);
    }, 16);
}

// Function to reset zoom
function resetZoom() {
    if (zoomInProgress) return;
    isZoomedIn = false;
    zoomTarget = null;
    orbitControls.target.set(0, 0, 0);
    camera.position.set(0, 50, 100);
    camera.lookAt(0, 0, 0);
    lastClickedPlanet = null;

    // Oculta el contenedor de información
    document.getElementById('info-container').style.display = 'none';
}

// Ajuste para móviles: Mantener el seguimiento del planeta cuando se interactúa manualmente
orbitControls.addEventListener('change', () => {
    if (isZoomedIn && zoomTarget) {
        camera.lookAt(zoomTarget.position);
    }
});
// Step 1: Fetch Near-Earth Comets Data
// Step 1: Fetch Near-Earth Comets Data
async function fetchComets() {
    try {
        const response = await fetch('https://data.nasa.gov/resource/b67r-rgxc.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const cometsData = await response.json();
        console.log('Comets Data:', cometsData); // Verificar si los datos llegan aquí
        processCometsData(cometsData);
    } catch (error) {
        console.error('Error fetching comets data:', error); // Mostrar el error en la consola
    }
}

// Llamar a la función al cargar la escena
fetchComets();


// Step 2: Process the comets data
function processCometsData(comets) {
    comets.forEach(comet => {
        if (comet.object.startsWith('C/') || comet.object.startsWith('P/')) {
            console.log('Processing comet:', comet.object);

            const size = comet.size || 2;
            const semiMajorAxis = comet.semi_major_axis || Math.random() * 50 + 30; // Semieje mayor
            const eccentricity = comet.e || 0.5; // Excentricidad
            const inclination = comet.i_deg || 0; // Inclinación en grados
            const rotationSpeed = comet.rotation_period || 0.005;
            const translationSpeed = comet.orbital_period || 0.005;

            // Crear el cuerpo del cometa
            const cometTexture = loader.load('Assets/Images/moon.jpg');
            const cometBody = createCelestialBody(size, cometTexture, comet.object);

            // Crear la órbita elíptica e inclinada y agregarla al array `orbits`
            const cometOrbit = createOrbit(semiMajorAxis, eccentricity, inclination, 0xffffff);
            orbits.push(cometOrbit);

            // Añadir el cometa al array de planetas para la animación
            planets.push(cometBody);

            // Movimiento del cometa (rotación y traslación)
            let cometAngle = 0;
            function updateCometPosition() {
                cometAngle += translationSpeed * timeSpeed;
                cometBody.position.set(
                    Math.cos(cometAngle) * semiMajorAxis,
                    0,
                    Math.sin(cometAngle) * semiMajorAxis * Math.sqrt(1 - Math.pow(eccentricity, 2)) // Ajuste elíptico
                );
            }

            // Añadir la función de actualización a la animación
            animateCometFunctions.push(updateCometPosition);
        }
    });
}



// Step 3: Call the fetch function to load comets data when the scene is initialized
fetchComets();
// Animations for planet rotations
const mercuryOrbitRadius = 8;
let mercuryAngle = 0;
const mercuryRotationSpeed = 0.01;

const venusOrbitRadius = 15;
let venusAngle = 0;
const venusRotationSpeed = 0.008;

const earthOrbitRadius = 20;
let earthAngle = 0;
const earthRotationSpeed = 0.007;

const marsOrbitRadius = 30;
let marsAngle = 0;
const marsRotationSpeed = 0.006;

const jupiterOrbitRadius = 40;
let jupiterAngle = 0;
const jupiterRotationSpeed = 0.004;

const saturnOrbitRadius = 50;
let saturnAngle = 0;
const saturnRotationSpeed = 0.003;

const uranusOrbitRadius = 60;
let uranusAngle = 0;
const uranusRotationSpeed = 0.002;

const neptuneOrbitRadius = 70;
let neptuneAngle = 0;
const neptuneRotationSpeed = 0.001;

const moonOrbitRadius = 2;
let moonAngle = 0;
const moonOrbitSpeed = 0.05;

const sunRotationSpeed = 0.01;  // Slow rotation of the Sun

let plutoAngle = 0;
const plutoRotationSpeed = 0.0008;
const plutoOrbitRadius = 80;

let ceresAngle = 0;
const ceresRotationSpeed = 0.0015;
const ceresOrbitRadius = 35;

let erisAngle = 0;
const erisRotationSpeed = 0.0006;
const erisOrbitRadius = 90;


// Event listener for speed control
document.getElementById('speedRange').addEventListener('input', (event) => {
    timeSpeed = parseFloat(event.target.value);
});
let animateCometFunctions = []; 
// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update planet orbits
    mercuryAngle += mercuryRotationSpeed * timeSpeed;
    venusAngle += venusRotationSpeed * timeSpeed;
    earthAngle += earthRotationSpeed * timeSpeed;
    marsAngle += marsRotationSpeed * timeSpeed;
    jupiterAngle += jupiterRotationSpeed * timeSpeed;
    saturnAngle += saturnRotationSpeed * timeSpeed;
    uranusAngle += uranusRotationSpeed * timeSpeed;
    neptuneAngle += neptuneRotationSpeed * timeSpeed;
    moonAngle += moonOrbitSpeed * timeSpeed;
    plutoAngle += plutoRotationSpeed * timeSpeed;
    ceresAngle += ceresRotationSpeed * timeSpeed;
    erisAngle += erisRotationSpeed * timeSpeed;

    // Update planet positions
    mercury.position.set(Math.cos(mercuryAngle) * mercuryOrbitRadius, 0, Math.sin(mercuryAngle) * mercuryOrbitRadius);
    venus.position.set(Math.cos(venusAngle) * venusOrbitRadius, 0, Math.sin(venusAngle) * venusOrbitRadius);
    earth.position.set(Math.cos(earthAngle) * earthOrbitRadius, 0, Math.sin(earthAngle) * earthOrbitRadius);
    mars.position.set(Math.cos(marsAngle) * marsOrbitRadius, 0, Math.sin(marsAngle) * marsOrbitRadius);
    moon.position.set(earth.position.x + Math.cos(moonAngle) * moonOrbitRadius, 0, earth.position.z + Math.sin(moonAngle) * moonOrbitRadius);
    jupiter.position.set(Math.cos(jupiterAngle) * jupiterOrbitRadius, 0, Math.sin(jupiterAngle) * jupiterOrbitRadius);
    saturn.position.set(Math.cos(saturnAngle) * saturnOrbitRadius, 0, Math.sin(saturnAngle) * saturnOrbitRadius);
    uranus.position.set(Math.cos(uranusAngle) * uranusOrbitRadius, 0, Math.sin(uranusAngle) * uranusOrbitRadius);
    neptune.position.set(Math.cos(neptuneAngle) * neptuneOrbitRadius, 0, Math.sin(neptuneAngle) * neptuneOrbitRadius);
    pluto.position.set(Math.cos(plutoAngle) * plutoOrbitRadius, 0, Math.sin(plutoAngle) * plutoOrbitRadius);
    ceres.position.set(Math.cos(ceresAngle) * ceresOrbitRadius, 0, Math.sin(ceresAngle) * ceresOrbitRadius);
    eris.position.set(Math.cos(erisAngle) * erisOrbitRadius, 0, Math.sin(erisAngle) * erisOrbitRadius);

    // Update labels to follow planets
    labels.forEach(label => {
        label.sprite.position.set(label.planet.position.x, label.planet.position.y + 6, label.planet.position.z);
    });

    // Update Sun's rotation
    sun.rotation.y += sunRotationSpeed;

    animateCometFunctions.forEach(updateFunction => updateFunction());
    // Si está con zoom, hacer que la cámara siga al planeta
    if (isZoomedIn && zoomTarget && !isManualControl) {
        const followDistance = 10;
        const targetPosition = new THREE.Vector3(
            zoomTarget.position.x + followDistance,
            zoomTarget.position.y + followDistance / 2,
            zoomTarget.position.z + followDistance
        );
        camera.position.lerp(targetPosition, 0.1);
        camera.lookAt(zoomTarget.position);
    }

    renderer.render(scene, camera);
    orbitControls.update();
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
