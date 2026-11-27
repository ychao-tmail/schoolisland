import * as THREE from "three";
import { SchoolInfo } from "../data/schools";
import {
  BRIDGE_ARCH_HEIGHT,
  BRIDGE_HALF_WIDTH,
  BridgeGeometryData,
  HEX_RADIUS,
  ISLAND_TOP_Y,
  IslandNode,
  WATER_Y,
} from "./worldMath";

export interface BuiltWorldAssets {
  islandPickables: THREE.Object3D[];
  walkableMeshes: THREE.Object3D[];
  lampMaterials: THREE.MeshStandardMaterial[];
  islandRingMeshes: Map<string, THREE.Mesh>;
  dispose: () => void;
}

export function buildYilanArchipelago(
  scene: THREE.Scene,
  nodes: Map<string, IslandNode>,
  bridges: BridgeGeometryData[],
): BuiltWorldAssets {
  const islandPickables: THREE.Object3D[] = [];
  const walkableMeshes: THREE.Object3D[] = [];
  const lampMaterials: THREE.MeshStandardMaterial[] = [];
  const islandRingMeshes = new Map<string, THREE.Mesh>();
  const disposables: { dispose: () => void }[] = [];

  const registerGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    disposables.push(g);
    return g;
  };
  const registerMat = <T extends THREE.Material>(m: T): T => {
    disposables.push(m);
    return m;
  };

  // Shared materials
  const matCream = registerMat(new THREE.MeshStandardMaterial({ color: 0xf4ede1, roughness: 0.78, metalness: 0.02 }));
  const matBrick = registerMat(new THREE.MeshStandardMaterial({ color: 0xc26347, roughness: 0.82, metalness: 0.04 }));
  const matRoofTile = registerMat(new THREE.MeshStandardMaterial({ color: 0xb45338, roughness: 0.72, metalness: 0.05 }));
  const matSlate = registerMat(new THREE.MeshStandardMaterial({ color: 0x3b4d5c, roughness: 0.55, metalness: 0.25 }));
  const matWood = registerMat(new THREE.MeshStandardMaterial({ color: 0x8f6646, roughness: 0.85, metalness: 0.02 }));
  const matLeaf = registerMat(new THREE.MeshStandardMaterial({ color: 0x628c56, roughness: 0.86, metalness: 0.0 }));
  const matLeafLight = registerMat(new THREE.MeshStandardMaterial({ color: 0x7ea664, roughness: 0.84, metalness: 0.0 }));
  const matGlass = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0x99d6e4,
      roughness: 0.18,
      metalness: 0.35,
      emissive: 0xffd591,
      emissiveIntensity: 0.0,
    }),
  );
  lampMaterials.push(matGlass);

  const matLampBulb = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0xfff3cc,
      roughness: 0.3,
      emissive: 0xffd17a,
      emissiveIntensity: 0.0,
    }),
  );
  lampMaterials.push(matLampBulb);

  const matFoam = registerMat(
    new THREE.MeshBasicMaterial({
      color: 0xf0fafc,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    }),
  );

  // Shared primitive geometries
  const boxGeo = registerGeo(new THREE.BoxGeometry(1, 1, 1));
  const cylGeo = registerGeo(new THREE.CylinderGeometry(0.5, 0.5, 1, 12));
  const coneGeo = registerGeo(new THREE.ConeGeometry(0.5, 1, 4));
  coneGeo.rotateY(Math.PI / 4);
  const roundConeGeo = registerGeo(new THREE.ConeGeometry(0.5, 1, 10));
  const icoGeo = registerGeo(new THREE.IcosahedronGeometry(0.5, 1));
  const torusGeo = registerGeo(new THREE.TorusGeometry(0.5, 0.12, 8, 18));

  const cliffHeight = ISLAND_TOP_Y - WATER_Y + 0.15;
  const hexTopGeo = registerGeo(new THREE.CylinderGeometry(HEX_RADIUS, HEX_RADIUS * 1.02, 0.16, 6));
  const hexCliffGeo = registerGeo(new THREE.CylinderGeometry(HEX_RADIUS * 1.01, HEX_RADIUS * 1.09, cliffHeight, 6));
  const hexFoamGeo = registerGeo(new THREE.RingGeometry(HEX_RADIUS * 1.08, HEX_RADIUS * 1.24, 6));
  hexFoamGeo.rotateX(-Math.PI / 2);
  hexFoamGeo.rotateY(Math.PI / 6);

  const hexRimGeo = registerGeo(new THREE.RingGeometry(HEX_RADIUS * 0.87, HEX_RADIUS * 0.94, 6));
  hexRimGeo.rotateX(-Math.PI / 2);
  hexRimGeo.rotateY(Math.PI / 6);

  function addBox(
    parent: THREE.Group,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
    rotY = 0,
  ) {
    const m = new THREE.Mesh(boxGeo, mat);
    m.position.set(x, y + h / 2, z);
    m.scale.set(w, h, d);
    m.rotation.y = rotY;
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  function addTree(parent: THREE.Group, x: number, z: number, scale = 0.52) {
    const trunk = new THREE.Mesh(cylGeo, matWood);
    trunk.position.set(x, scale * 0.38, z);
    trunk.scale.set(0.09, scale * 0.76, 0.09);
    trunk.castShadow = true;
    parent.add(trunk);

    const c1 = new THREE.Mesh(icoGeo, matLeaf);
    c1.position.set(x, scale * 0.88, z);
    c1.scale.setScalar(scale * 0.75);
    c1.castShadow = true;
    parent.add(c1);

    const c2 = new THREE.Mesh(icoGeo, matLeafLight);
    c2.position.set(x + scale * 0.16, scale * 1.06, z - scale * 0.1);
    c2.scale.setScalar(scale * 0.52);
    c2.castShadow = true;
    parent.add(c2);
  }

  function addLamp(parent: THREE.Group, x: number, z: number) {
    const post = new THREE.Mesh(cylGeo, matSlate);
    post.position.set(x, 0.24, z);
    post.scale.set(0.035, 0.48, 0.035);
    parent.add(post);

    const bulb = new THREE.Mesh(icoGeo, matLampBulb);
    bulb.position.set(x, 0.5, z);
    bulb.scale.setScalar(0.11);
    parent.add(bulb);
  }

  function buildSchoolLandmark(school: SchoolInfo): THREE.Group {
    const g = new THREE.Group();
    const accentMat = registerMat(
      new THREE.MeshStandardMaterial({
        color: school.accentColor,
        roughness: 0.62,
        metalness: 0.08,
      }),
    );

    // Subtle ground plaza pad under landmark (Y offset prevents coplanar z-fighting)
    const plazaMat = registerMat(
      new THREE.MeshStandardMaterial({
        color: 0xefe7da,
        roughness: 0.9,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
    );
    const plaza = new THREE.Mesh(boxGeo, plazaMat);
    plaza.position.set(0, 0.012, -0.25);
    plaza.scale.set(1.75, 0.024, 1.3);
    plaza.receiveShadow = true;
    g.add(plaza);

    switch (school.landmarkType) {
      case "castle": {
        // 新生國小：彩色歐式童話尖塔城堡
        addBox(g, 0, 0.02, -0.28, 1.18, 0.48, 0.52, matCream);
        addBox(g, 0, 0.24, -0.01, 0.26, 0.24, 0.04, matGlass);
        for (const sx of [-0.52, 0.52]) {
          const tower = new THREE.Mesh(cylGeo, matCream);
          tower.position.set(sx, 0.4, -0.24);
          tower.scale.set(0.32, 0.8, 0.32);
          tower.castShadow = true;
          g.add(tower);
          const spire = new THREE.Mesh(roundConeGeo, accentMat);
          spire.position.set(sx, 0.98, -0.24);
          spire.scale.set(0.4, 0.42, 0.4);
          spire.castShadow = true;
          g.add(spire);
        }
        const centerSpire = new THREE.Mesh(roundConeGeo, matSlate);
        centerSpire.position.set(0, 0.72, -0.28);
        centerSpire.scale.set(0.44, 0.46, 0.44);
        centerSpire.castShadow = true;
        g.add(centerSpire);
        addTree(g, -0.88, 0.28, 0.48);
        addLamp(g, 0.78, 0.35);
        break;
      }

      case "solar": {
        // 力行國小：太陽能節能屋頂 + 河濱單車驛站
        addBox(g, -0.1, 0.02, -0.3, 1.25, 0.44, 0.52, matCream);
        addBox(g, -0.1, 0.24, -0.03, 0.88, 0.16, 0.04, matGlass);
        // Slanted solar panels
        for (const sx of [-0.42, 0.02, 0.46]) {
          const panel = addBox(g, sx, 0.48, -0.32, 0.34, 0.04, 0.42, matSlate);
          panel.rotation.x = 0.28;
        }
        // Riverside pergola
        addBox(g, 0.65, 0.02, 0.22, 0.42, 0.04, 0.36, matWood);
        addBox(g, 0.65, 0.26, 0.22, 0.48, 0.05, 0.42, accentMat);
        addTree(g, -0.88, 0.22, 0.56);
        addLamp(g, 0.32, 0.38);
        break;
      }

      case "gears": {
        // 宜蘭國中：職探夢工廠齒輪工坊
        addBox(g, -0.14, 0.02, -0.32, 1.12, 0.5, 0.56, matCream);
        const roof = new THREE.Mesh(coneGeo, accentMat);
        roof.position.set(-0.14, 0.7, -0.32);
        roof.scale.set(1.25, 0.38, 0.72);
        roof.castShadow = true;
        g.add(roof);
        addBox(g, -0.14, 0.24, -0.03, 0.74, 0.2, 0.04, matGlass);
        // Maker gear sculpture
        const gearRing = new THREE.Mesh(torusGeo, accentMat);
        gearRing.position.set(0.66, 0.34, 0.12);
        gearRing.scale.set(0.32, 0.32, 0.32);
        gearRing.castShadow = true;
        g.add(gearRing);
        addBox(g, 0.66, 0.02, 0.12, 0.14, 0.22, 0.14, matSlate);
        addTree(g, -0.92, 0.2, 0.52);
        addLamp(g, 0.25, 0.36);
        break;
      }

      case "moat": {
        // 光復國小：九芎漾月生態護城河 + 木拱橋 + 垂柳
        addBox(g, 0, 0.02, -0.42, 1.24, 0.46, 0.48, matCream);
        const roof = new THREE.Mesh(coneGeo, matRoofTile);
        roof.position.set(0, 0.66, -0.42);
        roof.scale.set(1.38, 0.34, 0.64);
        roof.castShadow = true;
        g.add(roof);
        addBox(g, 0, 0.22, -0.17, 0.9, 0.18, 0.04, matGlass);
        // Curved moat water strip across courtyard
        const moatMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x5ca4b5, roughness: 0.15, metalness: 0.2 }));
        addBox(g, 0, 0.025, 0.12, 1.56, 0.03, 0.26, moatMat);
        // Mini wooden arch bridge over moat
        addBox(g, 0, 0.06, 0.12, 0.28, 0.06, 0.36, matWood);
        addTree(g, -0.78, 0.28, 0.55);
        addTree(g, 0.78, 0.24, 0.48);
        addLamp(g, 0.44, 0.35);
        break;
      }

      case "science": {
        // 宜蘭國小：歷史建築「科學教育中心」弧形屋頂 + 弦樂亭
        addBox(g, -0.05, 0.02, -0.3, 1.26, 0.44, 0.52, matCream);
        addBox(g, -0.05, 0.2, -0.03, 0.92, 0.2, 0.04, matGlass);
        // Distinct curved butterfly-style modernist roof
        const wingL = addBox(g, -0.36, 0.52, -0.3, 0.68, 0.06, 0.62, accentMat);
        wingL.rotation.z = 0.22;
        const wingR = addBox(g, 0.26, 0.52, -0.3, 0.68, 0.06, 0.62, accentMat);
        wingR.rotation.z = -0.22;
        // Historic plaque monument
        addBox(g, 0.68, 0.02, 0.18, 0.16, 0.34, 0.12, matBrick);
        addTree(g, -0.88, 0.22, 0.58);
        addLamp(g, 0.4, 0.36);
        break;
      }

      case "pool": {
        // 黎明國小：室內溫控暖水游泳池館
        addBox(g, -0.15, 0.02, -0.35, 1.18, 0.46, 0.48, matCream);
        addBox(g, -0.15, 0.24, -0.1, 0.82, 0.16, 0.04, matGlass);
        // Blue arched natatorium hall
        addBox(g, 0.18, 0.02, 0.18, 0.96, 0.26, 0.54, matCream);
        const poolRoof = new THREE.Mesh(cylGeo, accentMat);
        poolRoof.rotation.z = Math.PI / 2;
        poolRoof.position.set(0.18, 0.3, 0.18);
        poolRoof.scale.set(0.52, 0.94, 0.42);
        poolRoof.castShadow = true;
        g.add(poolRoof);
        const waterDeck = registerMat(new THREE.MeshStandardMaterial({ color: 0x3aa6d1, roughness: 0.18 }));
        addBox(g, 0.18, 0.28, 0.18, 0.78, 0.03, 0.36, waterDeck);
        addTree(g, -0.88, 0.22, 0.5);
        addLamp(g, 0.82, 0.35);
        break;
      }

      case "gym": {
        // 中華國中：籃球體育館 + 戶外球場
        addBox(g, -0.22, 0.02, -0.34, 1.05, 0.54, 0.6, matCream);
        const dome = new THREE.Mesh(icoGeo, accentMat);
        dome.position.set(-0.22, 0.58, -0.34);
        dome.scale.set(1.08, 0.38, 0.72);
        dome.castShadow = true;
        g.add(dome);
        // Outdoor orange basketball half-court
        const courtMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xd97d48, roughness: 0.78 }));
        addBox(g, 0.55, 0.02, 0.14, 0.56, 0.03, 0.46, courtMat);
        addBox(g, 0.55, 0.04, -0.06, 0.05, 0.32, 0.05, matSlate);
        addBox(g, 0.55, 0.3, -0.04, 0.18, 0.12, 0.03, matCream);
        addTree(g, -0.92, 0.22, 0.52);
        addLamp(g, 0.15, 0.36);
        break;
      }

      case "courtyard": {
        // 南屏國小：合院無圍牆綠建築長廊
        addBox(g, 0, 0.02, -0.52, 1.38, 0.42, 0.34, matCream);
        addBox(g, -0.54, 0.02, -0.14, 0.3, 0.38, 0.62, matCream);
        addBox(g, 0.54, 0.02, -0.14, 0.3, 0.38, 0.62, matCream);
        addBox(g, 0, 0.44, -0.52, 1.46, 0.06, 0.42, accentMat);
        addBox(g, -0.54, 0.4, -0.14, 0.36, 0.05, 0.68, accentMat);
        addBox(g, 0.54, 0.4, -0.14, 0.36, 0.05, 0.68, accentMat);
        // Central courtyard big shade tree + doghouse
        addTree(g, 0, -0.08, 0.62);
        addBox(g, 0.18, 0.02, 0.22, 0.18, 0.14, 0.16, matWood);
        addLamp(g, -0.28, 0.32);
        break;
      }

      case "slides": {
        // 中山國小：百年紅磚校舍 + 海盜船/日月星溜滑梯樂園
        addBox(g, -0.12, 0.02, -0.36, 1.24, 0.48, 0.44, matBrick);
        const roof = new THREE.Mesh(coneGeo, matRoofTile);
        roof.position.set(-0.12, 0.68, -0.36);
        roof.scale.set(1.36, 0.34, 0.6);
        roof.castShadow = true;
        g.add(roof);
        addBox(g, -0.12, 0.22, -0.13, 0.86, 0.18, 0.04, matGlass);
        // Colorful slide playground tower + slide chute
        addBox(g, 0.55, 0.02, 0.14, 0.24, 0.36, 0.24, accentMat);
        const chute = addBox(g, 0.32, 0.18, 0.24, 0.44, 0.05, 0.16, matGlass);
        chute.rotation.z = 0.52;
        addTree(g, -0.92, 0.2, 0.58);
        addLamp(g, -0.32, 0.34);
        break;
      }

      case "theater": {
        // 復興國中：星光實驗劇場 + 圓弧表演舞台
        addBox(g, -0.15, 0.02, -0.36, 1.15, 0.5, 0.52, matCream);
        addBox(g, -0.15, 0.26, -0.09, 0.8, 0.18, 0.04, matGlass);
        // Amphitheater stage cylinder + backdrop arch
        const stage = new THREE.Mesh(cylGeo, accentMat);
        stage.position.set(0.32, 0.1, 0.16);
        stage.scale.set(0.76, 0.16, 0.76);
        stage.receiveShadow = true;
        g.add(stage);
        const arch = new THREE.Mesh(torusGeo, accentMat);
        arch.position.set(0.32, 0.28, 0.04);
        arch.scale.set(0.55, 0.55, 0.55);
        g.add(arch);
        addTree(g, -0.88, 0.22, 0.52);
        addLamp(g, -0.38, 0.34);
        break;
      }

      case "paddy": {
        // 育才國小：本土教育中心三合院講堂 + 綠野稻田方格
        addBox(g, -0.18, 0.02, -0.38, 1.02, 0.42, 0.46, matBrick);
        const roof = new THREE.Mesh(coneGeo, matRoofTile);
        roof.position.set(-0.18, 0.6, -0.38);
        roof.scale.set(1.16, 0.32, 0.62);
        roof.castShadow = true;
        g.add(roof);
        // Terraced green paddy plots
        const paddyMat1 = registerMat(new THREE.MeshStandardMaterial({ color: 0x8db654, roughness: 0.85 }));
        const paddyMat2 = registerMat(new THREE.MeshStandardMaterial({ color: 0xa6c768, roughness: 0.85 }));
        addBox(g, 0.48, 0.02, 0.08, 0.56, 0.04, 0.26, paddyMat1);
        addBox(g, 0.48, 0.02, 0.38, 0.56, 0.04, 0.22, paddyMat2);
        addTree(g, -0.88, 0.22, 0.56);
        addLamp(g, -0.2, 0.34);
        break;
      }

      case "bilingual": {
        // 凱旋國小：現代展藝館 + 雙語學習方塊 + 足球草坪
        addBox(g, -0.14, 0.02, -0.34, 1.18, 0.48, 0.5, matCream);
        addBox(g, -0.14, 0.26, -0.08, 0.9, 0.2, 0.04, matGlass);
        addBox(g, -0.14, 0.5, -0.34, 1.24, 0.07, 0.56, accentMat);
        // Mini green soccer pitch
        const pitchMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x5c9e59, roughness: 0.88 }));
        addBox(g, 0.42, 0.02, 0.22, 0.7, 0.03, 0.42, pitchMat);
        addTree(g, -0.9, 0.22, 0.5);
        addLamp(g, -0.38, 0.36);
        break;
      }

      case "bodhi": {
        // 凱旋國中：菩提葉無圍牆綠建築 + 望向龜山島觀景軸線
        // Angled leaf-like wings aligned eastward (+X) toward Guishan Island
        addBox(g, -0.2, 0.02, -0.34, 1.12, 0.42, 0.38, matCream, -0.15);
        addBox(g, 0.14, 0.02, -0.12, 0.92, 0.38, 0.34, matCream, 0.24);
        addBox(g, -0.2, 0.44, -0.34, 1.18, 0.05, 0.44, accentMat, -0.15);
        addBox(g, 0.14, 0.4, -0.12, 0.98, 0.05, 0.4, accentMat, 0.24);
        // Eastward viewing deck pointing toward Guishan Island
        addBox(g, 0.72, 0.02, 0.18, 0.42, 0.1, 0.28, matWood);
        addTree(g, -0.84, 0.24, 0.58);
        addLamp(g, 0.18, 0.36);
        break;
      }
    }

    return g;
  }

  // Build all 13 hexagonal islands
  for (const [id, node] of nodes) {
    const { school, center } = node;
    const islandGroup = new THREE.Group();
    islandGroup.position.set(center.x, 0, center.z);

    const topMat = registerMat(
      new THREE.MeshStandardMaterial({
        color: school.groundColor,
        roughness: 0.88,
        metalness: 0.02,
      }),
    );
    const cliffMat = registerMat(
      new THREE.MeshStandardMaterial({
        color: school.cliffColor,
        roughness: 0.92,
        metalness: 0.0,
        flatShading: true,
      }),
    );
    const rimMat = registerMat(
      new THREE.MeshStandardMaterial({
        color: school.accentColor,
        roughness: 0.75,
        metalness: 0.05,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
    );

    const cliffMesh = new THREE.Mesh(hexCliffGeo, cliffMat);
    cliffMesh.position.y = WATER_Y + cliffHeight / 2 - 0.06;
    cliffMesh.castShadow = true;
    cliffMesh.receiveShadow = true;

    const topMesh = new THREE.Mesh(hexTopGeo, topMat);
    topMesh.position.y = ISLAND_TOP_Y - 0.08;
    topMesh.castShadow = true;
    topMesh.receiveShadow = true;
    topMesh.userData = { schoolId: id, walkable: true };

    const rimMesh = new THREE.Mesh(hexRimGeo, rimMat);
    rimMesh.position.y = ISLAND_TOP_Y + 0.008;
    rimMesh.receiveShadow = true;

    const foamMesh = new THREE.Mesh(hexFoamGeo, matFoam);
    foamMesh.position.y = WATER_Y + 0.02;

    const landmark = buildSchoolLandmark(school);
    landmark.position.y = ISLAND_TOP_Y;
    landmark.userData = { schoolId: id };

    islandGroup.add(cliffMesh, topMesh, rimMesh, foamMesh, landmark);
    scene.add(islandGroup);

    islandPickables.push(topMesh, landmark);
    walkableMeshes.push(topMesh);
    islandRingMeshes.set(id, rimMesh);
  }

  // Build bridges connecting islands
  const bridgeGroup = new THREE.Group();
  const bridgeDeckMats: Record<BridgeGeometryData["style"], THREE.MeshStandardMaterial> = {
    river: registerMat(new THREE.MeshStandardMaterial({ color: 0x7b8f9c, roughness: 0.72, metalness: 0.15 })),
    oldtown: registerMat(new THREE.MeshStandardMaterial({ color: 0xc29e7a, roughness: 0.84 })),
    greenway: registerMat(new THREE.MeshStandardMaterial({ color: 0x9ab88e, roughness: 0.86 })),
    timber: registerMat(new THREE.MeshStandardMaterial({ color: 0xa67c56, roughness: 0.86 })),
  };
  const railMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: 0.75 }));

  for (const br of bridges) {
    const segments = Math.max(7, Math.ceil(br.length * 2.2));
    const deckMat = bridgeDeckMats[br.style];
    const yaw = Math.atan2(br.dir.x, br.dir.z);
    const archH = br.isRiverCrossing ? BRIDGE_ARCH_HEIGHT * 1.35 : BRIDGE_ARCH_HEIGHT;

    for (let i = 0; i < segments; i++) {
      const t0 = i / segments;
      const t1 = (i + 1) / segments;
      const tm = (t0 + t1) / 2;
      const segLen = br.length / segments + 0.04;
      const y0 = ISLAND_TOP_Y + Math.sin(t0 * Math.PI) * archH;
      const y1 = ISLAND_TOP_Y + Math.sin(t1 * Math.PI) * archH;
      const ym = (y0 + y1) / 2;
      const pitch = Math.atan2(y1 - y0, br.length / segments);

      const pos = br.start.clone().addScaledVector(br.dir, br.length * tm);
      const deck = new THREE.Mesh(boxGeo, deckMat);
      deck.position.set(pos.x, ym - 0.025, pos.z);
      deck.scale.set(BRIDGE_HALF_WIDTH * 2, 0.06, segLen);
      deck.rotation.order = "YXZ";
      deck.rotation.y = yaw;
      deck.rotation.x = -pitch;
      deck.castShadow = true;
      deck.receiveShadow = true;
      deck.userData = { walkable: true, bridgeId: br.id };
      bridgeGroup.add(deck);
      walkableMeshes.push(deck);

      // Handrail posts every 2 segments
      if (i % 2 === 0 || i === segments - 1) {
        for (const side of [-1, 1]) {
          const post = new THREE.Mesh(cylGeo, railMat);
          post.position.set(
            pos.x + br.perp.x * (BRIDGE_HALF_WIDTH - 0.03) * side,
            ym + 0.09,
            pos.z + br.perp.z * (BRIDGE_HALF_WIDTH - 0.03) * side,
          );
          post.scale.set(0.028, 0.16, 0.028);
          bridgeGroup.add(post);
        }
      }
    }

    // Bridge pier pilings for river crossings and longer spans
    if (br.isRiverCrossing || br.length > 2.2) {
      const pierTs = br.length > 5.0 ? [0.22, 0.5, 0.78] : [0.3, 0.7];
      for (const tPier of pierTs) {
        const pPos = br.start.clone().addScaledVector(br.dir, br.length * tPier);
        const pierH = ISLAND_TOP_Y + archH * Math.sin(tPier * Math.PI) - WATER_Y;
        const pier = new THREE.Mesh(cylGeo, matSlate);
        pier.position.set(pPos.x, WATER_Y + pierH / 2, pPos.z);
        pier.scale.set(0.14, pierH, 0.14);
        bridgeGroup.add(pier);
      }
    }
  }
  scene.add(bridgeGroup);

  return {
    islandPickables,
    walkableMeshes,
    lampMaterials,
    islandRingMeshes,
    dispose() {
      for (const d of disposables) d.dispose();
    },
  };
}
