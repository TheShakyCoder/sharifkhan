<script setup>
import * as THREE from 'three'
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import MiniMap from './classes/MiniMap.js'
import Tank from './classes/Tank.js'
import Shell from './classes/Shell.js'
import { addAxesHelper } from './functions.js'

const playerPos = reactive({ x: 0, z: 0, angle: 0 })
const gridSize = 16
const cubeSize = 128
const playerSize = 32
const keys = reactive({})
const minimapCanvas = ref(null)
const minimap = new MiniMap(minimapCanvas)
let spacebarPressed = false

const cameraState = ref('front')
const showControls = ref(true)
const grid = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1,
  1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1,
  1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1,
  1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1,
  1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
  1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
  1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1,
  1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
]

let scene
let camera
let renderer
let playerMesh
let floorMesh
let gridMeshes = []
let shells = []

let playerTank = new Tank(scene)



function handleKeyDown(event) {
  keys[event.key.toLowerCase()] = true
}

function handleKeyUp(event) {
  keys[event.key.toLowerCase()] = false
  if(event.key.toLowerCase() === ' ') {
    spacebarPressed = false
  }
}

// Add this to your init() function after the ambient light
function addSunLight() {
  // Create directional light (sun)
  const sunLight = new THREE.DirectionalLight(0xffffff, 2)
  sunLight.position.set(0, 500, 0) // Position above the scene
  sunLight.castShadow = true

  // Configure shadow properties
  sunLight.shadow.mapSize.width = gridSize * cubeSize
  sunLight.shadow.mapSize.height = gridSize * cubeSize
  sunLight.shadow.camera.near = 0.5
  sunLight.shadow.camera.far = 500
  sunLight.shadow.camera.left = -gridSize * cubeSize / 2
  sunLight.shadow.camera.right = gridSize * cubeSize / 2
  sunLight.shadow.camera.top = gridSize * cubeSize / 2
  sunLight.shadow.camera.bottom = -gridSize * cubeSize / 2

  scene.add(sunLight)

  // Add a helper to visualize the light (optional, for debugging)
  const helper = new THREE.DirectionalLightHelper(sunLight, 50)
  scene.add(helper)
}

function init() {
  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x82DBC5)

  playerTank = new Tank(scene)

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(playerPos.x + playerSize/2, 64, playerPos.z + playerSize/2)
  camera.rotation.y = playerPos.angle

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.getElementById('container').appendChild(renderer.domElement)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  // Floor
  const floorGeometry = new THREE.PlaneGeometry(gridSize * cubeSize, gridSize * cubeSize)
  const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 })
  floorMesh = new THREE.Mesh(floorGeometry, floorMaterial)
  floorMesh.rotation.x = -Math.PI / 2
  floorMesh.position.set(512, 0, 512)
  floorMesh.receiveShadow = true
  scene.add(floorMesh)

  // Grid cubes
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === 1) {
      const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)
      const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 })
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)

      const x = -gridSize * cubeSize / 4 + ((i % gridSize) * cubeSize + cubeSize / 2)
      const z = -gridSize * cubeSize / 4 + ((Math.floor(i / gridSize)) * cubeSize + cubeSize / 2)
      cube.position.set(x, 64, z)
      cube.castShadow = true
      cube.receiveShadow = true

      scene.add(cube)
      gridMeshes.push(cube)
    }
  }

  playerTank.draw(playerPos)

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 2)
  scene.add(ambientLight)

  addSunLight()

  // Handle window resize
  window.addEventListener('resize', onWindowResize)

  animate()

  addAxesHelper(scene)
}

function checkCollision(newX, newZ) {
  const gridIndex = Math.floor((newZ + 512) / cubeSize) * gridSize + Math.floor((newX + 512) / cubeSize)
  return grid[gridIndex] === 1
}

