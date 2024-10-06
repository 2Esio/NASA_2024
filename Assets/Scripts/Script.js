// Set up scene
const scene = new THREE.Scene();

// Load background texture (Starfield)
const loader = new THREE.TextureLoader();
const bgTexture = loader.load('Assets/Images/background.jpg');
scene.background = bgTexture;

// Set up camera and view states
let isZoomedIn = false; // View state for zoom
let zoomTarget = null; // Keeps track of the planet or moon we're zoomed into
let lastClickedPlanet = null; // Keeps track of the last clicked planet
let zoomInProgress = false; // Prevent double clicks or quick clicks
const minZoomDistance = 5;  // Distancia mínima permitida para zoom
const maxZoomDistance = 100; // Distancia máxima permitida para zoom

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 100); // Default external view

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit and first-person controls
const orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true; // Add smooth damping to zoom/pan/rotate
orbitControls.dampingFactor = 0.1;
orbitControls.enableZoom = true; // Enable zoom by default for planet view

// Add touch controls for mobile devices
orbitControls.touchPan = true;
orbitControls.touchRotate = true;
orbitControls.enableDamping = true; // Enable damping for mobile smoothness
orbitControls.dampingFactor = 0.15;

// Definir límites de zoom en los controles de cámara
orbitControls.minDistance = minZoomDistance; // Distancia mínima para el zoom manual
orbitControls.maxDistance = maxZoomDistance; // Distancia máxima para el zoom manual

const pointerControls = new THREE.PointerLockControls(camera, renderer.domElement);

// Load celestial bodies textures
const sunTexture = loader.load('Assets/Images/sun.jpg');
const earthTexture = loader.load('Assets/Images/earth.jpg');
const moonTexture = loader.load('Assets/Images/moon.jpg');
const mercuryTexture = loader.load('Assets/Images/mercury.jpg');
const venusTexture = loader.load('Assets/Images/venus.jpg');
const marsTexture = loader.load('Assets/Images/mars.jpg');
const jupiterTexture = loader.load('Assets/Images/jupiter.jpg');
const saturnTexture = loader.load('Assets/Images/saturn.jpg');
const saturnRingTexture = loader.load('Assets/Images/rings.png');  // Textura de los anillos de Saturno
const uranusTexture = loader.load('Assets/Images/uranus.jpg');
const neptuneTexture = loader.load('Assets/Images/neptune.jpg');
const ceresTexture = loader.load('Assets/Images/ceres.jpg'); // Textura de Ceres
const erisTexture = loader.load('Assets/Images/eris.jpg');   // Textura de Eris
const plutoTexture = loader.load('Assets/Images/pluto.jpg'); // Textura de Plutón
const asteroidBeltTexture = loader.load('Assets/Images/asteroid_belt.png'); // Textura del cinturón de asteroides

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
const ceres = createCelestialBody(0.3, ceresTexture, 'ceres');
const eris = createCelestialBody(0.5, erisTexture, 'eris');
const pluto = createCelestialBody(0.4, plutoTexture, 'pluto');

// Add Saturn's rings
function createSaturnRings() {
    const ringGeometry = new THREE.RingGeometry(2.5, 3.5, 64); // Geometría de los anillos (ajustar el tamaño si es necesario)
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

// Add asteroid belt
const asteroidBeltGeometry = new THREE.RingGeometry(40, 42, 64);
const asteroidBeltMaterial = new THREE.MeshBasicMaterial({
    map: asteroidBeltTexture,
    side: THREE.DoubleSide,
    transparent: true
});
const asteroidBelt = new THREE.Mesh(asteroidBeltGeometry, asteroidBeltMaterial);
asteroidBelt.rotation.x = Math.PI / 2; // Alinear el cinturón en el plano x-z
scene.add(asteroidBelt);

planets.push(sun, mercury, venus, earth, moon, mars, jupiter, saturn, uranus, neptune, ceres, eris, pluto);

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
labels.push(createLabel('Ceres', ceres));
labels.push(createLabel('Eris', eris));
labels.push(createLabel('Pluto', pluto));

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
orbits.push(createOrbit(85, 0x8b4513)); // Cinturón de asteroides

let labelsVisible = true;
let orbitsVisible = true;
let timeSpeed = 1; // Default speed control

// Raycaster for detecting clicks on planets
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Función para crear cuerpos celestes, ahora con nombre
function createCelestialBody(size, texture, name) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const body = new THREE.Mesh(geometry, material);
    body.name = name;
    scene.add(body);
    return body;
}

// Función para crear labels
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

// Función para crear órbitas
function createOrbit(radius, color) {
    const curve = new THREE.EllipseCurve(
        0, 0,
        radius, radius,
        0, 2 * Math.PI,
        false,
        0
    );
    const points = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: color });
    const orbit = new THREE.Line(geometry, material);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);
    return orbit;
}

