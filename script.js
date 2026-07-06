// SCENE
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x87ceeb, 50, 2000);

// CAMERA
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
);
camera.position.set(0, 3, 15);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// LIGHTS
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(100, 200, 100);
scene.add(sun);

// RUNWAY
const runwayGeo = new THREE.BoxGeometry(200, 0.2, 10);
const runwayMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
const runway = new THREE.Mesh(runwayGeo, runwayMat);
runway.position.set(0, 0, 0);
scene.add(runway);

// GROUND
const groundGeo = new THREE.PlaneGeometry(5000, 5000);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.1;
scene.add(ground);

// PLANE
const planeGeo = new THREE.BoxGeometry(2, 0.5, 6);
const planeMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.position.set(0, 1, -80); // behind runway, ready for takeoff
scene.add(plane);

// SKY
const skyGeo = new THREE.SphereGeometry(3000, 32, 32);
const skyMat = new THREE.MeshBasicMaterial({ color: 0x87ceeb, side: THREE.BackSide });
const sky = new THREE.Mesh(skyGeo, skyMat);
scene.add(sky);

// INPUT
const keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// FLIGHT STATE
let throttle = 0.1;
let pitch = 0;
let roll = 0;
let yaw = 0;

function updatePlane() {
    // Throttle
    if (keys["arrowup"]) throttle += 0.005;
    if (keys["arrowdown"]) throttle -= 0.005;
    throttle = THREE.MathUtils.clamp(throttle, 0.05, 1.5);

    // Pitch / Roll / Yaw
    if (keys["w"]) pitch += 0.002;
    if (keys["s"]) pitch -= 0.002;

    if (keys["a"]) roll += 0.003;
    if (keys["d"]) roll -= 0.003;

    if (keys["q"]) yaw += 0.003;
    if (keys["e"]) yaw -= 0.003;

    // Apply rotation
    plane.rotation.x = pitch;
    plane.rotation.z = roll;
    plane.rotation.y += yaw;

    // Forward vector
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(plane.quaternion);
    plane.position.addScaledVector(forward, throttle);

    // Simple lift: if speed high and not on ground, allow climb
    if (plane.position.y < 1 && throttle > 0.3) {
        plane.position.y = 1; // rolling on runway
    }

    // Camera follow
    const camOffset = new THREE.Vector3(0, 3, 15);
    camOffset.applyQuaternion(plane.quaternion);
    camera.position.copy(plane.position).add(camOffset);
    camera.lookAt(plane.position);
}

// LOOP
function animate() {
    requestAnimationFrame(animate);
    updatePlane();
    renderer.render(scene, camera);
}
animate();

// RESIZE
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
