// Set up scene
const scene = new THREE.Scene();

// Load background texture (Starfield)
const loader = new THREE.TextureLoader();
const bgTexture = loader.load('src/background.jpg');
scene.background = bgTexture;

// Set up camera and view states
let isZoomedIn = false; // View state for zoom

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

const pointerControls = new THREE.PointerLockControls(camera, renderer.domElement);

// Load celestial bodies textures
const sunTexture = loader.load('src/sun.jpg');
const earthTexture = loader.load('src/earth.jpg');
const moonTexture = loader.load('src/moon.jpg');
const mercuryTexture = loader.load('src/mercury.jpg');
const venusTexture = loader.load('src/venus.jpg');
const marsTexture = loader.load('src/mars.jpg');
const jupiterTexture = loader.load('src/jupiter.jpg');
const saturnTexture = loader.load('src/saturn.jpg');
const uranusTexture = loader.load('src/uranus.jpg');
const neptuneTexture = loader.load('src/neptune.jpg');

// Create celestial bodies
const planets = [];
const sun = createCelestialBody(5, sunTexture);
const mercury = createCelestialBody(0.5, mercuryTexture); // Añadir Mercurio
const venus = createCelestialBody(0.9, venusTexture);
const earth = createCelestialBody(1, earthTexture);
const moon = createCelestialBody(0.27, moonTexture);
const mars = createCelestialBody(0.8, marsTexture);
const jupiter = createCelestialBody(2, jupiterTexture);
const saturn = createCelestialBody(1.8, saturnTexture);
const uranus = createCelestialBody(1.2, uranusTexture);
const neptune = createCelestialBody(1.3, neptuneTexture);

planets.push(sun, mercury, venus, earth, moon, mars, jupiter, saturn, uranus, neptune);

// Add labels
const labels = [];
labels.push(createLabel('Sun', sun));
labels.push(createLabel('Mercury', mercury));  // Añadir label para Mercurio
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
orbits.push(createOrbit(8, 0xaaaaaa)); // Añadir órbita de Mercurio
orbits.push(createOrbit(20, 0x00ff00)); // Earth's orbit
orbits.push(createOrbit(30, 0xff0000)); // Mars' orbit
orbits.push(createOrbit(15, 0x0000ff)); // Venus' orbit
orbits.push(createOrbitAroundPlanet(2, 0xffffff, earth)); // Moon's orbit around Earth
orbits.push(createOrbit(40, 0xffa500)); // Jupiter's orbit
orbits.push(createOrbit(50, 0xffff00)); // Saturn's orbit
orbits.push(createOrbit(60, 0x00ffff)); // Uranus's orbit
orbits.push(createOrbit(70, 0x0000ff)); // Neptune's orbit

let labelsVisible = true;
let orbitsVisible = true;
let timeSpeed = 1; // Default speed control
let zoomTarget = null; // Keeps track of the planet or moon we're zoomed into

// Raycaster for detecting clicks on planets
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Function to create celestial bodies
function createCelestialBody(size, texture) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const body = new THREE.Mesh(geometry, material);
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

    // Return both sprite and planet to update position
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

function switchView() {
    if (!isZoomedIn) {
        pointerControls.lock();
    } else {
        pointerControls.unlock();
    }
    isZoomedIn = !isZoomedIn;
}

// Raycasting to detect clicks or touches on planets or moon
function onMouseClick(event) {
    if (event.target.closest('#controls')) {
        return;
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets);

    if (intersects.length > 0) {
        zoomToPlanet(intersects[0].object);
    } else if (isZoomedIn) {
        resetZoom();
    }
}

// Load textures for Saturn's rings
const saturnRingTexture = loader.load('src/rings.png');

// Function to create Saturn's rings
function createSaturnRings() {
    const ringGeometry = new THREE.RingGeometry(2, 3.5, 64); // Adjust inner/outer radius for the rings
    const ringMaterial = new THREE.MeshBasicMaterial({
        map: saturnRingTexture, // Apply the ring texture
        side: THREE.DoubleSide, // Render both sides of the ring
        transparent: true // Make the texture transparent where needed
    });
    const saturnRings = new THREE.Mesh(ringGeometry, ringMaterial);
    saturnRings.rotation.x = Math.PI / 2; // Align the rings to the x-z plane
    saturn.add(saturnRings); // Attach the rings to Saturn
}