function createOrbitAroundPlanet(radius, color, planet) {
    const curve = new THREE.EllipseCurve(
        planet.position.x, planet.position.z,
        radius, radius,
        0, 2 * Math.PI,
        false,
        0
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
    orbits.forEach(orbit => orbit.visible = orbitsVisible);
}

// Función para mostrar la información al hacer clic en un planeta o luna
const celestialBodiesInfo = {
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
    ceres: {
        name: "Ceres",
        gravity: 0.27,
        atmosphere: "None",
        type: "Dwarf Planet",
        discoverer: "Giuseppe Piazzi",
        life: "No",
        effect: "Your weight would be significantly lighter.",
        fact: "Ceres is the largest object in the asteroid belt."
    },
    eris: {
        name: "Eris",
        gravity: 0.82,
        atmosphere: "None",
        type: "Dwarf Planet",
        discoverer: "Mike Brown",
        life: "No",
        effect: "Your weight would be much lighter.",
        fact: "Eris is one of the most massive dwarf planets."
    },
    pluto: {
        name: "Pluto",
        gravity: 0.62,
        atmosphere: "Nitrogen",
        type: "Dwarf Planet",
        discoverer: "Clyde Tombaugh",
        life: "No",
        effect: "Your weight would be significantly lighter.",
        fact: "Pluto was reclassified from planet to dwarf planet."
    }
};

// Función para desplegar la información
function showPlanetInfo(planetName) {
    console.log("Mostrando información de: ", planetName);
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

        // Mostrar u ocultar el cálculo de peso basado en el planeta seleccionado
        if (planetName.toLowerCase() === 'earth') {
            document.getElementById('weight-input').style.display = 'none';
            document.getElementById('weight-output').style.display = 'none';
        } else {
            document.getElementById('weight-input').style.display = 'block';
            document.getElementById('weight-output').style.display = 'block';
        }

        document.getElementById('info-container').style.display = 'block';  // Mostrar el contenedor
    } else {
        console.log("No se encontró información para: ", planetName);
    }
}

// Función para manejar clics y desplegar la información
function onMouseClick(event) {
    if (zoomInProgress) return;
    if (event.target.closest('#controls')) {
        return;
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets);

    if (intersects.length > 0) {
        const selectedPlanet = intersects[0].object.name.toLowerCase();
        showPlanetInfo(selectedPlanet); // Mostrar la información
        zoomToPlanet(intersects[0].object); // Hacer zoom en el planeta
    } else if (isZoomedIn) {
        resetZoom();
        // hidePlanetInfo(); // Eliminar si se desea mantener la info visible
    }
}

// Escucha tanto para clics en computadoras como dispositivos móviles
window.addEventListener('click', onMouseClick, false);
window.addEventListener('touchstart', onMouseClick, false);

// Function to zoom into a planet with zoom limits
function zoomToPlanet(planet) {
    if (zoomInProgress || lastClickedPlanet === planet) {
        return;
    }
    isZoomedIn = true;
    zoomTarget = planet;
    orbitControls.enabled = true;
    orbitControls.target.copy(planet.position);
    orbitControls.update();

    lastClickedPlanet = planet;
    zoomInProgress = true;

    const zoomDuration = 1;
    const initialPosition = camera.position.clone();
    let targetPosition;

    if (planet === moon) {
        targetPosition = planet.position.clone().setLength(Math.max(5, minZoomDistance));
    } else {
        targetPosition = planet.position.clone().setLength(Math.min(10, maxZoomDistance));
    }

    let zoomProgress = 0;
    const zoomInterval = setInterval(() => {
        zoomProgress += 0.02;
        if (zoomProgress >= 1) {
            clearInterval(zoomInterval);
            zoomInProgress = false;
        }
        camera.position.lerpVectors(initialPosition, targetPosition, zoomProgress);
        camera.lookAt(planet.position);
    }, 16);
}

// Function to reset the zoom
function resetZoom() {
    if (zoomInProgress) return;
    isZoomedIn = false;
    zoomTarget = null;
    orbitControls.target.set(0, 0, 0);
    camera.position.set(0, 50, 100);
    camera.lookAt(0, 0, 0);
    lastClickedPlanet = null;
}

// Corrección para la velocidad de traslación de los planetas
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

const sunRotationSpeed = 0.01;

// Event listener for the speed control
document.getElementById('speedRange').addEventListener('input', (event) => {
    timeSpeed = parseFloat(event.target.value);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    mercuryAngle += mercuryRotationSpeed * timeSpeed;
    venusAngle += venusRotationSpeed * timeSpeed;
    earthAngle += earthRotationSpeed * timeSpeed;
    marsAngle += marsRotationSpeed * timeSpeed;
    jupiterAngle += jupiterRotationSpeed * timeSpeed;
    saturnAngle += saturnRotationSpeed * timeSpeed;
    uranusAngle += uranusRotationSpeed * timeSpeed;
    neptuneAngle += neptuneRotationSpeed * timeSpeed;
    moonAngle += moonOrbitSpeed * timeSpeed;

    mercury.position.set(Math.cos(mercuryAngle) * mercuryOrbitRadius, 0, Math.sin(mercuryAngle) * mercuryOrbitRadius);
    venus.position.set(Math.cos(venusAngle) * venusOrbitRadius, 0, Math.sin(venusAngle) * venusOrbitRadius);
    earth.position.set(Math.cos(earthAngle) * earthOrbitRadius, 0, Math.sin(earthAngle) * earthOrbitRadius);
    mars.position.set(Math.cos(marsAngle) * marsOrbitRadius, 0, Math.sin(marsAngle) * marsOrbitRadius);
    moon.position.set(earth.position.x + Math.cos(moonAngle) * moonOrbitRadius, 0, earth.position.z + Math.sin(moonAngle) * moonOrbitRadius);
    jupiter.position.set(Math.cos(jupiterAngle) * jupiterOrbitRadius, 0, Math.sin(jupiterAngle) * jupiterOrbitRadius);
    saturn.position.set(Math.cos(saturnAngle) * saturnOrbitRadius, 0, Math.sin(saturnAngle) * saturnOrbitRadius);
    uranus.position.set(Math.cos(uranusAngle) * uranusOrbitRadius, 0, Math.sin(uranusAngle) * uranusOrbitRadius);
    neptune.position.set(Math.cos(neptuneAngle) * neptuneOrbitRadius, 0, Math.sin(neptuneAngle) * neptuneOrbitRadius);

    labels.forEach(label => {
        label.sprite.position.set(label.planet.position.x, label.planet.position.y + 6, label.planet.position.z);
    });

    sun.rotation.y += sunRotationSpeed;

    if (isZoomedIn && zoomTarget) {
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
