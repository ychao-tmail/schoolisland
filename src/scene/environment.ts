import * as THREE from "three";
import { WATER_Y } from "./worldMath";

export type TimePreset = "dawn" | "day" | "sunset" | "night";

interface TimeTheme {
  skyTop: number;
  skyHorizon: number;
  sunColor: number;
  sunIntensity: number;
  sunAzimuth: number;
  sunElevation: number;
  hemiSky: number;
  hemiGround: number;
  hemiIntensity: number;
  waterShallow: number;
  waterDeep: number;
  nightFactor: number;
  lampGlow: number;
  ridgeTint: number;
}

const TIME_THEMES: Record<TimePreset, TimeTheme> = {
  dawn: {
    skyTop: 0x7a8ec2,
    skyHorizon: 0xf4c3a4,
    sunColor: 0xffb384,
    sunIntensity: 1.55,
    sunAzimuth: 0.22,
    sunElevation: 0.42,
    hemiSky: 0xf4d2c2,
    hemiGround: 0x6b5c58,
    hemiIntensity: 1.15,
    waterShallow: 0x8db9c4,
    waterDeep: 0x5c899c,
    nightFactor: 0.35,
    lampGlow: 0.65,
    ridgeTint: 0x6f838f,
  },
  day: {
    skyTop: 0x8cc8e8,
    skyHorizon: 0xedf4f2,
    sunColor: 0xfff3df,
    sunIntensity: 2.35,
    sunAzimuth: 0.72,
    sunElevation: 0.92,
    hemiSky: 0xe6f4fa,
    hemiGround: 0x827763,
    hemiIntensity: 1.2,
    waterShallow: 0x99d2d6,
    waterDeep: 0x589aa8,
    nightFactor: 0.0,
    lampGlow: 0.0,
    ridgeTint: 0x688d7c,
  },
  sunset: {
    skyTop: 0x5f6ea8,
    skyHorizon: 0xf5ab80,
    sunColor: 0xff925c,
    sunIntensity: 1.7,
    sunAzimuth: 2.25,
    sunElevation: 0.36,
    hemiSky: 0xf5c8ad,
    hemiGround: 0x6c5957,
    hemiIntensity: 1.1,
    waterShallow: 0x89a6bd,
    waterDeep: 0x4b6a8a,
    nightFactor: 0.45,
    lampGlow: 0.9,
    ridgeTint: 0x646c85,
  },
  night: {
    skyTop: 0x162244,
    skyHorizon: 0x2e416e,
    sunColor: 0xbcd0ff,
    sunIntensity: 0.95,
    sunAzimuth: 1.4,
    sunElevation: 0.78,
    hemiSky: 0x8398d4,
    hemiGround: 0x423c52,
    hemiIntensity: 1.45,
    waterShallow: 0x3b6488,
    waterDeep: 0x243e5c,
    nightFactor: 1.0,
    lampGlow: 1.35,
    ridgeTint: 0x2c3c5c,
  },
};

export interface EnvironmentController {
  sun: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
  setTimePreset: (preset: TimePreset) => void;
  update: (dt: number) => void;
  getLampGlow: () => number;
  dispose: () => void;
}

