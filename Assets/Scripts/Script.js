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
const minZoomDistance = 5;  // Minimum allowed distance for zoom
const maxZoomDistance = 100; // Maximum allowed distance for zoom

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

// Define zoom limits in the camera controls
orbitControls.minDistance = minZoomDistance; // Minimum distance for manual zoom
orbitControls.maxDistance = maxZoomDistance; // Maximum distance for manual zoom

// Load celestial bodies textures
const sunTexture = loader.load('Assets/Images/sun.jpg');
const earthTexture = loader.load('Assets/Images/earth.jpg');
const moonTexture = loader.load('Assets/Images/moon.jpg');
const mercuryTexture = loader.load('Assets/Images/mercury.jpg');
const venusTexture = loader.load('Assets/Images/venus.jpg');
const marsTexture = loader.load('Assets/Images/mars.jpg');
const jupiterTexture = loader.load('Assets/Images/jupiter.jpg');
const saturnTexture = loader.load('Assets/Images/saturn.jpg');
const saturnRingTexture = loader.load('Assets/Images/rings.png');  // Texture for Saturn's rings
const uranusTexture = loader.load('Assets/Images/uranus.jpg');
const neptuneTexture = loader.load('Assets/Images/neptune.jpg');

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

// Add Saturn's rings
function createSaturnRings() {
    const ringGeometry = new THREE.RingGeometry(2.5, 3.5, 64); // Geometry for the rings
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

planets.push(sun, mercury, venus, earth, moon, mars, jupiter, saturn, uranus, neptune);

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

// Cinturón de asteroides
function createAsteroidBelt() {
    const asteroidGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const asteroidMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });

    const asteroidCount = 100;
    for (let i = 0; i < asteroidCount; i++) {
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        const angle = Math.random() * Math.PI * 2;
        const radius = 40 + Math.random() * 5; // Radio del cinturón de asteroides
        asteroid.position.set(Math.cos(angle) * radius, Math.random() * 5 - 2.5, Math.sin(angle) * radius);
        scene.add(asteroid);
    }
}

createAsteroidBelt();

let labelsVisible = true;
let orbitsVisible = true;
let timeSpeed = 1; // Default speed control

// Raycaster for detecting clicks on planets
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Function to create celestial bodies
function createCelestialBody(size, texture, name) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const body = new THREE.Mesh(geometry, material);
    body.name = name; // Assign name to body
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
    const curve = new THREE.EllipseCurve(
        0, 0,            // ax, ay
        radius, radius,   // xRadius, yRadius
        0, 2 * Math.PI,   // startAngle, endAngle
        false,            // clockwise
        0                 // rotation
    );
    const points = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: color });
    const orbit = new THREE.Line(geometry, material);
    orbit.rotation.x = Math.PI / 2; // Rotate to lie flat on the x-z plane
    scene.add(orbit);
    return orbit;
}

function createOrbitAroundPlanet(radius, color, planet) {
    const curve = new THREE.EllipseCurve(
        planet.position.x, planet.position.z,  // ax, ay (centered on the planet)
        radius, radius,   // xRadius, yRadius
        0, 2 * Math.PI,   // startAngle, endAngle
        false,            // clockwise
        0                 // rotation
    );
    const points = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: color });
    const orbit = new THREE.Line(geometry, material);
    orbit.rotation.x = Math.PI / 2; // Rotate to lie flat on the x-z plane
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

// Information for celestial bodies including Ceres, Eris, and Pluto
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
};

// Function to display information about the celestial body
function showPlanetInfo(planetName) {
    console.log("Showing information for: ", planetName);
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

        // Display or hide weight calculation based on the selected planet
        if (planetName.toLowerCase() === 'earth') {
            document.getElementById('weight-input').style.display = 'none';
            document.getElementById('weight-output').style.display = 'none';
        } else {
            document.getElementById('weight-input').style.display = 'block';
            document.getElementById('weight-output').style.display = 'block';
        }

        document.getElementById('info-container').style.display = 'block';  // Show the container
    } else {
        console.log("No information found for: ", planetName);
    }
}

// Function to handle clicks and display information
function onMouseClick(event) {
    if (zoomInProgress) return;  // Prevent clicks during zoom
    if (event.target.closest('#controls')) {
        return;  // Prevent interactions on controls
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

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

// Listen for clicks on computers and mobile devices
window.addEventListener('click', onMouseClick, false);
window.addEventListener('touchstart', onMouseClick, false);

// Function to zoom into a planet with zoom limits
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

// Function to reset the zoom
function resetZoom() {
    if (zoomInProgress) return;  // Prevent reset during zoom
    isZoomedIn = false;
    zoomTarget = null;
    orbitControls.target.set(0, 0, 0);
    camera.position.set(0, 50, 100);
    camera.lookAt(0, 0, 0);
    lastClickedPlanet = null;  // Reset clicked planet
}

// Corrections for the translation speed of the planets
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

// Event listener for the speed control
document.getElementById('speedRange').addEventListener('input', (event) => {
    timeSpeed = parseFloat(event.target.value);
});

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

    // Update labels to follow planets
    labels.forEach(label => {
        label.sprite.position.set(label.planet.position.x, label.planet.position.y + 6, label.planet.position.z);
    });

    // Update Sun's rotation
    sun.rotation.y += sunRotationSpeed;

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
