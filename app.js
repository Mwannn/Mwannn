import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// --- CONFIG & THEMES ---
const themes = {
  cyber: {
    bg: 0x08090e,
    primary: 0x7c3aed,
    secondary: 0x06b6d4,
    pink: 0xec4899,
    ambient: 0x22153b,
  },
  matrix: {
    bg: 0x040d08,
    primary: 0x10b981,
    secondary: 0x06b6d4,
    pink: 0x84cc16,
    ambient: 0x092b1a,
  },
  space: {
    bg: 0x050b14,
    primary: 0x3b82f6,
    secondary: 0x8b5cf6,
    pink: 0x06b6d4,
    ambient: 0x0d1f3d,
  }
};

let currentThemeKey = 'cyber';
let isWarpSpeed = false;

// --- INITIALIZE THREE.JS SCENE ---
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(themes[currentThemeKey].bg, 0.015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(themes.cyber.ambient, 2.5);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(themes.cyber.primary, 4, 100);
pointLight1.position.set(15, 15, 15);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(themes.cyber.secondary, 4, 100);
pointLight2.position.set(-15, -15, -10);
scene.add(pointLight2);

// --- 3D FLOATING GEOMETRIES ---
const geometryGroup = new THREE.Group();
scene.add(geometryGroup);

// 1. Torus Knot (Main Center Cyber Core)
const torusGeometry = new THREE.TorusKnotGeometry(4.5, 1.2, 128, 32);
const torusMaterial = new THREE.MeshStandardMaterial({
  color: themes.cyber.primary,
  wireframe: true,
  roughness: 0.2,
  metalness: 0.8,
  emissive: 0x3b0764,
  emissiveIntensity: 0.5
});
const torusKnot = new THREE.Mesh(torusGeometry, torusMaterial);
torusKnot.position.set(0, 0, -5);
geometryGroup.add(torusKnot);

// 2. Floating Icosahedron
const icoGeometry = new THREE.IcosahedronGeometry(2.5, 0);
const icoMaterial = new THREE.MeshStandardMaterial({
  color: themes.cyber.secondary,
  wireframe: true,
  emissive: 0x083344,
});
const icosahedron = new THREE.Mesh(icoGeometry, icoMaterial);
icosahedron.position.set(-18, 10, -12);
geometryGroup.add(icosahedron);

// 3. Floating Octahedron
const octaGeometry = new THREE.OctahedronGeometry(2, 0);
const octaMaterial = new THREE.MeshStandardMaterial({
  color: themes.cyber.pink,
  wireframe: true,
});
const octahedron = new THREE.Mesh(octaGeometry, octaMaterial);
octahedron.position.set(18, -10, -10);
geometryGroup.add(octahedron);

// 4. Cyber Ring Mesh Grid
const ringGeo = new THREE.RingGeometry(12, 12.5, 64);
const ringMat = new THREE.MeshBasicMaterial({
  color: themes.cyber.secondary,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.35,
  wireframe: true
});
const cyberRing = new THREE.Mesh(ringGeo, ringMat);
cyberRing.rotation.x = Math.PI / 3;
cyberRing.position.set(0, 0, -8);
geometryGroup.add(cyberRing);

// --- PARTICLE STARFIELD ENGINE ---
const particleCount = 1800;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleScales = new Float32Array(particleCount);

for (let i = 0; i < particleCount * 3; i += 3) {
  particlePositions[i] = (Math.random() - 0.5) * 120;
  particlePositions[i + 1] = (Math.random() - 0.5) * 120;
  particlePositions[i + 2] = (Math.random() - 0.5) * 120;
  particleScales[i / 3] = Math.random();
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

const particleMaterial = new THREE.PointsMaterial({
  color: themes.cyber.secondary,
  size: 0.3,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending
});

const starField = new THREE.Points(particleGeometry, particleMaterial);
scene.add(starField);

// --- MOUSE PARALLAX INTERACTION ---
let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;

window.addEventListener('mousemove', (e) => {
  targetMouseX = (e.clientX - window.innerWidth / 2) * 0.001;
  targetMouseY = (e.clientY - window.innerHeight / 2) * 0.001;
  
  // Custom cursor glow movement
  const cursor = document.getElementById('cursor-glow');
  if (cursor) {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  }
});

// Scroll depth reaction
let scrollY = 0;
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
});

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();
  const speedMultiplier = isWarpSpeed ? 8 : 1;

  // Smooth mouse interpolation
  mouseX += (targetMouseX - mouseX) * 0.05;
  mouseY += (targetMouseY - mouseY) * 0.05;

  // Rotate 3D Geometries
  torusKnot.rotation.x = elapsedTime * 0.3 * speedMultiplier + mouseY * 2;
  torusKnot.rotation.y = elapsedTime * 0.4 * speedMultiplier + mouseX * 2;

  icosahedron.rotation.x = elapsedTime * 0.5 * speedMultiplier;
  icosahedron.rotation.y = elapsedTime * 0.5 * speedMultiplier;
  icosahedron.position.y = 10 + Math.sin(elapsedTime * 1.5) * 1.5;

  octahedron.rotation.x = elapsedTime * -0.6 * speedMultiplier;
  octahedron.rotation.z = elapsedTime * 0.4 * speedMultiplier;
  octahedron.position.y = -10 + Math.cos(elapsedTime * 1.5) * 1.5;

  cyberRing.rotation.z = elapsedTime * 0.15 * speedMultiplier;

  // Starfield subtle animation / Warp effect
  if (isWarpSpeed) {
    starField.rotation.y += 0.02;
    starField.rotation.x += 0.01;
  } else {
    starField.rotation.y = elapsedTime * 0.03 + mouseX * 0.5;
    starField.rotation.x = elapsedTime * 0.02 + mouseY * 0.5;
  }

  // Camera scroll parallax effect
  camera.position.y = -scrollY * 0.015;
  camera.position.x = mouseX * 10;
  camera.lookAt(0, -scrollY * 0.015, 0);

  renderer.render(scene, camera);
}

animate();

// --- RESIZE HANDLER ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// --- THEME SWITCHER CONTROLS ---
window.setTheme = function(themeName) {
  if (!themes[themeName]) return;
  currentThemeKey = themeName;
  const t = themes[themeName];

  document.documentElement.setAttribute('data-theme', themeName);
  scene.fog.color.setHex(t.bg);
  ambientLight.color.setHex(t.ambient);
  pointLight1.color.setHex(t.primary);
  pointLight2.color.setHex(t.secondary);

  torusMaterial.color.setHex(t.primary);
  icoMaterial.color.setHex(t.secondary);
  octaMaterial.color.setHex(t.pink);
  ringMat.color.setHex(t.secondary);
  particleMaterial.color.setHex(t.secondary);
};

// --- WARP SPEED TOGGLE ---
window.toggleWarpSpeed = function() {
  isWarpSpeed = !isWarpSpeed;
  const btn = document.getElementById('btn-warp');
  if (btn) {
    btn.innerHTML = isWarpSpeed ? '⚡ WARP: ON' : '🚀 WARP: OFF';
    btn.style.borderColor = isWarpSpeed ? 'var(--accent-pink)' : 'rgba(255,255,255,0.12)';
  }
};

// --- 3D GLASS CARD MOUSE TILT PHYSICS ---
document.querySelectorAll('.glass-card-3d').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  });
});
