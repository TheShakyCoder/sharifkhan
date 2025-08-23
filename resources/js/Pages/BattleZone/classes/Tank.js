import * as THREE from 'three';

export default class Tank {
  constructor(scene) {
    if (!scene) return
    this.scene = scene
    this.tank = null

    this.carWidth = 32
    this.carHeight = 8
    this.carLength = 64

    this.bodyMaterial = null
    this.bodyMesh = null

    this.wheelRadius = 8;
    this.wheelThickness = 4;
    this.wheelSegments = 6;

    this.setup()
  }

  setup() {
    this.tank = new THREE.Object3D();
    this.scene.add(this.tank);

    // Body
    const bodyGeometry = new THREE.BoxGeometry(
      this.carWidth,
      this.carHeight,
      this.carLength
    );
    this.bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });

    this.bodyMesh = new THREE.Mesh(bodyGeometry, this.bodyMaterial);
    this.bodyMesh.position.y = 20;
    this.bodyMesh.castShadow = true;
    this.tank.add(this.bodyMesh);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(
      this.wheelRadius,
      this.wheelRadius,
      this.wheelThickness,
      this.wheelSegments
    );
    const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x3e3e3e });
    const wheelPositions = [
      [-this.carWidth / 2 - this.wheelThickness / 2, -this.carHeight / 2, this.carLength / 3],
      [this.carWidth / 2 + this.wheelThickness / 2, -this.carHeight / 2, this.carLength / 3],
      [-this.carWidth / 2 - this.wheelThickness / 2, -this.carHeight / 2, 0],
      [this.carWidth / 2 + this.wheelThickness / 2, -this.carHeight / 2, 0],
      [-this.carWidth / 2 - this.wheelThickness / 2, -this.carHeight / 2, -this.carLength / 3],
      [this.carWidth / 2 + this.wheelThickness / 2, -this.carHeight / 2, -this.carLength / 3]
    ]
    wheelPositions.map((position) => {
      const mesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
      mesh.position.set(...position);
      mesh.rotation.z = Math.PI * 0.5;
      mesh.castShadow = true;

      this.bodyMesh.add(mesh);
      return mesh;
    });


    const domeRadius = 14;
    const domeWidthSubdivisions = 12;
    const domeHeightSubdivisions = 12;
    const domePhiStart = 0;
    const domePhiEnd = Math.PI * 2;
    const domeThetaStart = 0;
    const domeThetaEnd = Math.PI * 0.5;
    const domeGeometry = new THREE.SphereGeometry(
      domeRadius,
      domeWidthSubdivisions,
      domeHeightSubdivisions,
      domePhiStart,
      domePhiEnd,
      domeThetaStart,
      domeThetaEnd
    );
    const domeMesh = new THREE.Mesh(domeGeometry, this.bodyMaterial);
    domeMesh.castShadow = true;
    domeMesh.position.y = 0.5;

    this.bodyMesh.add(domeMesh);

    // Turret
    const turretWidth = 1;
    const turretHeight = 1;
    const turretLength = this.carLength * 0.2
    const turretGeometry = new THREE.BoxGeometry(
      turretWidth,
      turretHeight,
      turretLength
    );
    const turretMesh = new THREE.Mesh(turretGeometry, this.bodyMaterial);
    turretMesh.castShadow = true;
    turretMesh.position.z = turretLength * .5;
    turretMesh.position.y = turretHeight * 2;

    const turretPivot = new THREE.Object3D();
    turretPivot.scale.set(5, 5, 5);
    turretPivot.position.y = .5;
    turretPivot.add(turretMesh);
    this.bodyMesh.add(turretPivot);
  }

  draw(playerPos) {
    this.bodyMesh.position.set(playerPos.x, 12, playerPos.z)
    this.bodyMesh.rotation.y = playerPos.angle + Math.PI
  }
}

