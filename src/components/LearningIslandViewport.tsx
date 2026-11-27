import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import { SchoolInfo, SchoolLevel, YILAN_SCHOOLS } from "../data/schools";
import { createYilanEnvironment, TimePreset } from "../scene/environment";
import { createExplorerCharacter } from "../scene/explorerCharacter";
import { buildYilanArchipelago } from "../scene/schoolModels";
import { LearningSoundController } from "../scene/sound";
import {
  buildWorldGraph,
  evaluateWalkableSurface,
  findSchoolRoute,
  ISLAND_TOP_Y,
} from "../scene/worldMath";

export interface WalkCommand {
  targetSchoolId: string;
  nonce: number;
}

export interface CameraAction {
  kind: "overview" | "focusSchool" | "followExplorer";
  schoolId?: string;
  nonce: number;
}

interface LearningIslandViewportProps {
  timePreset: TimePreset;
  levelFilter: "all" | SchoolLevel;
  cameraFollow: boolean;
  visitedIds: Set<string>;
  stampedIds: Set<string>;
  selectedSchoolId: string | null;
  walkCommand: WalkCommand | null;
  cameraAction: CameraAction | null;
  touchVectorRef: React.MutableRefObject<{ x: number; y: number }>;
  sound: LearningSoundController;
  onArriveSchool: (schoolId: string) => void;
  onCurrentIslandChange: (schoolId: string | null) => void;
  onSelectSchool: (schoolId: string) => void;
  onCameraFollowChange: (follow: boolean) => void;
}

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return true;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? "");
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export const LearningIslandViewport: React.FC<LearningIslandViewportProps> = ({
  timePreset,
  levelFilter,
  cameraFollow,
  visitedIds,
  stampedIds,
  selectedSchoolId,
  walkCommand,
  cameraAction,
  touchVectorRef,
  sound,
  onArriveSchool,
  onCurrentIslandChange,
  onSelectSchool,
  onCameraFollowChange,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [contextLost, setContextLost] = useState(false);

  // Refs synced to latest React props without tearing down WebGL
  const timePresetRef = useRef(timePreset);
  const levelFilterRef = useRef(levelFilter);
  const cameraFollowRef = useRef(cameraFollow);
  const visitedRef = useRef(visitedIds);
  const stampedRef = useRef(stampedIds);
  const selectedSchoolRef = useRef(selectedSchoolId);

  const callbacksRef = useRef({
    onArriveSchool,
    onCurrentIslandChange,
    onSelectSchool,
    onCameraFollowChange,
  });

  useEffect(() => {
    timePresetRef.current = timePreset;
    envApiRef.current?.setTimePreset(timePreset);
  }, [timePreset]);

  useEffect(() => {
    levelFilterRef.current = levelFilter;
    syncLabelStylesRef.current();
  }, [levelFilter]);

  useEffect(() => {
    cameraFollowRef.current = cameraFollow;
  }, [cameraFollow]);

  useEffect(() => {
    visitedRef.current = visitedIds;
    stampedRef.current = stampedIds;
    selectedSchoolRef.current = selectedSchoolId;
    syncLabelStylesRef.current();
  }, [visitedIds, stampedIds, selectedSchoolId]);

  useEffect(() => {
    callbacksRef.current = {
      onArriveSchool,
      onCurrentIslandChange,
      onSelectSchool,
      onCameraFollowChange,
    };
  }, [onArriveSchool, onCurrentIslandChange, onSelectSchool, onCameraFollowChange]);

  const envApiRef = useRef<ReturnType<typeof createYilanEnvironment> | null>(null);
  const syncLabelStylesRef = useRef<() => void>(() => {});
  const startAutoWalkRef = useRef<(schoolId: string) => void>(() => {});
  const triggerCameraActionRef = useRef<(action: CameraAction) => void>(() => {});

  useEffect(() => {
    if (walkCommand) {
      startAutoWalkRef.current(walkCommand.targetSchoolId);
    }
  }, [walkCommand]);

  useEffect(() => {
    if (cameraAction) {
      triggerCameraActionRef.current(cameraAction);
    }
  }, [cameraAction]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost);
    renderer.domElement.addEventListener("webglcontextrestored", handleContextRestored);

    // Studio environment reflection
    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTex = pmrem.fromScene(roomEnv, 0.04).texture;
    scene.environment = envTex;
    roomEnv.dispose();
    pmrem.dispose();

    // CSS2DRenderer for semantic crisp school nameplates
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(container.clientWidth, container.clientHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.inset = "0";
    labelRenderer.domElement.style.pointerEvents = "none";
    container.appendChild(labelRenderer.domElement);

    const { nodes, bridges, adjacency, cityCenter } = buildWorldGraph();
    const env = createYilanEnvironment(scene, cityCenter, isSoftwareGl);
    envApiRef.current = env;
    env.setTimePreset(timePresetRef.current);

    const worldAssets = buildYilanArchipelago(scene, nodes, bridges);
    const explorer = createExplorerCharacter(scene);

    // Start explorer at 宜蘭國小 (Old City center)
    const startNode = nodes.get("yilan-es")!;
    const explorerPos = new THREE.Vector3(startNode.center.x, ISLAND_TOP_Y, startNode.center.z + 0.72);
    explorer.group.position.copy(explorerPos);

    // Explorer overhead mini badge
    const explorerTagEl = document.createElement("div");
    explorerTagEl.className = "explorer-label-3d";
    explorerTagEl.textContent = "探索者";
    const explorerTag = new CSS2DObject(explorerTagEl);
    explorerTag.position.set(0, 1.05, 0);
    explorer.group.add(explorerTag);

    // School CSS2D Labels
    const schoolLabels = new Map<string, { obj: CSS2DObject; el: HTMLButtonElement; school: SchoolInfo; worldPos: THREE.Vector3 }>();
    for (const school of YILAN_SCHOOLS) {
      const node = nodes.get(school.id)!;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "school-label-3d";
      btn.setAttribute("aria-label", `探索 ${school.name}`);
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        callbacksRef.current.onSelectSchool(school.id);
        startAutoWalk(school.id);
      });

      const obj = new CSS2DObject(btn);
      obj.position.set(node.center.x, ISLAND_TOP_Y + 1.38, node.center.z - 0.15);
      scene.add(obj);
      schoolLabels.set(school.id, { obj, el: btn, school, worldPos: obj.position });
    }

    function syncLabelStyles() {
      const filter = levelFilterRef.current;
      const visited = visitedRef.current;
      const stamped = stampedRef.current;
      const selected = selectedSchoolRef.current;

      for (const [id, item] of schoolLabels) {
        const matches = filter === "all" || item.school.level === filter;
        const isVisited = visited.has(id);
        const isStamped = stamped.has(id);
        const isActive = selected === id;

        item.el.classList.toggle("is-active", isActive);
        item.el.classList.toggle("is-dimmed", !matches);

        const levelTxt = item.school.level === "elementary" ? "國小" : "國中";
        const mark = isStamped ? "★" : isVisited ? "✓" : "";
        item.el.innerHTML = `<span class="level-tag">${levelTxt}</span><span>${item.school.shortName}</span>${
          mark ? `<span class="visited-check">${mark}</span>` : ""
        }`;
      }
    }
    syncLabelStylesRef.current = syncLabelStyles;
    syncLabelStyles();

    // Camera & OrbitControls
    const camera = new THREE.PerspectiveCamera(36, container.clientWidth / container.clientHeight, 0.3, 220);
    const overviewPos = new THREE.Vector3(cityCenter.x + 1.5, 19.5, cityCenter.z + 24.5);
    camera.position.set(explorerPos.x, explorerPos.y + 6.5, explorerPos.z + 9.2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl && !reducedMotion;
    controls.dampingFactor = 0.08;
    controls.minDistance = 4.2;
    controls.maxDistance = 44;
    controls.minPolarAngle = THREE.MathUtils.degToRad(22);
    controls.maxPolarAngle = THREE.MathUtils.degToRad(68);
    controls.target.copy(explorerPos).add(new THREE.Vector3(0, 0.4, 0));
    controls.update();

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // State for movement, pathfinding, and camera transitions
    let currentIslandId: string | null = "yilan-es";
    let waypoints: THREE.Vector3[] = [];
    let pendingTargetSchoolId: string | null = null;
    let celebrationTimer = 0;
    let verticalOffset = 0;
    let verticalVel = 0;
    let stepCooldown = 0;
    let isOverviewFlight = false;
    const flightTargetCam = new THREE.Vector3();
    const flightTargetLook = new THREE.Vector3();

    const keys: Record<string, boolean> = {};
    const onKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return;
      keys[e.code] = true;
      if (e.code === "Space" && verticalOffset <= 0.001) {
        verticalVel = 4.2;
        e.preventDefault();
      }
      if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        // Manual movement overrides auto-walk
        if (waypoints.length > 0) {
          waypoints = [];
          pendingTargetSchoolId = null;
          explorer.setTargetMarker(null, 0);
        }
        isOverviewFlight = false;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    function startAutoWalk(targetSchoolId: string) {
      const fromId = currentIslandId || "yilan-es";
      const route = findSchoolRoute(fromId, targetSchoolId, nodes, adjacency);
      if (route.length > 0) {
        waypoints = route;
        pendingTargetSchoolId = targetSchoolId;
        isOverviewFlight = false;
        callbacksRef.current.onCameraFollowChange(true);
      }
    }
    startAutoWalkRef.current = startAutoWalk;

    triggerCameraActionRef.current = (action: CameraAction) => {
      if (action.kind === "overview") {
        isOverviewFlight = true;
        flightTargetCam.copy(overviewPos);
        flightTargetLook.copy(cityCenter);
        callbacksRef.current.onCameraFollowChange(false);
      } else if (action.kind === "followExplorer") {
        isOverviewFlight = false;
        callbacksRef.current.onCameraFollowChange(true);
      } else if (action.kind === "focusSchool" && action.schoolId) {
        const node = nodes.get(action.schoolId);
        if (node) {
          isOverviewFlight = true;
          flightTargetLook.copy(node.center).add(new THREE.Vector3(0, 0.4, 0));
          flightTargetCam.copy(node.center).add(new THREE.Vector3(0, 5.2, 6.8));
          callbacksRef.current.onCameraFollowChange(false);
        }
      }
    };

    const onControlsStart = () => {
      isOverviewFlight = false;
    };
    controls.addEventListener("start", onControlsStart);

    // Raycasting for Click-to-Walk / School picking
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    let pointerDownPos: { x: number; y: number } | null = null;

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!pointerDownPos) return;
      const moved = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      pointerDownPos = null;
      if (moved > 6) return; // drag orbit, not a click

      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(worldAssets.islandPickables, true);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        let schoolId: string | undefined;
        while (obj) {
          if (obj.userData?.schoolId) {
            schoolId = obj.userData.schoolId;
            break;
          }
          obj = obj.parent;
        }
        if (schoolId) {
          callbacksRef.current.onSelectSchool(schoolId);
          startAutoWalk(schoolId);
        }
      }
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    // ResizeObserver for crisp viewport sizing
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w <= 0 || h <= 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      labelRenderer.setSize(w, h);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    // Pre-allocated vectors for zero-GC animation loop
    const _fwd = new THREE.Vector3();
    const _right = new THREE.Vector3();
    const _moveDir = new THREE.Vector3();
    const _up = new THREE.Vector3(0, 1, 0);
    const _camOffset = new THREE.Vector3();
    const _desiredTarget = new THREE.Vector3();
    const _proj = new THREE.Vector3();

    let lastTime = performance.now();
    let elapsed = 0;
    let frameId = 0;
    let destroyed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== "function") {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (destroyed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function updateLabelVisibility() {
      const w = container!.clientWidth;
      const h = container!.clientHeight;
      const placed: { x: number; y: number; hw: number; hh: number }[] = [];
      const candidates: {
        id: string;
        obj: CSS2DObject;
        sx: number;
        sy: number;
        pri: number;
      }[] = [];

      for (const [id, item] of schoolLabels) {
        _proj.copy(item.worldPos).project(camera);
        if (_proj.z > 1 || _proj.z < -1) {
          item.obj.visible = false;
          continue;
        }
        const sx = ((_proj.x + 1) / 2) * w;
        const sy = ((1 - _proj.y) / 2) * h;
        const isSel = selectedSchoolRef.current === id;
        const isCurr = currentIslandId === id;
        const pri = (isSel ? -100 : 0) + (isCurr ? -50 : 0) + _proj.z;
        candidates.push({ id, obj: item.obj, sx, sy, pri });
      }

      candidates.sort((a, b) => a.pri - b.pri);
      for (const c of candidates) {
        const overlaps = placed.some((p) => Math.abs(p.x - c.sx) < 92 && Math.abs(p.y - c.sy) < 28);
        if (overlaps) {
          c.obj.visible = false;
        } else {
          c.obj.visible = true;
          placed.push({ x: c.sx, y: c.sy, hw: 46, hh: 14 });
        }
      }
    }

    function tick() {
      if (destroyed) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      elapsed += dt;

      // 1. Update lamp & window glow smoothly toward timePreset target
      const targetGlow = env.getLampGlow();
      for (const lm of worldAssets.lampMaterials) {
        lm.emissiveIntensity = THREE.MathUtils.damp(lm.emissiveIntensity, targetGlow, 6, dt);
      }

      // 2. Highlight active/visited island rings
      for (const [id, ringMesh] of worldAssets.islandRingMeshes) {
        const mat = ringMesh.material as THREE.MeshStandardMaterial;
        const isCurr = id === currentIslandId || id === selectedSchoolRef.current;
        mat.emissive.setHex(isCurr ? nodes.get(id)!.school.accentColor : 0x000000);
        mat.emissiveIntensity = isCurr ? 0.45 + Math.sin(elapsed * 4) * 0.15 : 0;
      }

      // 3. Movement Input (Keyboard + Touch D-pad + Auto-Walk)
      let moveX = 0;
      let moveZ = 0;
      let moveSpeed = 0;

      const keyLeft = keys["KeyA"] || keys["ArrowLeft"] ? 1 : 0;
      const keyRight = keys["KeyD"] || keys["ArrowRight"] ? 1 : 0;
      const keyUp = keys["KeyW"] || keys["ArrowUp"] ? 1 : 0;
      const keyDown = keys["KeyS"] || keys["ArrowDown"] ? 1 : 0;

      const inputRight = keyRight - keyLeft + touchVectorRef.current.x;
      const inputForward = keyUp - keyDown - touchVectorRef.current.y;

      if (Math.abs(inputRight) > 0.05 || Math.abs(inputForward) > 0.05) {
        camera.getWorldDirection(_fwd);
        _fwd.y = 0;
        if (_fwd.lengthSq() < 1e-5) _fwd.set(0, 0, -1);
        _fwd.normalize();
        _right.crossVectors(_fwd, _up).normalize();

        _moveDir.set(0, 0, 0).addScaledVector(_right, inputRight).addScaledVector(_fwd, inputForward);
        if (_moveDir.lengthSq() > 1) _moveDir.normalize();

        const sprint = keys["ShiftLeft"] || keys["ShiftRight"] ? 1.45 : 1.0;
        const speed = 3.6 * sprint;
        moveX = _moveDir.x * speed * dt;
        moveZ = _moveDir.z * speed * dt;
        moveSpeed = speed * _moveDir.length();
      } else if (waypoints.length > 0) {
        const target = waypoints[0];
        const dx = target.x - explorerPos.x;
        const dz = target.z - explorerPos.z;
        const dist = Math.hypot(dx, dz);

        if (dist < 0.18) {
          waypoints.shift();
          if (waypoints.length === 0) {
            explorer.setTargetMarker(null, elapsed);
            if (pendingTargetSchoolId) {
              const arrived = pendingTargetSchoolId;
              pendingTargetSchoolId = null;
              celebrationTimer = 1.6;
              sound.playDiscover();
              callbacksRef.current.onArriveSchool(arrived);
            }
          }
        } else {
          const speed = 3.9;
          moveX = (dx / dist) * speed * dt;
          moveZ = (dz / dist) * speed * dt;
          moveSpeed = speed;
          explorer.setTargetMarker(waypoints[waypoints.length - 1], elapsed);
        }
      } else {
        explorer.setTargetMarker(null, elapsed);
      }

      // 4. Walkable Collision & Surface Height Resolution (slide along X/Z separately at island rims)
      let onBridgeNow = false;
      if (moveSpeed > 0.05) {
        const tryBoth = evaluateWalkableSurface(explorerPos.x + moveX, explorerPos.z + moveZ, nodes, bridges);
        if (tryBoth.walkable) {
          explorerPos.x += moveX;
          explorerPos.z += moveZ;
          explorerPos.y = tryBoth.y;
          onBridgeNow = !!tryBoth.onBridge;
        } else {
          const tryX = evaluateWalkableSurface(explorerPos.x + moveX, explorerPos.z, nodes, bridges);
          if (tryX.walkable) {
            explorerPos.x += moveX;
            explorerPos.y = tryX.y;
            onBridgeNow = !!tryX.onBridge;
          } else {
            const tryZ = evaluateWalkableSurface(explorerPos.x, explorerPos.z + moveZ, nodes, bridges);
            if (tryZ.walkable) {
              explorerPos.z += moveZ;
              explorerPos.y = tryZ.y;
              onBridgeNow = !!tryZ.onBridge;
            }
          }
        }

        // Smooth character facing yaw
        const targetYaw = Math.atan2(moveX, moveZ);
        let diff = targetYaw - explorer.group.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        explorer.group.rotation.y += diff * Math.min(1, dt * 12);

        stepCooldown -= dt;
        if (stepCooldown <= 0 && verticalOffset <= 0.02) {
          sound.playStep(onBridgeNow);
          stepCooldown = 0.28;
        }

        // Detect entering a school island organically via manual WASD walking
        const surface = evaluateWalkableSurface(explorerPos.x, explorerPos.z, nodes, bridges);
        if (!surface.onBridge && surface.islandId && surface.islandId !== currentIslandId) {
          currentIslandId = surface.islandId;
          callbacksRef.current.onCurrentIslandChange(currentIslandId);
          if (!visitedRef.current.has(currentIslandId)) {
            celebrationTimer = 1.4;
            sound.playDiscover();
          }
          callbacksRef.current.onArriveSchool(currentIslandId);
        }
      }

      // 5. Jump physics
      if (verticalVel !== 0 || verticalOffset > 0) {
        verticalOffset += verticalVel * dt;
        verticalVel -= 13.5 * dt;
        if (verticalOffset <= 0) {
          verticalOffset = 0;
          verticalVel = 0;
        }
      }

      if (celebrationTimer > 0) celebrationTimer = Math.max(0, celebrationTimer - dt);

      explorer.group.position.copy(explorerPos);
      explorer.updateAnimation(dt, moveSpeed, verticalOffset, celebrationTimer > 0);

      // 6. Smooth Camera Choreography
      if (isOverviewFlight) {
        camera.position.x = THREE.MathUtils.damp(camera.position.x, flightTargetCam.x, 4.5, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, flightTargetCam.y, 4.5, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, flightTargetCam.z, 4.5, dt);
        controls.target.x = THREE.MathUtils.damp(controls.target.x, flightTargetLook.x, 5.5, dt);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, flightTargetLook.y, 5.5, dt);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, flightTargetLook.z, 5.5, dt);
        if (camera.position.distanceTo(flightTargetCam) < 0.08 && controls.target.distanceTo(flightTargetLook) < 0.05) {
          isOverviewFlight = false;
        }
      } else if (cameraFollowRef.current) {
        _camOffset.subVectors(camera.position, controls.target);
        _desiredTarget.set(explorerPos.x, explorerPos.y + 0.45, explorerPos.z);
        controls.target.x = THREE.MathUtils.damp(controls.target.x, _desiredTarget.x, 6.5, dt);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _desiredTarget.y, 6.5, dt);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _desiredTarget.z, 6.5, dt);
        camera.position.copy(controls.target).add(_camOffset);
      }

      controls.update();
      env.update(dt);
      updateLabelVisibility();

      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);

      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);

    return () => {
      destroyed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      ro.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      controls.removeEventListener("start", onControlsStart);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
      renderer.domElement.removeEventListener("webglcontextrestored", handleContextRestored);

      controls.dispose();
      env.dispose();
      worldAssets.dispose();
      explorer.dispose();
      envTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
      if (labelRenderer.domElement.parentNode === container) container.removeChild(labelRenderer.domElement);
    };
  }, [sound, touchVectorRef]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100">
      <div ref={mountRef} className="w-full h-full" />
      {contextLost && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/85 text-white p-6 text-center">
          <p className="text-lg font-semibold mb-2">3D 繪圖環境暫時中斷</p>
          <p className="text-sm text-slate-300 mb-4">請重新整理頁面以恢復宜蘭市中小學學習島場景。</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors"
          >
            重新載入
          </button>
        </div>
      )}
    </div>
  );
};
