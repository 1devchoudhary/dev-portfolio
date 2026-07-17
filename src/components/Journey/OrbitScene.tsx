"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Stars } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import type { MotionValue } from "motion/react";
import PlasmaSun from "../three/PlasmaSun";
import { portfolioContent } from "@/data/content";

// oldest first, so scrolling moves forward through time
const JOURNEY = [...portfolioContent.journey].reverse();
const N = JOURNEY.length;
const STEP = (Math.PI * 2) / N;
const RADIUS = 4.1;

function makeYearTexture(year: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const x = c.getContext("2d")!;
  x.font = "800 96px system-ui, sans-serif";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.shadowColor = "rgba(255, 89, 0, 0.9)";
  x.shadowBlur = 30;
  x.fillStyle = "#ff8a00";
  x.fillText(year, 256, 128);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// The tilted ring of milestone planets; the active one docks at +x (screen
// right, clear of the info card) and ignites
function Planets({ progress }: { progress: MotionValue<number> }) {
  const rotRef = useRef(0);
  const bodies = useRef<
    { g: THREE.Group | null; m: THREE.MeshStandardMaterial | null; h: THREE.MeshBasicMaterial | null }[]
  >(JOURNEY.map(() => ({ g: null, m: null, h: null })));
  const textures = useMemo(() => JOURNEY.map((j) => makeYearTexture(j.year)), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const target = -progress.get() * (N - 1) * STEP;
    rotRef.current += (target - rotRef.current) * 0.08;
    JOURNEY.forEach((_, i) => {
      const b = bodies.current[i];
      if (!b.g || !b.m || !b.h) return;
      const a = i * STEP + rotRef.current;
      const front = Math.max(0, Math.cos(a));
      const s = 0.85 + 0.6 * front;
      b.g.scale.set(s, s, s);
      b.g.position.set(Math.cos(a) * RADIUS, Math.sin(t * 1.2 + i * 1.7) * 0.08, Math.sin(a) * RADIUS);
      b.m.emissiveIntensity = 0.12 + 0.55 * front;
      b.h.opacity = 0.2 + 0.7 * front;
    });
  });

  return (
    <group rotation={[0.5, 0, 0.1]}>
      <mesh rotation-x={Math.PI / 2}>
        <torusGeometry args={[RADIUS, 0.013, 8, 220]} />
        <meshBasicMaterial color="#ff5900" transparent opacity={0.4} />
      </mesh>
      {JOURNEY.map((item, i) => (
        <group
          key={item.id}
          ref={(el) => {
            bodies.current[i].g = el;
          }}
        >
          <mesh>
            <sphereGeometry args={[0.46, 48, 48]} />
            <meshStandardMaterial
              ref={(el) => {
                bodies.current[i].m = el;
              }}
              color="#151519"
              metalness={0.55}
              roughness={0.25}
              emissive="#ff5900"
              emissiveIntensity={0.12}
            />
          </mesh>
          <mesh rotation-x={1.15}>
            <torusGeometry args={[0.68, 0.02, 8, 90]} />
            <meshBasicMaterial
              ref={(el) => {
                bodies.current[i].h = el;
              }}
              color="#ff8a00"
              transparent
              opacity={0.25}
            />
          </mesh>
          <sprite position={[0, -1, 0]} scale={[2.1, 1.05, 1]}>
            <spriteMaterial map={textures[i]} transparent depthWrite={false} />
          </sprite>
        </group>
      ))}
    </group>
  );
}

function CameraRig() {
  useFrame(({ camera, pointer }) => {
    camera.position.x += (0.6 + pointer.x * 0.5 - camera.position.x) * 0.05;
    camera.position.y += (2.2 + pointer.y * 0.4 - camera.position.y) * 0.05;
    camera.lookAt(1.4, -0.1, 0);
  });
  return null;
}

export default function OrbitScene({ progress }: { progress: MotionValue<number> }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="absolute inset-0">
      <Canvas
        frameloop={inView ? "always" : "never"}
        dpr={[1, 1.5]}
        camera={{ position: [0.6, 2.2, 11.4], fov: 45 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 6, 5]} intensity={1.0} />
        <pointLight position={[-5, 4, 5]} intensity={10} distance={60} color="#ff5900" />
        {/* cool rim on the dark side of the planets — warm sun against cool space */}
        <pointLight position={[6, -4, -6]} intensity={26} distance={40} color="#7c3aed" />

        {/* the system sits right-of-center so the card owns the left */}
        <group position={[1.6, 0, 0]}>
          <PlasmaSun radius={1.05} coronaScale={5} />
          <Planets progress={progress} />
          <mesh rotation={[Math.PI / 2 + 0.55, -0.35, 0]}>
            <torusGeometry args={[5.6, 0.006, 8, 220]} />
            <meshBasicMaterial color="#ff5900" transparent opacity={0.1} />
          </mesh>
          <Sparkles count={110} scale={5} size={2.5} speed={0.4} color="#ff8a00" />
          <Sparkles count={50} scale={6} size={2} speed={0.25} color="#8b5cf6" opacity={0.7} />
        </group>

        <Stars radius={100} depth={50} count={3000} factor={3} saturation={1} fade speed={1} />
        <CameraRig />
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.9} luminanceThreshold={0.22} luminanceSmoothing={0.4} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
