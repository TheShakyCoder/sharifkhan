import * as THREE from 'three';

export default class Shell {
  constructor(scene, startPosition, direction) {
    this.scene = scene;
    this.position = { x: startPosition.x, y: startPosition.y, z: startPosition.z };
    this.direction = direction;
    this.speed = 10;
    this.life = 1000; // frames to live
    this.currentFrame = 0;

    this.createMesh();
  }

  createMesh() {
    const geometry = new THREE.SphereGeometry(4, 8, 8); // Changed from 8 to 4
    const material = new THREE.MeshLambertMaterial({ color: 0xffff00 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);
    this.mesh.castShadow = true;
    this.scene.add(this.mesh);
  }

  update() {
    // Move shell in direction
    this.position.x += Math.sin(-this.direction) * this.speed;
    this.position.z -= Math.cos(-this.direction) * this.speed;

    // Update mesh position
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);

    // Increment frame counter
    this.currentFrame++;

    // Check if shell should be destroyed
    if (this.currentFrame >= this.life) {
      this.destroy();
      return false; // shell is dead
    }

    return true; // shell is alive
  }

  destroy() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
  }
}
