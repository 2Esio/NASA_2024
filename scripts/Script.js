// Set up scene
const scene = new THREE.Scene();

// Load background texture (Starfield)
const loader = new THREE.TextureLoader();
const bgTexture = loader.load('src/background.jpg');
scene.background = bgTexture;

// Set up camera and view states
let isFPV = false; //View state

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 100); //Default extrernal view

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Orbit and first-person controls
const orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true; // Add smoothn damping to zoom/pan/rotate
orbitControls.dampingFactor = 0.1;
orbitControls.enableZoom = true; //Enable zoom by default for planet view

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

// Creare celestial bodies
const celestial_bodies = [];
const sun = createCelestialBody(5, sunTexture);
const mercury = createCelestialBody(0.5, mercuryTexture);
const venus = createCelestialBody(0.9, venusTexture);
const earth = createCelestialBody(1, earthTexture);
const moon = createCelestialBody(0.27, moonTexture);
const mars = createCelestialBody(0.8, marsTexture);
const jupiter = createCelestialBody(2, jupiterTexture);
const saturn = createCelestialBody(1.8, saturnTexture);
const uranus = createCelestialBody(1.2, uranusTexture);
const neptune = createCelestialBody(1.3, neptuneTexture);

planets.push(sun, mercury, venus, earth, moon, mars, jupiter, saturn, uranus, neptune);

// Function to create celestial bodies
function createCelestialBody(size, texture){
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const body = new THREE.Mesh(geometry, material);
    scene.add(body);
    return body;
}