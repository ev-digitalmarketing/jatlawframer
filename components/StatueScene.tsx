"use client";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { buildLadyJustice } from "./LadyJustice";

const FACING = 0; // degrees. Only used for a custom /statue.glb: if it faces sideways or backwards at rest, try 90, 180 or -90.

/* Polished cast bronze. Vertex colours (baked cavity shading) darken the recesses between the folds. */
const bronze = new THREE.MeshStandardMaterial({ color: "#b58a4d", metalness: 1, roughness: 0.3, vertexColors: true, envMapIntensity: 1.15 });
const plinthMat = new THREE.MeshStandardMaterial({ color: "#463b30", metalness: 0.25, roughness: 0.55, envMapIntensity: 0.8 });

/** Normalise to 2 units tall, standing on y = -1. A custom model is also centred; the built-in one already turns on its own axis. */
function normalise(m: THREE.Object3D, centre = true) {
  const box = new THREE.Box3().setFromObject(m);
  const size = box.getSize(new THREE.Vector3());
  const c = box.getCenter(new THREE.Vector3());
  const s = 2 / size.y;
  m.scale.setScalar(s);
  m.position.set(centre ? -c.x * s : 0, -1 - box.min.y * s, centre ? -c.z * s : 0);
}

function Sculpt() {
  const model = useMemo(() => {
    const g = buildLadyJustice();
    g.getObjectByName("bronze")!.traverse((o) => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = bronze; });
    g.getObjectByName("plinth")!.traverse((o) => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = plinthMat; });
    normalise(g, false);
    return g;
  }, []);
  useEffect(() => () => model.traverse((o) => { (o as THREE.Mesh).geometry?.dispose?.(); }), [model]);
  return <primitive object={model} />;
}

/** Optional: drop a sculpted model at public/statue.glb and it replaces the procedural statue. */
function GlbModel() {
  const { scene } = useGLTF("/statue.glb");
  const model = useMemo(() => {
    const m = scene.clone(true);
    m.traverse((o) => { const mesh = o as THREE.Mesh; if (mesh.isMesh) mesh.material = bronze; });
    normalise(m);
    return m;
  }, [scene]);
  return <primitive object={model} />;
}

function Spin({ rotY, children }: { rotY: MotionValue<number>; children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => { invalidate(); return rotY.on("change", () => invalidate()); }, [rotY, invalidate]);
  useFrame(() => { if (g.current) g.current.rotation.y = THREE.MathUtils.degToRad(rotY.get() + FACING); });
  return <group ref={g}>{children}</group>;
}

/** A small studio built from light panels, so nothing has to be downloaded. */
function Studio() {
  return (
    <Environment resolution={256}>
      <color attach="background" args={["#120d08"]} />
      <Lightformer form="rect" intensity={7} color="#fff0da" position={[-5, 4, 4]} scale={[6, 5, 1]} />
      <Lightformer form="rect" intensity={2.2} color="#d4e2ff" position={[6, 1.5, 3]} scale={[4, 8, 1]} />
      <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 8, 1]} scale={[10, 10, 1]} />
      <Lightformer form="rect" intensity={6} color="#ffd9a3" position={[0, 3, -7]} scale={[10, 3, 1]} />
      <Lightformer form="rect" intensity={0.9} color="#b07f45" position={[0, -6, 2]} scale={[14, 14, 1]} />
      <Lightformer form="rect" intensity={9} color="#ffffff" position={[3.5, 2, 6]} scale={[0.6, 8, 1]} />
      <Lightformer form="rect" intensity={5} color="#ffe9c8" position={[-6.5, -1, 2]} scale={[0.8, 8, 1]} />
    </Environment>
  );
}

export default function StatueScene({ rotY, glb = false }: { rotY: MotionValue<number>; glb?: boolean }) {
  return (
    <Canvas frameloop="demand" camera={{ position: [0, 0.02, 4.25], fov: 30 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
      <Suspense fallback={null}>
        <Studio />
        <directionalLight position={[3, 5, 4]} intensity={1.1} color="#ffe2b8" />
        <Spin rotY={rotY}>{glb ? <GlbModel /> : <Sculpt />}</Spin>
        <ContactShadows position={[0, -1.0, 0]} opacity={0.5} blur={2.4} scale={4} far={1.4} />
      </Suspense>
    </Canvas>
  );
}