export function createYilanEnvironment(
  scene: THREE.Scene,
  cityCenter: THREE.Vector3,
  isSoftwareGl: boolean,
): EnvironmentController {
  const cx = cityCenter.x;
  const cz = cityCenter.z;
  const disposables: { dispose: () => void }[] = [];

  // 1. Sky Dome Shader
  const skyUniforms = {
    uTop: { value: new THREE.Color(TIME_THEMES.day.skyTop) },
    uHorizon: { value: new THREE.Color(TIME_THEMES.day.skyHorizon) },
    uSun: { value: new THREE.Color(TIME_THEMES.day.sunColor) },
    uSunDir: { value: new THREE.Vector3(0.5, 0.7, 0.4).normalize() },
    uNight: { value: 0 },
  };

  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: skyUniforms,
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uTop, uHorizon, uSun, uSunDir;
      uniform float uNight;
      varying vec3 vDir;
      float hash(vec3 p) {
        return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
      }
      void main() {
        float h = clamp(vDir.y, -0.15, 1.0);
        vec3 col = mix(uHorizon, uTop, smoothstep(-0.02, 0.55, h));
        float sd = max(dot(normalize(vDir), normalize(uSunDir)), 0.0);
        col += uSun * pow(sd, 16.0) * 0.32 * (1.0 - uNight * 0.65);
        vec3 cell = floor(vDir * 170.0);
        float star = step(0.9962, hash(cell)) * smoothstep(0.08, 0.48, h) * uNight;
        col += vec3(star * 0.85);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const skyGeo = new THREE.SphereGeometry(150, 32, 16);
  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  skyMesh.position.set(cx, 0, cz);
  skyMesh.renderOrder = -10;
  scene.add(skyMesh);
  disposables.push(skyGeo, skyMat);

  scene.fog = new THREE.Fog(TIME_THEMES.day.skyHorizon, 34, 125);

  // 2. Lights
  const hemi = new THREE.HemisphereLight(TIME_THEMES.day.hemiSky, TIME_THEMES.day.hemiGround, TIME_THEMES.day.hemiIntensity);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(TIME_THEMES.day.sunColor, TIME_THEMES.day.sunIntensity);
  sun.castShadow = !isSoftwareGl;
  const shadowSize = isSoftwareGl ? 512 : 2048;
  sun.shadow.mapSize.set(shadowSize, shadowSize);
  sun.shadow.camera.left = -22;
  sun.shadow.camera.right = 22;
  sun.shadow.camera.top = 22;
  sun.shadow.camera.bottom = -22;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 85;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.03;
  sun.shadow.radius = 2.5;
  sun.target.position.set(cx, 0, cz);
  scene.add(sun, sun.target);

  const fill = new THREE.DirectionalLight(0xc2dcff, 0.35);
  fill.position.set(cx - 18, 14, cz + 20);
  scene.add(fill);

  // Yilan River winding ribbon between North Bank (新生) and Old Town / 宜蘭國中 / 力行
  const riverCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(cx - 22, WATER_Y + 0.025, cz - 7.8),
    new THREE.Vector3(cx - 11, WATER_Y + 0.025, cz - 8.6),
    new THREE.Vector3(cx - 1.5, WATER_Y + 0.025, cz - 9.2),
    new THREE.Vector3(cx + 8.5, WATER_Y + 0.025, cz - 10.1),
    new THREE.Vector3(cx + 22, WATER_Y + 0.025, cz - 9.4),
  ]);
  const riverGeo = new THREE.TubeGeometry(riverCurve, 44, 0.55, 6, false);
  riverGeo.scale(1, 0.04, 1);
  const riverMat = new THREE.MeshBasicMaterial({
    color: 0x6ab4c4,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  const riverMesh = new THREE.Mesh(riverGeo, riverMat);
  scene.add(riverMesh);
  disposables.push(riverGeo, riverMat);

  // 3. Anti-aliased Ocean & Yilan River Water Shader
  const waterUniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      uShallow: { value: new THREE.Color(TIME_THEMES.day.waterShallow) },
      uDeep: { value: new THREE.Color(TIME_THEMES.day.waterDeep) },
      uTime: { value: 0 },
      uNight: { value: 0 },
      uCenter: { value: new THREE.Vector2(cx, cz) },
    },
  ]);

  const waterMat = new THREE.ShaderMaterial({
    fog: true,
    uniforms: waterUniforms,
    vertexShader: `
      #include <fog_pars_vertex>
      varying vec3 vW;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        vec4 mvPosition = viewMatrix * w;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: `
      #include <fog_pars_fragment>
      uniform vec3 uShallow, uDeep;
      uniform float uTime, uNight;
      uniform vec2 uCenter;
      varying vec3 vW;
      void main() {
        float d = length(vW.xz - uCenter);
        float w1 = sin(vW.x * 0.42 + uTime * 0.45 + sin(vW.z * 0.31)) * sin(vW.z * 0.38 - uTime * 0.32);
        float w2 = sin((vW.x * 0.65 + vW.z) * 1.15 + uTime * 0.8) * sin(vW.x * 0.9 - vW.z * 0.45);
        float aa = clamp(1.0 - fwidth(w2) * 3.0, 0.0, 1.0);
        vec3 col = mix(uShallow, uDeep, smoothstep(8.0, 34.0, d) * 0.6);
        col += w1 * 0.016 + w2 * 0.006 * aa;
        float glint = smoothstep(0.972, 1.0, w2 * 0.5 + 0.5) * 0.07 * (1.0 - uNight) * aa * (1.0 - smoothstep(14.0, 36.0, d));
        col += glint;
        gl_FragColor = vec4(col, 1.0);
        #include <fog_fragment>
      }
    `,
  });
  const waterGeo = new THREE.CircleGeometry(140, 64);
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.set(cx, WATER_Y, cz);
  scene.add(waterMesh);
  disposables.push(waterGeo, waterMat);

  // 4. Distant Xueshan / Taiping Mountain Ridgeline (West & North-West, -X / -Z)
  const ridgeMat = new THREE.MeshStandardMaterial({
    color: TIME_THEMES.day.ridgeTint,
    roughness: 0.95,
    metalness: 0.0,
    flatShading: true,
  });
  disposables.push(ridgeMat);

  const ridgeGroup = new THREE.Group();
  const mountainSpecs: [number, number, number, number, number][] = [
    [cx - 26, cz - 14, 7.5, 4.8, 0.2],
    [cx - 29, cz - 2, 9.0, 6.2, 0.5],
    [cx - 27, cz + 12, 8.2, 5.1, 0.9],
    [cx - 18, cz - 24, 8.8, 5.4, 1.2],
    [cx - 4, cz - 28, 7.6, 4.2, 1.7],
    [cx + 10, cz - 26, 6.8, 3.6, 2.2],
  ];
  for (const [mx, mz, rad, h, rot] of mountainSpecs) {
    const geo = new THREE.ConeGeometry(rad, h, 7);
    const mesh = new THREE.Mesh(geo, ridgeMat);
    mesh.position.set(mx, WATER_Y + h * 0.45, mz);
    mesh.rotation.y = rot;
    mesh.scale.set(1.2, 1, 1.4);
    ridgeGroup.add(mesh);
    disposables.push(geo);
  }
  scene.add(ridgeGroup);

  // 5. Guishan Island (龜山島) Landmark on the Eastern Ocean Horizon (+X)
  const guishanGroup = new THREE.Group();
  const guishanMat = new THREE.MeshStandardMaterial({
    color: 0x5c8070,
    roughness: 0.9,
    metalness: 0.02,
    flatShading: true,
  });
  const turtleHeadGeo = new THREE.ConeGeometry(1.5, 2.2, 7);
  const turtleBodyGeo = new THREE.ConeGeometry(2.6, 3.4, 8);
  const turtleTailGeo = new THREE.ConeGeometry(1.2, 1.5, 6);

  const turtleHead = new THREE.Mesh(turtleHeadGeo, guishanMat);
  turtleHead.position.set(-1.9, WATER_Y + 0.95, 0.2);
  turtleHead.scale.set(1.1, 1.0, 0.95);

  const turtleBody = new THREE.Mesh(turtleBodyGeo, guishanMat);
  turtleBody.position.set(0.4, WATER_Y + 1.45, 0);
  turtleBody.scale.set(1.35, 1.0, 0.9);

  const turtleTail = new THREE.Mesh(turtleTailGeo, guishanMat);
  turtleTail.position.set(2.5, WATER_Y + 0.65, -0.15);
  turtleTail.scale.set(1.3, 0.9, 0.8);

  guishanGroup.add(turtleHead, turtleBody, turtleTail);
  guishanGroup.position.set(cx + 25, 0, cz - 1.5);
  guishanGroup.rotation.y = 0.25;
  scene.add(guishanGroup);
  disposables.push(guishanMat, turtleHeadGeo, turtleBodyGeo, turtleTailGeo);

  // 6. Floating Low-Poly Clouds
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.95,
    emissive: 0xfff4ea,
    emissiveIntensity: 0.12,
  });
  const cloudGeo = new THREE.IcosahedronGeometry(0.9, 1);
  disposables.push(cloudMat, cloudGeo);

  const clouds: { group: THREE.Group; homeX: number; speed: number }[] = [];
  const cloudPositions: [number, number, number, number][] = [
    [cx - 10, 8.5, cz - 12, 0.95],
    [cx + 6, 9.8, cz - 16, 1.1],
    [cx + 16, 8.2, cz - 4, 0.85],
    [cx - 14, 9.2, cz + 6, 0.9],
    [cx + 12, 10.4, cz + 11, 1.05],
  ];
  cloudPositions.forEach(([x, y, z, s], idx) => {
    const g = new THREE.Group();
    for (let j = 0; j < 4; j++) {
      const m = new THREE.Mesh(cloudGeo, cloudMat);
      m.position.set((j - 1.5) * 0.72, j % 2 === 0 ? 0.12 : 0, (j % 2 === 0 ? 1 : -1) * 0.25);
      const ls = 0.7 + (j === 1 || j === 2 ? 0.35 : 0);
      m.scale.set(ls * 1.2, ls * 0.78, ls);
      g.add(m);
    }
    g.position.set(x, y, z);
    g.scale.setScalar(s);
    scene.add(g);
    clouds.push({ group: g, homeX: x, speed: 0.16 + idx * 0.03 });
  });

  let currentLampGlow = TIME_THEMES.day.lampGlow;

  function setTimePreset(preset: TimePreset) {
    const t = TIME_THEMES[preset];
    skyUniforms.uTop.value.setHex(t.skyTop);
    skyUniforms.uHorizon.value.setHex(t.skyHorizon);
    skyUniforms.uSun.value.setHex(t.sunColor);
    skyUniforms.uNight.value = t.nightFactor;

    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.setHex(t.skyHorizon);
    }

    hemi.color.setHex(t.hemiSky);
    hemi.groundColor.setHex(t.hemiGround);
    hemi.intensity = t.hemiIntensity;

    sun.color.setHex(t.sunColor);
    sun.intensity = t.sunIntensity;

    const dir = new THREE.Vector3(
      Math.cos(t.sunAzimuth) * Math.cos(t.sunElevation),
      Math.sin(t.sunElevation),
      Math.sin(t.sunAzimuth) * Math.cos(t.sunElevation) * 0.7 + 0.25,
    ).normalize();
    sun.position.set(cx + dir.x * 32, dir.y * 32, cz + dir.z * 32);
    skyUniforms.uSunDir.value.copy(dir);

    waterUniforms.uShallow.value.setHex(t.waterShallow);
    waterUniforms.uDeep.value.setHex(t.waterDeep);
    waterUniforms.uNight.value = t.nightFactor;

    ridgeMat.color.setHex(t.ridgeTint);
    guishanMat.color.setHex(0x5c8070).lerp(new THREE.Color(t.skyHorizon), t.nightFactor * 0.45);
    cloudMat.color.setHex(0xffffff).lerp(new THREE.Color(t.skyHorizon), 0.3 + t.nightFactor * 0.35);
    cloudMat.emissive.setHex(t.sunColor);
    cloudMat.emissiveIntensity = 0.08 + (1 - t.nightFactor) * 0.1;
    currentLampGlow = t.lampGlow;
  }

  setTimePreset("day");

  return {
    sun,
    hemi,
    setTimePreset,
    getLampGlow: () => currentLampGlow,
    update(dt: number) {
      waterUniforms.uTime.value += dt;
      for (const c of clouds) {
        c.group.position.x += c.speed * dt;
        if (c.group.position.x > c.homeX + 12) c.group.position.x = c.homeX - 12;
      }
    },
    dispose() {
      for (const d of disposables) d.dispose();
    },
  };
}
