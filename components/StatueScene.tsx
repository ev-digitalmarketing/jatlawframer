"use client";
import { Suspense, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";

// Scales of Justice, built from primitives (no model file). Lit by the studio softboxes below.
const gold = new THREE.MeshStandardMaterial({ color: "#d4a63a", metalness: 1, roughness: 0.26, envMapIntensity: 1.3, side: THREE.DoubleSide });
const goldSoft = new THREE.MeshStandardMaterial({ color: "#b88a28", metalness: 1, roughness: 0.4, envMapIntensity: 1.1, side: THREE.DoubleSide });

const HALF = 0.8;     // half the beam length
const DROP = 0.62;    // chain length
const PIVOT_Y = 0.95; // beam height
const SIZE = 0.9;     // overall size (1 = fills the canvas height)
const SWAY = 0.12;    // how far the beam rocks (radians)

const baseProfile = [[0, -1], [0.62, -1], [0.62, -0.94], [0.55, -0.92], [0.5, -0.86], [0.38, -0.8], [0.26, -0.74], [0.16, -0.68], [0.1, -0.62]]
  .map(([x, y]) => new THREE.Vector2(x, y));
const panProfile = [[0, -0.075], [0.1, -0.072], [0.2, -0.056], [0.28, -0.03], [0.32, 0], [0.335, 0.014], [0.32, 0.022], [0.3, 0.008], [0.26, -0.02], [0.18, -0.046], [0.09, -0.06], [0, -0.063]]
  .map(([x, y]) => new THREE.Vector2(x, y));
const chainEnds = [0, 1, 2].map((k) => { const a = (k * Math.PI * 2) / 3 + Math.PI / 2; return new THREE.Vector3(0.32 * Math.cos(a), -DROP + 0.02, 0.32 * Math.sin(a)); });

function Chain({ to }: { to: THREE.Vector3 }) {
  const { pos, quat, len } = useMemo(() => ({
    len: to.length(),
    pos: to.clone().multiplyScalar(0.5),
    quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().normalize()),
  }), [to]);
  return <mesh position={pos} quaternion={quat} material={gold}><cylinderGeometry args={[0.006, 0.006, len, 6]} /></mesh>;
}

function Pan({ x, groupRef }: { x: number; groupRef: RefObject<THREE.Group> }) {
  return (
    <group ref={groupRef} position={[x, -0.04, 0]}>
      <mesh material={goldSoft}><torusGeometry args={[0.04, 0.01, 8, 20]} /></mesh>
      {chainEnds.map((v, i) => <Chain key={i} to={v} />)}
      <mesh position={[0, -DROP, 0]} material={gold}><latheGeometry args={[panProfile, 56]} /></mesh>
      <mesh position={[0, -DROP - 0.115, 0]} rotation={[Math.PI, 0, 0]} material={goldSoft}><coneGeometry args={[0.035, 0.1, 12]} /></mesh>
    </group>
  );
}

function Scales({ rotY }: { rotY: MotionValue<number> }) {
  const spin = useRef<THREE.Group>(null);
  const beam = useRef<THREE.Group>(null);
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (spin.current) spin.current.rotation.y = THREE.MathUtils.degToRad(rotY.get()); // same spin as the statue had
    const tilt = SWAY * Math.sin(t * 0.85) * (0.75 + 0.25 * Math.sin(t * 0.31));       // the beam rocking up and down
    const swing = 0.05 * Math.sin(t * 1.7 + 1.1);                                       // pans swing a little behind it
    if (beam.current) beam.current.rotation.z = tilt;
    if (left.current) left.current.rotation.z = -tilt + swing;
    if (right.current) right.current.rotation.z = -tilt - swing * 0.8;
  });
  return (
    <group ref={spin} scale={SIZE} position={[0, -1 + SIZE, 0]}>
      {/* base and column */}
      <mesh material={goldSoft}><latheGeometry args={[baseProfile, 64]} /></mesh>
      <mesh position={[0, 0.15, 0]} material={gold}><cylinderGeometry args={[0.062, 0.085, 1.6, 32]} /></mesh>
      {[-0.45, 0, 0.5].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={goldSoft}><torusGeometry args={[0.095, 0.022, 12, 40]} /></mesh>
      ))}
      {/* pivot */}
      <mesh position={[0, PIVOT_Y, 0]} material={gold}><sphereGeometry args={[0.13, 32, 24]} /></mesh>
      <mesh position={[0, PIVOT_Y + 0.18, 0]} material={gold}><sphereGeometry args={[0.055, 20, 16]} /></mesh>
      {/* beam with its two pans */}
      <group ref={beam} position={[0, PIVOT_Y, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} material={gold}><capsuleGeometry args={[0.035, HALF * 2 - 0.07, 8, 16]} /></mesh>
        {[-1, 1].map((s) => <mesh key={s} position={[s * HALF, 0, 0]} material={gold}><sphereGeometry args={[0.065, 20, 16]} /></mesh>)}
        <Pan x={-HALF} groupRef={left} />
        <Pan x={HALF} groupRef={right} />
      </group>
    </group>
  );
}

export default function StatueScene({ rotY }: { rotY: MotionValue<number> }) {
  return (
    <Canvas camera={{ position: [0, 0.1, 5], fov: 30 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
      <Suspense fallback={null}>
        <Environment resolution={256}>
          <color attach="background" args={["#4a3e2a"]} />
          <Lightformer form="rect" intensity={4} color="#fff4dc" position={[0, 6, 3]} scale={[12, 5, 1]} />
          <Lightformer form="rect" intensity={3} color="#ffe2a8" position={[-6, 1, 3]} scale={[3, 9, 1]} />
          <Lightformer form="rect" intensity={2.4} color="#dfeaff" position={[6, 1, 2]} scale={[3, 9, 1]} />
          <Lightformer form="rect" intensity={1.6} color="#ffffff" position={[0, -4, 4]} scale={[10, 2, 1]} />
          <Lightformer form="ring" intensity={2} color="#ffd48a" position={[0, 0, -6]} scale={8} />
        </Environment>
        <directionalLight position={[3, 4, 3]} intensity={1.1} color="#ffe2b0" />
        <Scales rotY={rotY} />
        <ContactShadows position={[0, -1, 0]} opacity={0.55} blur={2.4} scale={4} far={2} />
      </Suspense>
    </Canvas>
  );
}
