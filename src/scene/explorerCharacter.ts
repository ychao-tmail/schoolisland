import * as THREE from "three";

export interface ExplorerRig {
  group: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  bodyPivot: THREE.Group;
  shadowDisc: THREE.Mesh;
  targetMarker: THREE.Mesh;
  updateAnimation: (dt: number, speed: number, verticalOffset: number, celebrating: boolean) => void;
  setTargetMarker: (pos: THREE.Vector3 | null, time: number) => void;
  dispose: () => void;
}

export function createExplorerCharacter(scene: THREE.Scene): ExplorerRig {
  const disposables: { dispose: () => void }[] = [];
  const reg = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  const group = new THREE.Group();
  const bodyPivot = new THREE.Group();
  group.add(bodyPivot);

  const skinMat = reg(new THREE.MeshStandardMaterial({ color: 0xf4ccb0, roughness: 0.72 }));
  const jacketMat = reg(new THREE.MeshStandardMaterial({ color: 0x0f6b78, roughness: 0.65 }));
  const pantsMat = reg(new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.8 }));
  const capMat = reg(new THREE.MeshStandardMaterial({ color: 0xe68a2e, roughness: 0.62 }));
  const packMat = reg(new THREE.MeshStandardMaterial({ color: 0xd95f43, roughness: 0.72 }));
  const eyeMat = reg(new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35 }));
  const shoeMat = reg(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }));

  // 1. Legs (pivoted at hip y = 0.24)
  const legGeo = reg(new THREE.BoxGeometry(0.085, 0.2, 0.085));
  const shoeGeo = reg(new THREE.BoxGeometry(0.095, 0.055, 0.13));

  const makeLeg = (x: number) => {
    const legPivot = new THREE.Group();
    legPivot.position.set(x, 0.24, 0);
    const legMesh = new THREE.Mesh(legGeo, pantsMat);
    legMesh.position.y = -0.1;
    legMesh.castShadow = true;
    const shoeMesh = new THREE.Mesh(shoeGeo, shoeMat);
    shoeMesh.position.set(0, -0.21, 0.02);
    legPivot.add(legMesh, shoeMesh);
    return legPivot;
  };

  const leftLeg = makeLeg(-0.075);
  const rightLeg = makeLeg(0.075);
  bodyPivot.add(leftLeg, rightLeg);

  // 2. Torso & Backpack
  const torsoGeo = reg(new THREE.CylinderGeometry(0.115, 0.13, 0.28, 10));
  const torso = new THREE.Mesh(torsoGeo, jacketMat);
  torso.position.y = 0.38;
  torso.castShadow = true;
  bodyPivot.add(torso);

  const packGeo = reg(new THREE.BoxGeometry(0.2, 0.22, 0.11));
  const pack = new THREE.Mesh(packGeo, packMat);
  pack.position.set(0, 0.39, -0.13);
  pack.castShadow = true;
  bodyPivot.add(pack);

  // 3. Arms (pivoted at shoulder y = 0.48)
  const armGeo = reg(new THREE.BoxGeometry(0.07, 0.2, 0.07));
  const makeArm = (x: number) => {
    const armPivot = new THREE.Group();
    armPivot.position.set(x, 0.48, 0);
    const armMesh = new THREE.Mesh(armGeo, jacketMat);
    armMesh.position.y = -0.09;
    armMesh.castShadow = true;
    armPivot.add(armMesh);
    return armPivot;
  };
  const leftArm = makeArm(-0.165);
  const rightArm = makeArm(0.165);
  bodyPivot.add(leftArm, rightArm);

  // 4. Head, Eyes & Peaked Student Cap
  const headGeo = reg(new THREE.SphereGeometry(0.145, 16, 12));
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 0.65;
  head.castShadow = true;
  bodyPivot.add(head);

  const eyeGeo = reg(new THREE.SphereGeometry(0.022, 8, 6));
  for (const ex of [-0.052, 0.052]) {
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(ex, 0.655, 0.128);
    bodyPivot.add(eye);
  }

  const capDomeGeo = reg(new THREE.SphereGeometry(0.152, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.54));
  const capDome = new THREE.Mesh(capDomeGeo, capMat);
  capDome.position.y = 0.675;
  capDome.castShadow = true;
  bodyPivot.add(capDome);

  const brimGeo = reg(new THREE.BoxGeometry(0.22, 0.025, 0.14));
  const brim = new THREE.Mesh(brimGeo, capMat);
  brim.position.set(0, 0.685, 0.13);
  bodyPivot.add(brim);

  // 5. Soft Ground Contact Shadow Disc
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = 64;
  shadowCanvas.height = 64;
  const ctx = shadowCanvas.getContext("2d");
  if (ctx) {
    const grd = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
    grd.addColorStop(0, "rgba(15, 23, 42, 0.42)");
    grd.addColorStop(1, "rgba(15, 23, 42, 0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 64, 64);
  }
  const shadowTex = reg(new THREE.CanvasTexture(shadowCanvas));
  shadowTex.colorSpace = THREE.SRGBColorSpace;
  const shadowGeo = reg(new THREE.PlaneGeometry(0.55, 0.55));
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = reg(
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    }),
  );
  const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
  shadowDisc.position.y = 0.015;
  group.add(shadowDisc);

  // 6. Click-to-Walk Destination Ring Marker
  const markerGeo = reg(new THREE.RingGeometry(0.16, 0.25, 24));
  markerGeo.rotateX(-Math.PI / 2);
  const markerMat = reg(
    new THREE.MeshBasicMaterial({
      color: 0x0f766e,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    }),
  );
  const targetMarker = new THREE.Mesh(markerGeo, markerMat);
  targetMarker.visible = false;
  scene.add(targetMarker);

  scene.add(group);

  let walkPhase = 0;

  return {
    group,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    bodyPivot,
    shadowDisc,
    targetMarker,
    updateAnimation(dt: number, speed: number, verticalOffset: number, celebrating: boolean) {
      if (speed > 0.15) {
        walkPhase += dt * Math.min(14, 5.5 + speed * 2.2);
        const swing = Math.sin(walkPhase) * 0.65;
        leftLeg.rotation.x = swing;
        rightLeg.rotation.x = -swing;
        leftArm.rotation.x = -swing * 0.8;
        rightArm.rotation.x = swing * 0.8;
        leftArm.rotation.z = 0;
        rightArm.rotation.z = 0;
        bodyPivot.position.y = verticalOffset + Math.abs(Math.sin(walkPhase)) * 0.05;
      } else if (celebrating) {
        walkPhase += dt * 7.5;
        leftLeg.rotation.x = THREE.MathUtils.damp(leftLeg.rotation.x, 0, 12, dt);
        rightLeg.rotation.x = THREE.MathUtils.damp(rightLeg.rotation.x, 0, 12, dt);
        leftArm.rotation.z = -2.2 + Math.sin(walkPhase) * 0.35;
        rightArm.rotation.z = 2.2 - Math.sin(walkPhase) * 0.35;
        bodyPivot.position.y = verticalOffset + Math.abs(Math.sin(walkPhase * 0.7)) * 0.12;
      } else {
        leftLeg.rotation.x = THREE.MathUtils.damp(leftLeg.rotation.x, 0, 12, dt);
        rightLeg.rotation.x = THREE.MathUtils.damp(rightLeg.rotation.x, 0, 12, dt);
        leftArm.rotation.x = THREE.MathUtils.damp(leftArm.rotation.x, 0, 12, dt);
        rightArm.rotation.x = THREE.MathUtils.damp(rightArm.rotation.x, 0, 12, dt);
        leftArm.rotation.z = THREE.MathUtils.damp(leftArm.rotation.z, 0, 10, dt);
        rightArm.rotation.z = THREE.MathUtils.damp(rightArm.rotation.z, 0, 10, dt);
        bodyPivot.position.y = verticalOffset;
      }

      const shadowScale = Math.max(0.6, 1 - verticalOffset * 0.4);
      shadowDisc.scale.setScalar(shadowScale);
    },
    setTargetMarker(pos: THREE.Vector3 | null, time: number) {
      if (!pos) {
        targetMarker.visible = false;
        return;
      }
      targetMarker.visible = true;
      targetMarker.position.set(pos.x, pos.y + 0.03, pos.z);
      const pulse = 1 + Math.sin(time * 6) * 0.18;
      targetMarker.scale.setScalar(pulse);
    },
    dispose() {
      scene.remove(group);
      scene.remove(targetMarker);
      for (const d of disposables) d.dispose();
    },
  };
}
