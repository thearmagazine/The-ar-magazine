let scene, camera, renderer;
let gltfModel = null;
let video, stream;
let markerFound = false;

async function startAR() {
  await setupVideo();
  initThreeJS();
  detectLoop(); // image and plane detection
}

document.getElementById('modelUpload').addEventListener('change', handleModelUpload);

function handleModelUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const loader = new THREE.GLTFLoader();
    loader.parse(e.target.result, '', (gltf) => {
      gltfModel = gltf.scene;
      gltfModel.scale.set(0.5, 0.5, 0.5);
      scene.add(gltfModel);
    });
  };
  reader.readAsArrayBuffer(file);
}

async function setupVideo() {
  video = document.getElementById('video');
  stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
  video.srcObject = stream;
  await video.play();
}

function initThreeJS() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.01, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  if (gltfModel && markerFound) {
    gltfModel.rotation.y += 0.01;
  }
  renderer.render(scene, camera);
}

function detectLoop() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const FPS = 10;

  setInterval(() => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    let src = cv.imread(canvas);
    let gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // Simplified marker simulation
    markerFound = true;

    src.delete(); gray.delete();
  }, 1000 / FPS);
}
