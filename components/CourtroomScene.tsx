"use client";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { MotionValue } from "framer-motion";
import scene from "@/lib/courtroom.json";

type V3 = [number, number, number];
type Prim = { t: "box" | "cyl" | "sph"; p: V3; s?: V3; r?: number; h?: number; c: string; m: string; rx?: number; ry?: number; rz?: number };
type Lamp = { p: V3; i: number; c: string };
const PRIMS = scene.prims as unknown as Prim[];
const LAMPS = scene.lights as unknown as Lamp[];

// The camera path: one stop per section (hero, services, journey, reviews).
const STOPS: { p: V3; l: V3 }[] = [
  { p: [0, 2.9, 5.5], l: [0, 3.4, -30] },   // just inside the doors, looking down the aisle
  { p: [0, 2.7, -8], l: [0, 3.2, -36] },    // walking between the gallery pews
  { p: [0, 2.5, -22], l: [0, 3.0, -42] },   // approaching the bar
  { p: [2.5, 2.8, -34], l: [8, 2.6, -42] }, // in the well, turning towards the jury box
];

const clamp = THREE.MathUtils.clamp;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Parquet floor texture, drawn once on a canvas (no image files needed). */
function parquet(w: number, l: number) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "#24140a"; g.fillRect(0, 0, 512, 512);
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const cols = 8, pw = 64, len = 128;
  for (let i = 0; i < cols; i++) {
    const off = (i * 53) % len;
    for (let j = -1; j < 512 / len + 1; j++) {
      const y = j * len + off;
      g.fillStyle = `hsl(${22 + rnd() * 6},48%,${24 + rnd() * 9}%)`;
      for (const yy of [y, y - 512, y + 512]) g.fillRect(i * pw + 1, yy + 1, pw - 2, len - 2);
    }
  }
  for (let k = 0; k < 1400; k++) { g.fillStyle = `rgba(0,0,0,${0.05 + rnd() * 0.08})`; g.fillRect(rnd() * 512, rnd() * 512, 1 + rnd() * 2, 8 + rnd() * 30); }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.repeat.set(w / 4, l / 4);
  return t;
}

/** Every box/cylinder/sphere in lib/courtroom.json, merged into one mesh per material (a handful of draw calls). */
function Room() {
  const parts = useMemo(() => {
    const mats: Record<string, THREE.Material> = {
      wood: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0.08, envMapIntensity: 0.35 }),
      plaster: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0, envMapIntensity: 0.25 }),
      fabric: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0, envMapIntensity: 0.2 }),
      gold: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.28, metalness: 1, envMapIntensity: 1.3 }),
      glow: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
    };
    const groups: Record<string, THREE.BufferGeometry[]> = {};
    const q = new THREE.Quaternion(), e = new THREE.Euler(), one = new THREE.Vector3(1, 1, 1), m4 = new THREE.Matrix4();
    for (const o of PRIMS) {
      const g = o.t === "box" ? new THREE.BoxGeometry(o.s![0], o.s![1], o.s![2])
        : o.t === "cyl" ? new THREE.CylinderGeometry(o.r!, o.r!, o.h!, 18)
        : new THREE.SphereGeometry(o.r!, 10, 8);
      e.set(o.rx ?? 0, o.ry ?? 0, o.rz ?? 0, "XYZ");
      q.setFromEuler(e);
      m4.compose(new THREE.Vector3(o.p[0], o.p[1], o.p[2]), q, one);
      g.applyMatrix4(m4);
      const col = new THREE.Color(o.c);
      const n = g.attributes.position.count;
      const arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { arr[i * 3] = col.r; arr[i * 3 + 1] = col.g; arr[i * 3 + 2] = col.b; }
      g.setAttribute("color", new THREE.BufferAttribute(arr, 3));
      (groups[o.m] = groups[o.m] || []).push(g);
    }
    return Object.entries(groups).map(([m, gs]) => ({ key: m, geo: mergeGeometries(gs, false)!, mat: mats[m] || mats.wood }));
  }, []);
  const floor = useMemo(() => parquet(22.4, 68.6), []);
  return (
    <>
      {parts.map((p) => <mesh key={p.key} geometry={p.geo} material={p.mat} />)}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -24.2]}>
        <planeGeometry args={[22.4, 68.6]} />
        <meshStandardMaterial map={floor} roughness={0.38} metalness={0.1} envMapIntensity={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 45]}>
        <planeGeometry args={[160, 70]} />
        <meshStandardMaterial color="#4a4d5a" roughness={0.9} />
      </mesh>
    </>
  );
}

