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
function createAsteroidBelt() {
    const asteroidGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const asteroidMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
    const asteroidCount = 100;
    for (let i = 0; i < asteroidCount; i++) {
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        const angle = Math.random() * Math.PI * 2;
        const radius = 40 + Math.random() * 5;
        asteroid.position.set(Math.cos(angle) * radius, Math.random() * 5 - 2.5, Math.sin(angle) * radius);
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
        gravity: "3.7",
        atmosphere: "None",
        type: "Rocky",
        discoverer: "Unknown",
        life: "No",
        effect: "Your weight would be much lighter.",
        fact: "Mercury is the closest planet to the Sun but not the hottest."
    },
    venus: {
        name: "Venus",
        gravity: "8.87",
        atmosphere: "Carbon Dioxide",
        type: "Rocky",
        discoverer: "Unknown",
        life: "No",
        effect: "Your body would experience crushing pressure.",
        fact: "Venus has temperatures over 450°C."
    },
    earth: {
        name: "Earth",
        gravity: "9.81",
        atmosphere: "Nitrogen and Oxygen",
        type: "Rocky",
        discoverer: "Unknown",
        life: "Yes",
        effect: "Your body would function normally.",
        fact: "Earth is the only known planet to harbor life."
    },
    mars: {
        name: "Mars",
        gravity: "3.71",
        atmosphere: "Carbon Dioxide",
        type: "Rocky",
        discoverer: "Galileo Galilei",
        life: "No",
        effect: "Your weight would be much lighter.",
        fact: "Mars is home to the tallest mountain in the solar system."
    },
    // Agrega información de los demás planetas aquí...
};

// Función para mostrar la información del planeta seleccionado
function showPlanetInfo(planetName) {
    console.log("Showing information for: ",planetName);
    const info = celestialBodiesInfo[planetName.toLoweCase()];

    if(info){
        document.getElementById('planet-name').textContent = info.name;
        document.getElementById('planet-gravity').textContent = info.gravity;
        document.getElementById('planet-atmosphere').textContent = info.atmosphere;
        document.getElementById('planet-type').textContent = info.type;
        document.getElementById('planet-discoverer').textContent = info.discoverer;
        document.getElementById('planet-life').textContent = info.life;
        document.getElementById('planet-effect').textContent = info.effect;
        document.getElementById('planet-fact').textContent = info.fact;
        document.getElementById('info-container').style.display = 'block';  // Show the container
    }else{
        console.log("Informationt for:", planetName)
    }
}

let labelsVisible = true;
let orbitsVisible = true;
let timeSpeed = 1;

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
function createOrbit(radius, color) {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0);
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

// Handle click and touch events
window.addEventListener('click', onMouseClick, false);
window.addEventListener('touchstart', onTouchStart, false);

function onMouseClick(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    handleClickOrTouch();
    if (intersects.length > 0) {
        const selectedPlanet = intersects[0].object.name.toLowerCase();
        showPlanetInfo(selectedPlanet);
        zoomToPlanet(intersects[0].object);
    } else if (isZoomedIn) {
        resetZoom();
    }
}

function onTouchStart(event) {
    event.preventDefault();
    mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    handleClickOrTouch();
    if (intersects.length > 0) {
        const selectedPlanet = intersects[0].object.name.toLowerCase();
        showPlanetInfo(selectedPlanet);
        zoomToPlanet(intersects[0].object);
    } else if (isZoomedIn) {
        resetZoom();
    }
}

function handleClickOrTouch() {
    if (zoomInProgress) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets);

    if (intersects.length > 0) {
        const selectedPlanet = intersects[0].object;
        zoomToPlanet(selectedPlanet);
    } else if (isZoomedIn) {
        resetZoom();
    }
}

// Function to zoom into a planet
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
    const targetPosition = planet.position.clone().setLength(Math.min(10, maxZoomDistance));
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

// Function to reset zoom
function resetZoom() {
    if (zoomInProgress) return;
    isZoomedIn = false;
    zoomTarget = null;
    orbitControls.target.set(0, 0, 0);
    camera.position.set(0, 50, 100);
    camera.lookAt(0, 0, 0);
    lastClickedPlanet = null;
}

// Animations for the planet rotations and moon orbit
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
const moonOrbitRadius = 2;
let moonAngle = 0;
const moonOrbitSpeed = 0.05;

// Event listener for speed control
document.getElementById('speedRange').addEventListener('input', (event) => {
    timeSpeed = parseFloat(event.target.value);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update planet orbits and rotations
    mercuryAngle += mercuryRotationSpeed * timeSpeed;
    venusAngle += venusRotationSpeed * timeSpeed;
    earthAngle += earthRotationSpeed * timeSpeed;
    marsAngle += marsRotationSpeed * timeSpeed;
    moonAngle += moonOrbitSpeed * timeSpeed;

    // Set positions based on angle
    mercury.position.set(Math.cos(mercuryAngle) * mercuryOrbitRadius, 0, Math.sin(mercuryAngle) * mercuryOrbitRadius);
    venus.position.set(Math.cos(venusAngle) * venusOrbitRadius, 0, Math.sin(venusAngle) * venusOrbitRadius);
    earth.position.set(Math.cos(earthAngle) * earthOrbitRadius, 0, Math.sin(earthAngle) * earthOrbitRadius);
    moon.position.set(earth.position.x + Math.cos(moonAngle) * moonOrbitRadius, 0, earth.position.z + Math.sin(moonAngle) * moonOrbitRadius);

    // If zoomed in, make camera follow planet
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
