<script setup>
import * as THREE from 'three'
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import MiniMap from './classes/MiniMap.js'

const playerPos = reactive({ x: 0, z: 0, angle: 0 })
const gridSize = 16
const cubeSize = 128
const playerSize = 32
const keys = reactive({})
const minimapCanvas = ref(null)
const minimap = new MiniMap(minimapCanvas)
const cameraState = ref('front')
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

// Add to your init() function after creating the scene
function addAxesHelper() {
  const axesHelper = new THREE.AxesHelper(100)
  scene.add(axesHelper)
}

function handleKeyDown(event) {
  keys[event.key.toLowerCase()] = true
}

function handleKeyUp(event) {
  keys[event.key.toLowerCase()] = false
}

// Add this to your init() function after the ambient light
function addSunLight() {
  // Create directional light (sun)
  const sunLight = new THREE.DirectionalLight(0xffffff, 1)
  sunLight.position.set(0, 200, 0) // Position above the scene
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
  floorMesh.position.set(512, -64, 512)
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
      cube.position.set(x, -32, z)
      cube.castShadow = true
      cube.receiveShadow = true

      scene.add(cube)
      gridMeshes.push(cube)
    }
  }

  // In your init() function, after creating the player mesh:
  const playerGeometry = new THREE.BoxGeometry(playerSize, playerSize, playerSize)
  const playerMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 })
  playerMesh = new THREE.Mesh(playerGeometry, playerMaterial)
  playerMesh.position.set(playerPos.x , -32, playerPos.z)
  playerMesh.castShadow = true  // Set shadow here, after creation
  scene.add(playerMesh)

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1)
  scene.add(ambientLight)

  addSunLight()

  // Handle window resize
  window.addEventListener('resize', onWindowResize)

  animate()

  addAxesHelper()
}

function checkCollision(newX, newZ) {
  const gridIndex = Math.floor((newZ + 512) / cubeSize) * gridSize + Math.floor((newX + 512) / cubeSize)
  return grid[gridIndex] === 1
}

function updatePlayer() {
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

  // Update 3D objects
  if (playerMesh) {
    playerMesh.position.set(playerPos.x, -32, playerPos.z)
    playerMesh.rotation.y = playerPos.angle
  }
  if (camera) {
    if (cameraState.value === 'front') {
      camera.position.set(
        playerPos.x + Math.sin(playerPos.angle) * 100, // 100 behind
        -0,
        playerPos.z + Math.cos(playerPos.angle) * 100  // 100 behind
      )
      camera.rotation.y = playerPos.angle
      camera.lookAt(playerPos.x, -32, playerPos.z)
    } else if (cameraState.value === 'top') {
      camera.position.set(playerPos.x, 300, playerPos.z)
      camera.lookAt(playerPos.x, 0, playerPos.z)
    } else if (cameraState.value === 'swivel') {
      camera.position.set(playerPos.x, 300, playerPos.z)
      camera.rotation.x = -Math.PI / 2
      camera.rotation.z = playerPos.angle
      camera.rotation.y = 0
    }
  }

  minimap.draw(grid, playerPos, cubeSize, gridSize)
}

function animate() {
  requestAnimationFrame(animate)
  updatePlayer()
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
</style>