/** The two big entrance doors swing open when the page loads. */
function Doors({ still }: { still: boolean }) {
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const k = still ? 1 : easeInOut(clamp((clock.elapsedTime - 0.5) / 1.9, 0, 1));
    if (left.current) left.current.rotation.y = k * 1.75;
    if (right.current) right.current.rotation.y = -k * 1.75;
  });
  const leaf = (dir: number) => (
    <group position={[dir * 1.25, 3.7, 0]}>
      <mesh><boxGeometry args={[2.5, 7.4, 0.3]} /><meshStandardMaterial color="#3a2212" roughness={0.5} metalness={0.1} envMapIntensity={0.4} /></mesh>
      {[[1.9, 2.6], [-1.5, 3.4]].map(([y, h]) => (
        <mesh key={y} position={[0, y, 0]}><boxGeometry args={[1.9, h, 0.42]} /><meshStandardMaterial color="#5a3820" roughness={0.5} metalness={0.1} envMapIntensity={0.4} /></mesh>
      ))}
      {[-1, 1].map((z) => <mesh key={z} position={[dir * 1.0, -0.2, z * 0.24]}><sphereGeometry args={[0.11, 16, 12]} /><meshStandardMaterial color="#c9a227" metalness={1} roughness={0.25} /></mesh>)}
    </group>
  );
  return (
    <>
      <group ref={left} position={[-2.5, 0, 10.3]}>{leaf(1)}</group>
      <group ref={right} position={[2.5, 0, 10.3]}>{leaf(-1)}</group>
    </>
  );
}

/** Scroll = walking through the room. A smooth curve through STOPS, plus a gentle mouse parallax. */
function Rig({ progress, still }: { progress: MotionValue<number>; still: boolean }) {
  const camera = useThree((s) => s.camera);
  const mouse = useRef({ x: 0, y: 0 });
  const posCurve = useMemo(() => new THREE.CatmullRomCurve3(STOPS.map((s) => new THREE.Vector3(...s.p)), false, "centripetal"), []);
  const lookCurve = useMemo(() => new THREE.CatmullRomCurve3(STOPS.map((s) => new THREE.Vector3(...s.l)), false, "centripetal"), []);
  const P = useMemo(() => new THREE.Vector3(), []);
  const Lk = useMemo(() => new THREE.Vector3(), []);
  const look = useRef(new THREE.Vector3(...STOPS[0].l));
  useEffect(() => {
    if (still) return;
    const move = (e: PointerEvent) => { mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1; mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1); };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [still]);
  useFrame(({ clock }, dt) => {
    const u = still ? 0 : clamp(progress.get(), 0, 1);
    posCurve.getPoint(u, P);
    lookCurve.getPoint(u, Lk);
    const t = clock.elapsedTime;
    const intro = still ? 1 : easeOut(clamp((t - 0.4) / 3.4, 0, 1)); // dolly in through the doors
    P.z += (1 - intro) * 12;
    P.y += (1 - intro) * 0.5;
    if (!still) {
      P.x += mouse.current.x * 0.4 + Math.sin(t * 0.35) * 0.1;
      P.y += mouse.current.y * 0.18 + Math.sin(t * 0.5) * 0.05;
    }
    const k = 1 - Math.exp(-Math.min(dt, 0.1) * 5);
    camera.position.lerp(P, k);
    look.current.lerp(Lk, k);
    camera.lookAt(look.current);
  });
  return null;
}

export default function CourtroomScene({ progress, still = false, onReady }: { progress: MotionValue<number>; still?: boolean; onReady?: () => void }) {
  return (
    <Canvas camera={{ position: [0, 3.4, 17.5], fov: 55, near: 0.1, far: 140 }} dpr={[1, 1.75]} gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={() => onReady?.()}>
      <color attach="background" args={["#0a1424"]} />
      <fog attach="fog" args={["#0a1424", 24, 80]} />
      <Suspense fallback={null}>
        <Environment resolution={128}>
          <Lightformer form="rect" intensity={3} color="#fff1d6" position={[0, 8, 0]} scale={[14, 14, 1]} rotation-x={Math.PI / 2} />
          <Lightformer form="rect" intensity={2} color="#ffe2a8" position={[-8, 3, 0]} scale={[10, 5, 1]} rotation-y={Math.PI / 2} />
          <Lightformer form="rect" intensity={2} color="#ffe2a8" position={[8, 3, 0]} scale={[10, 5, 1]} rotation-y={-Math.PI / 2} />
        </Environment>
      </Suspense>
      <hemisphereLight args={["#fff1d6", "#2b1a0e", 1.0]} />
      <ambientLight intensity={0.5} color="#6f89bd" />
      {LAMPS.map((l, i) => <pointLight key={i} position={l.p} intensity={l.i} color={l.c} distance={0} decay={2} />)}
      <Room />
      <Doors still={still} />
      <Sparkles count={80} scale={[18, 8, 50]} position={[0, 5, -20]} size={3} speed={0.3} color="#ffd98a" opacity={0.6} />
      <Rig progress={progress} still={still} />
    </Canvas>
  );
}
