"use client";
import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";

const BRONZE = true; // true = paint the model in polished bronze. false = keep the model's own textures.
const FACING = 0;    // degrees. If the statue faces sideways or backwards at rest, try 90, 180 or -90.

const bronze = new THREE.MeshStandardMaterial({ color: "#a8743a", metalness: 0.92, roughness: 0.32, envMapIntensity: 1.3 });

function Statue({ rotY }: { rotY: MotionValue<number> }) {
  const g = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/statue.glb");
  const model = useMemo(() => {
    const m = scene.clone(true);
    const box = new THREE.Box3().setFromObject(m);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    const s = 2 / size.y; // normalise to 2 units tall, standing on y = -1
    m.scale.setScalar(s);
    m.position.set(-c.x * s, -1 - box.min.y * s, -c.z * s);
    if (BRONZE) m.traverse((o) => { const mesh = o as THREE.Mesh; if (mesh.isMesh) mesh.material = bronze; });
    return m;
  }, [scene]);
  useFrame(() => { if (g.current) g.current.rotation.y = THREE.MathUtils.degToRad(rotY.get() + FACING); });
  return <group ref={g}><primitive object={model} /></group>;
}

export default function StatueScene({ rotY }: { rotY: MotionValue<number> }) {
  return (
    <Canvas camera={{ position: [0, 0.1, 5], fov: 30 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
      <Suspense fallback={null}>
        <Environment preset="city" />
        <directionalLight position={[3, 4, 3]} intensity={1.6} color="#ffe2b0" />
        <Statue rotY={rotY} />
        <ContactShadows position={[0, -1, 0]} opacity={0.55} blur={2.4} scale={4} far={2} />
      </Suspense>
    </Canvas>
  );
}
