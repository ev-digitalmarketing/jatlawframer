"use client";
import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";

const FACING = 0; // degrees. If the statue faces sideways or backwards at rest, try 90, 180 or -90.

// Polished gold-bronze. Lit by the studio softboxes below (no external HDR download, so it can never hang).
const gold = new THREE.MeshStandardMaterial({ color: "#d9ad3f", metalness: 1, roughness: 0.27, envMapIntensity: 1.25, side: THREE.DoubleSide });

function Statue({ rotY }: { rotY: MotionValue<number> }) {
  const g = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/statue.glb");
  const model = useMemo(() => {
    const m = scene.clone(true);
    const box = new THREE.Box3().setFromObject(m);
    const s = 2 / (box.max.y - box.min.y); // normalise to 2 units tall, standing on y = -1
    m.scale.setScalar(s);
    m.position.set(0, -1 - box.min.y * s, 0); // keep x/z so the statue spins on its own body axis
    m.traverse((o) => { const mesh = o as THREE.Mesh; if (mesh.isMesh) mesh.material = gold; });
    return m;
  }, [scene]);
  useFrame(() => { if (g.current) g.current.rotation.y = THREE.MathUtils.degToRad(rotY.get() + FACING); });
  return <group ref={g}><primitive object={model} /></group>;
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
        <Statue rotY={rotY} />
        <ContactShadows position={[0, -1, 0]} opacity={0.55} blur={2.4} scale={4} far={2} />
      </Suspense>
    </Canvas>
  );
}
