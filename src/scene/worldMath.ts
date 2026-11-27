import * as THREE from "three";
import { ISLAND_BRIDGES, SchoolInfo, YILAN_SCHOOLS } from "../data/schools";

export const HEX_RADIUS = 2.0;
export const ISLAND_TOP_Y = 0.65;
export const WATER_Y = -0.18;
export const BRIDGE_HALF_WIDTH = 0.28;
export const BRIDGE_ARCH_HEIGHT = 0.14;

const SQRT3 = Math.sqrt(3);

// Real WGS84 origin near Old Town Yilan City
const ORIGIN_LAT = 24.75;
const ORIGIN_LNG = 121.754;
const KM_PER_DEG_LAT = 110.77;
const KM_PER_DEG_LNG = 111.32 * Math.cos((ORIGIN_LAT * Math.PI) / 180);
const WORLD_SCALE_X = 5.8;
const WORLD_SCALE_Z = 4.7;
const MIN_ISLAND_CENTER_DIST = 4.7; // Ensures 2*HEX_RADIUS (4.0) islands never touch or overlap

export interface IslandNode {
  school: SchoolInfo;
  center: THREE.Vector3;
}

export interface BridgeGeometryData {
  id: string;
  from: string;
  to: string;
  style: "river" | "oldtown" | "greenway" | "timber";
  label?: string;
  start: THREE.Vector3;
  end: THREE.Vector3;
  dir: THREE.Vector3;
  perp: THREE.Vector3;
  length: number;
  isRiverCrossing: boolean;
}

/**
 * Exact radial distance from center to boundary of a pointy-top hexagon along horizontal direction (dx, dz).
 * Pointy-top vertices sit at angles 30°, 90°, 150°, 210°, 270°, 330°; face normals at 0°, ±60°, ±120°, 180°.
 */
export function hexEdgeDistance(dx: number, dz: number, radius = HEX_RADIUS): number {
  const angle = Math.atan2(dz, dx);
  const sector = Math.round(angle / (Math.PI / 3)) * (Math.PI / 3);
  const delta = Math.abs(angle - sector);
  const apothem = (radius * SQRT3) / 2;
  return apothem / Math.max(0.5, Math.cos(delta));
}

/**
 * Pointy-top hexagon boundary test in local (dx, dz) coordinates.
 */
export function hexSignedDistance(dx: number, dz: number, radius = HEX_RADIUS): number {
  const ax = Math.abs(dx);
  const az = Math.abs(dz);
  const apothem = (radius * SQRT3) / 2;
  return Math.max(ax - apothem, (az + ax / SQRT3 - radius) * (SQRT3 / 2));
}

/**
 * Projects all 13 Yilan schools from real Google Maps WGS84 coordinates into 3D world space,
 * then applies deterministic minimum-distance relaxation so neighboring schools stay non-overlapping
 * while preserving real compass bearings and geographic clustering.
 */
export function buildWorldGraph(): {
  nodes: Map<string, IslandNode>;
  bridges: BridgeGeometryData[];
  adjacency: Map<string, string[]>;
  cityCenter: THREE.Vector3;
} {
  const projected = YILAN_SCHOOLS.map((school) => ({
    school,
    x: (school.coords.lng - ORIGIN_LNG) * KM_PER_DEG_LNG * WORLD_SCALE_X,
    z: -(school.coords.lat - ORIGIN_LAT) * KM_PER_DEG_LAT * WORLD_SCALE_Z,
  }));

  // Deterministic collision relaxation
  for (let iter = 0; iter < 100; iter++) {
    for (let i = 0; i < projected.length; i++) {
      for (let j = i + 1; j < projected.length; j++) {
        const dx = projected[j].x - projected[i].x;
        const dz = projected[j].z - projected[i].z;
        const d = Math.hypot(dx, dz) || 0.01;
        if (d < MIN_ISLAND_CENTER_DIST) {
          const push = (MIN_ISLAND_CENTER_DIST - d) * 0.52;
          const nx = dx / d;
          const nz = dz / d;
          projected[i].x -= nx * push;
          projected[i].z -= nz * push;
          projected[j].x += nx * push;
          projected[j].z += nz * push;
        }
      }
    }
  }

  const nodes = new Map<string, IslandNode>();
  const cityCenter = new THREE.Vector3();

  for (const item of projected) {
    const center = new THREE.Vector3(item.x, ISLAND_TOP_Y, item.z);
    nodes.set(item.school.id, { school: item.school, center });
    cityCenter.add(center);
  }
  cityCenter.divideScalar(projected.length);

  const bridges: BridgeGeometryData[] = [];
  const adjacency = new Map<string, string[]>();
  for (const s of YILAN_SCHOOLS) adjacency.set(s.id, []);

  for (const spec of ISLAND_BRIDGES) {
    const a = nodes.get(spec.from);
    const b = nodes.get(spec.to);
    if (!a || !b) continue;

    const delta = new THREE.Vector3().subVectors(b.center, a.center);
    delta.y = 0;
    const dist = delta.length();
    if (dist < 0.1) continue;
    const dir = delta.clone().normalize();
    const perp = new THREE.Vector3(-dir.z, 0, dir.x);

    const startRim = hexEdgeDistance(dir.x, dir.z, HEX_RADIUS) - 0.06;
    const endRim = hexEdgeDistance(-dir.x, -dir.z, HEX_RADIUS) - 0.06;
    const start = a.center.clone().addScaledVector(dir, startRim);
    const end = b.center.clone().addScaledVector(dir, -endRim);
    start.y = ISLAND_TOP_Y;
    end.y = ISLAND_TOP_Y;

    bridges.push({
      id: `${spec.from}__${spec.to}`,
      from: spec.from,
      to: spec.to,
      style: spec.style,
      label: spec.label,
      start,
      end,
      dir,
      perp,
      length: start.distanceTo(end),
      isRiverCrossing: spec.style === "river",
    });

    adjacency.get(spec.from)!.push(spec.to);
    adjacency.get(spec.to)!.push(spec.from);
  }

  return { nodes, bridges, adjacency, cityCenter };
}