function update() {
  const speed = 1
  const rotationSpeed = 0.01

  if (keys['a']) {
    playerPos.angle += rotationSpeed
  }
  if (keys['d']) {
    playerPos.angle -= rotationSpeed
  }
  if (keys['w']) {
    const newX = playerPos.x - Math.sin(playerPos.angle) * speed
    const newZ = playerPos.z - Math.cos(playerPos.angle) * speed
    if (!checkCollision(parseInt(newX), parseInt(newZ))) {
      playerPos.x = newX
      playerPos.z = newZ
    }
  }
  if (keys['s']) {
    const newX = playerPos.x + Math.sin(playerPos.angle) * speed
    const newZ = playerPos.z + Math.cos(playerPos.angle) * speed
    if (!checkCollision(parseInt(newX), parseInt(newZ))) {
      playerPos.x = newX
      playerPos.z = newZ
    }
  }
  if(keys['1']) {
    cameraState.value = 'top'
  }
  if(keys['2']) {
    cameraState.value = 'front'
  }
  if(keys['3']) {
    cameraState.value = 'swivel'
  }

  // Shooting logic
  if(keys[' '] && !spacebarPressed) { // spacebar
    spacebarPressed = true
    const shellStartPos = {
      x: playerPos.x,
      y: 0, // at ground level
      z: playerPos.z
    }
    const shell = new Shell(scene, shellStartPos, playerPos.angle)
    shells.push(shell)
  }

  // Update 3D objects
  if (playerMesh) {
    playerMesh.position.set(playerPos.x, -32, playerPos.z)
    playerMesh.rotation.y = playerPos.angle
  }
  if (camera) {
    if (cameraState.value === 'front') {
      camera.position.set(
        playerPos.x + Math.sin(playerPos.angle) * 100,
        64,
        playerPos.z + Math.cos(playerPos.angle) * 100
      )
      camera.rotation.y = playerPos.angle
      camera.lookAt(playerPos.x, 0, playerPos.z)
    } else if (cameraState.value === 'top') {
      camera.position.set(playerPos.x, 512, playerPos.z)
      camera.lookAt(playerPos.x, 0, playerPos.z)
    } else if (cameraState.value === 'swivel') {
        camera.position.set(playerPos.x, 768, playerPos.z)

      camera.rotation.x = -Math.PI / 2
      camera.rotation.z = playerPos.angle
      camera.rotation.y = 0
    }
  }

  minimap.draw(grid, playerPos, cubeSize, gridSize)
  playerTank.draw(playerPos)
}

function animate() {
  requestAnimationFrame(animate)
  update()

  // Update shells
  for (let i = shells.length - 1; i >= 0; i--) {
    const shell = shells[i]
    if (!shell.update()) {
      shells.splice(i, 1) // Remove dead shells
    }
  }

  renderer.render(scene, camera)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}


onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  init()
  minimap.draw(grid, playerPos, cubeSize, gridSize)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  window.removeEventListener('resize', onWindowResize)
  if (renderer) {
    renderer.dispose()
  }
})
</script>

<template>
  <div id="container"></div>
  <div class="minimap">
    <canvas ref="minimapCanvas" width="256" height="256"></canvas>
  </div>

  <!-- Controls Modal -->
  <div v-if="showControls" class="modal-overlay">
    <div class="modal">
      <h2>BattleZone Controls</h2>
      <div class="controls-grid">
        <div class="control-group">
          <h3>Movement</h3>
          <div class="control-item">
            <span class="key">W</span>
            <span class="description">Move Forward</span>
          </div>
          <div class="control-item">
            <span class="key">S</span>
            <span class="description">Move Backward</span>
          </div>
          <div class="control-item">
            <span class="key">A</span>
            <span class="description">Turn Left</span>
          </div>
          <div class="control-item">
            <span class="key">D</span>
            <span class="description">Turn Right</span>
          </div>
        </div>

        <div class="control-group">
          <h3>Camera</h3>
          <div class="control-item">
            <span class="key">1</span>
            <span class="description">Top View</span>
          </div>
          <div class="control-item">
            <span class="key">2</span>
            <span class="description">Front View</span>
          </div>
          <div class="control-item">
            <span class="key">3</span>
            <span class="description">Swivel View</span>
          </div>
        </div>

        <div class="control-group">
          <h3>Combat</h3>
          <div class="control-item">
            <span class="key">SPACE</span>
            <span class="description">Fire Shell</span>
          </div>
        </div>
      </div>

      <button @click="showControls = false" class="close-btn">
        Start Game
      </button>
    </div>
  </div>
</template>

<style lang="scss">
#container {
  width: 100%;
  height: 100%;
}
.minimap {
  position: fixed;
  top: 20px;
  right: 20px;
  border: 2px solid #333;
  background: #82DBC5;
  z-index: 1000;
}

.minimap canvas {
  display: block;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal {
  background: #2a2a2a;
  color: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.modal h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #82DBC5;
  font-size: 1.8rem;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.control-group h3 {
  color: #82DBC5;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.control-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
}

.key {
  background: #82DBC5;
  color: #2a2a2a;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-weight: bold;
  font-family: monospace;
  min-width: 60px;
  text-align: center;
}

.description {
  color: #ccc;
}

.close-btn {
  background: #82DBC5;
  color: #2a2a2a;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 5px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  display: block;
  margin: 0 auto;
  transition: background 0.3s;
}

.close-btn:hover {
  background: #6bc4b3;
}
</style>