// Call the function to create Saturn's rings
createSaturnRings();

function onTouchStart(event) {
    if (event.target.closest('#controls')) {
        return;
    }

    if (event.touches.length == 1) {
        event.preventDefault();
        const touch = event.touches[0];
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(planets);

        if (intersects.length > 0) {
            zoomToPlanet(intersects[0].object);
        } else if (isZoomedIn) {
            resetZoom();
        }
    }
}

function zoomToPlanet(planet) {
    isZoomedIn = true;
    zoomTarget = planet;
    orbitControls.enabled = true;
    orbitControls.target.copy(planet.position);
    orbitControls.update();

    const zoomDuration = 1;
    const initialPosition = camera.position.clone();
    const targetPosition = planet.position.clone().setLength(10);

    let zoomProgress = 0;
    const zoomInterval = setInterval(() => {
        zoomProgress += 0.02;
        if (zoomProgress >= 1) {
            clearInterval(zoomInterval);
        }
        camera.position.lerpVectors(initialPosition, targetPosition, zoomProgress);
        camera.lookAt(planet.position);
    }, 16);
}

function resetZoom() {
    isZoomedIn = false;
    zoomTarget = null;
    orbitControls.target.set(0, 0, 0);
    camera.position.set(0, 50, 100);
    camera.lookAt(0, 0, 0);
}

window.addEventListener('click', onMouseClick, false); // For desktop clicks
window.addEventListener('touchstart', onTouchStart, false); // For mobile touches

// Set initial positions and rotation speeds
const mercuryOrbitRadius = 8;  // Mercurio (más cercano al Sol)
let mercuryAngle = 0;
const mercuryRotationSpeed = 0.1;  // Velocidad más rápida

const venusOrbitRadius = 15;  // Venus
let venusAngle = 0;
const venusRotationSpeed = 0.08;  // Velocidad rápida

const earthOrbitRadius = 20;  // Tierra
let earthAngle = 0;
const earthRotationSpeed = 0.07;

const marsOrbitRadius = 30;  // Marte
let marsAngle = 0;
const marsRotationSpeed = 0.06;

const jupiterOrbitRadius = 40;  // Júpiter
let jupiterAngle = 0;
const jupiterRotationSpeed = 0.04;  // Más lento debido a estar más lejos

const saturnOrbitRadius = 50;  // Saturno
let saturnAngle = 0;
const saturnRotationSpeed = 0.03;

const uranusOrbitRadius = 60;  // Urano
let uranusAngle = 0;
const uranusRotationSpeed = 0.02;  // Velocidad más lenta

const neptuneOrbitRadius = 70;  // Neptuno (más lejano)
let neptuneAngle = 0;
const neptuneRotationSpeed = 0.01;  // Velocidad muy lenta

const moonOrbitRadius = 2;  // Órbita de la luna alrededor de la Tierra
let moonAngle = 0;
const moonOrbitSpeed = 0.05;  // La Luna mantiene su velocidad

const sunRotationSpeed = 0.01;  // Rotación lenta del Sol

// Event listener for the speed control
document.getElementById('speedRange').addEventListener('input', (event) => {
    timeSpeed = parseFloat(event.target.value);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update planet orbits
    mercuryAngle += mercuryRotationSpeed * timeSpeed;  // Velocidad más rápida para Mercurio
    venusAngle += venusRotationSpeed * timeSpeed;
    earthAngle += earthRotationSpeed * timeSpeed;
    marsAngle += marsRotationSpeed * timeSpeed;
    jupiterAngle += jupiterRotationSpeed * timeSpeed;
    saturnAngle += saturnRotationSpeed * timeSpeed;
    uranusAngle += uranusRotationSpeed * timeSpeed;
    neptuneAngle += neptuneRotationSpeed * timeSpeed;
    moonAngle += moonOrbitSpeed * timeSpeed;  // Órbita de la luna

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

    // Update sun's rotation
    sun.rotation.y += sunRotationSpeed;

    // If zoomed in, make camera follow planet
    if (isZoomedIn && zoomTarget) {
        camera.position.set(
            zoomTarget.position.x + 10, 
            zoomTarget.position.y + 5,  
            zoomTarget.position.z + 10  
        );
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
