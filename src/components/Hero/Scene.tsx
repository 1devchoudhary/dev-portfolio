"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject, ReactNode, RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Stars } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { useReducedMotion } from "motion/react";
import PlasmaSun from "../three/PlasmaSun";
import {
  siMongodb,
  siNextdotjs,
  siNodedotjs,
  siReact,
  siTailwindcss,
  siThreedotjs,
  type SimpleIcon,
} from "simple-icons";

const INNER_RING = [siReact, siNodedotjs, siMongodb];
const OUTER_RING = [siNextdotjs, siTailwindcss, siThreedotjs];

// Brand logos are drawn onto glass discs at runtime — no image assets to load
function makeIconTexture(icon: SimpleIcon): THREE.CanvasTexture {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;

  ctx.fillStyle = "rgba(24, 24, 27, 0.88)";
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, 116, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ff5900";
  ctx.lineWidth = 10;
  ctx.stroke();

  // simple-icons paths use a 24x24 viewBox
  const iconSize = 120;
  ctx.translate((size - iconSize) / 2, (size - iconSize) / 2);
  ctx.scale(iconSize / 24, iconSize / 24);
  ctx.fillStyle = "#ff8a00";
  ctx.fill(new Path2D(icon.path));

  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Soft pool of light under the core; a radial gradient that fades to fully
// transparent so no hard plane edges show at the canvas bounds
function GroundGlow() {
  const texture = useMemo(() => {
    const size = 256;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d")!;
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 8, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255, 89, 0, 0.3)");
    gradient.addColorStop(1, "rgba(255, 89, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }, []);

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -2.4, 0]}>
      <planeGeometry args={[5.5, 5.5]} />
      <meshBasicMaterial map={texture} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

function EnergyCore() {
  const shouldReduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  return (
    <group onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <PlasmaSun radius={1.1} coronaScale={4.4} hovered={hovered} paused={!!shouldReduceMotion} />
    </group>
  );
}

function OrbitRing({
  radius,
  tilt,
  icons,
  speed,
}: {
  radius: number;
  tilt: [number, number, number];
  icons: SimpleIcon[];
  speed: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const spriteRefs = useRef<(THREE.Sprite | null)[]>([]);
  const textures = useMemo(() => icons.map(makeIconTexture), [icons]);

  useFrame((state) => {
    const t = shouldReduceMotion ? 0 : state.clock.elapsedTime;
    icons.forEach((_, i) => {
      const sprite = spriteRefs.current[i];
      if (!sprite) return;
      const angle = (i / icons.length) * Math.PI * 2 + t * speed;
      sprite.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    });
  });

  return (
    <group rotation={tilt}>
      <mesh rotation-x={Math.PI / 2}>
        <torusGeometry args={[radius, 0.008, 8, 160]} />
        <meshBasicMaterial color="#ff5900" transparent opacity={0.28} />
      </mesh>
      {icons.map((icon, i) => (
        <sprite
          key={icon.slug}
          ref={(el) => {
            spriteRefs.current[i] = el;
          }}
          scale={[0.62, 0.62, 1]}
        >
          <spriteMaterial map={textures[i]} transparent depthWrite={false} />
        </sprite>
      ))}
    </group>
  );
}

// Keeps the core composed right-of-center on wide screens without ever
// pushing the outer ring past the visible edge
function CenterOffset({ children }: { children: ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ viewport }) => {
    if (groupRef.current) {
      groupRef.current.position.x = Math.max(0, viewport.width / 2 - 3.4);
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

// The whole camera eases toward the pointer for a scene-wide parallax effect
function CameraRig() {
  const shouldReduceMotion = useReducedMotion();

  useFrame(({ camera, pointer }) => {
    const targetX = shouldReduceMotion ? 0 : pointer.x * 1.1;
    const targetY = 0.4 + (shouldReduceMotion ? 0 : pointer.y * 0.7);
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function Scene({ eventSource }: { eventSource?: RefObject<HTMLElement | null> }) {
  const shouldReduceMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  // Stop the render loop entirely while the hero is scrolled off screen
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="w-full h-full">
      <Canvas
        frameloop={inView ? "always" : "never"}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.4, 8.4], fov: 45 }}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        {...(eventSource
          ? { eventSource: eventSource as MutableRefObject<HTMLElement>, eventPrefix: "client" as const }
          : {})}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 5, 6]} intensity={1.1} />
        <pointLight position={[-3, 2, 3]} intensity={8} distance={30} color="#ff5900" />

        <CenterOffset>
          <Suspense fallback={null}>
            <EnergyCore />
            <OrbitRing radius={2.5} tilt={[0.45, 0, 0.12]} icons={INNER_RING} speed={0.32} />
            <OrbitRing radius={3.1} tilt={[-0.38, 0.5, -0.1]} icons={OUTER_RING} speed={-0.22} />
          </Suspense>

          <Sparkles count={160} scale={4.5} size={2.5} speed={shouldReduceMotion ? 0 : 0.4} color="#ff8a00" />
          <Sparkles count={60} scale={5.5} size={2} speed={shouldReduceMotion ? 0 : 0.25} color="#8b5cf6" opacity={0.7} />
          <GroundGlow />
        </CenterOffset>

        {!shouldReduceMotion && (
          <Stars radius={100} depth={50} count={3000} factor={3} saturation={1} fade speed={1} />
        )}

        <CameraRig />
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.9} luminanceThreshold={0.22} luminanceSmoothing={0.4} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