/**
 * Finds shortest school-to-school path using Dijkstra on real world distances.
 */
export function findSchoolRoute(
  fromId: string,
  toId: string,
  nodes: Map<string, IslandNode>,
  adjacency: Map<string, string[]>,
): THREE.Vector3[] {
  if (fromId === toId) {
    const node = nodes.get(toId);
    return node ? [node.center.clone().add(new THREE.Vector3(0, 0, 0.65))] : [];
  }

  const dist = new Map<string, number>();
  const prev = new Map<string, string>();
  const unvisited = new Set<string>(nodes.keys());

  for (const id of unvisited) dist.set(id, Infinity);
  dist.set(fromId, 0);

  while (unvisited.size > 0) {
    let curr: string | null = null;
    let best = Infinity;
    for (const id of unvisited) {
      const d = dist.get(id)!;
      if (d < best) {
        best = d;
        curr = id;
      }
    }
    if (!curr || best === Infinity || curr === toId) break;
    unvisited.delete(curr);

    const cPos = nodes.get(curr)!.center;
    for (const nxt of adjacency.get(curr) || []) {
      if (!unvisited.has(nxt)) continue;
      const alt = best + cPos.distanceTo(nodes.get(nxt)!.center);
      if (alt < dist.get(nxt)!) {
        dist.set(nxt, alt);
        prev.set(nxt, curr);
      }
    }
  }

  const chain: string[] = [];
  let step: string | undefined = toId;
  while (step) {
    chain.unshift(step);
    if (step === fromId) break;
    step = prev.get(step);
  }

  if (chain[0] !== fromId) {
    const target = nodes.get(toId);
    return target ? [target.center.clone()] : [];
  }

  return chain.map((id, idx) => {
    const c = nodes.get(id)!.center.clone();
    if (idx === chain.length - 1) {
      c.z += 0.62;
    }
    return c;
  });
}

/**
 * Evaluates whether (x, z) is on a walkable island or bridge, returns walkable height Y and nearest island ID.
 */
export function evaluateWalkableSurface(
  x: number,
  z: number,
  nodes: Map<string, IslandNode>,
  bridges: BridgeGeometryData[],
): {
  walkable: boolean;
  y: number;
  islandId: string | null;
  onBridge: BridgeGeometryData | null;
} {
  let closestIsland: string | null = null;
  let closestDist = Infinity;

  for (const [id, node] of nodes) {
    const dx = x - node.center.x;
    const dz = z - node.center.z;
    const d = Math.hypot(dx, dz);
    if (d < closestDist) {
      closestDist = d;
      closestIsland = id;
    }
    if (hexSignedDistance(dx, dz, HEX_RADIUS - 0.12) <= 0) {
      return { walkable: true, y: ISLAND_TOP_Y, islandId: id, onBridge: null };
    }
  }

  for (const br of bridges) {
    const rx = x - br.start.x;
    const rz = z - br.start.z;
    const along = rx * br.dir.x + rz * br.dir.z;
    const across = Math.abs(rx * br.perp.x + rz * br.perp.z);
    if (along >= -0.28 && along <= br.length + 0.28 && across <= BRIDGE_HALF_WIDTH) {
      const t = THREE.MathUtils.clamp(along / br.length, 0, 1);
      const arch =
        Math.sin(t * Math.PI) *
        (br.isRiverCrossing ? BRIDGE_ARCH_HEIGHT * 1.35 : BRIDGE_ARCH_HEIGHT);
      return {
        walkable: true,
        y: ISLAND_TOP_Y + arch + 0.02,
        islandId: closestIsland,
        onBridge: br,
      };
    }
  }

  return { walkable: false, y: ISLAND_TOP_Y, islandId: closestIsland, onBridge: null };
}
