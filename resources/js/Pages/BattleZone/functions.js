import * as THREE from 'three'

export function playerPosToGridIndex(playerPos, cubeSize) {
  return Math.floor((playerPos.z + 512) / cubeSize) * 256 + Math.floor((playerPos.x + 512) / cubeSize)
}

export function addAxesHelper(scene) {
  const axesHelper = new THREE.AxesHelper(100)
  scene.add(axesHelper)
}
