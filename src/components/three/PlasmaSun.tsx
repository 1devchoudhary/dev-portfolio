"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const VERTEX = /* glsl */ `
  varying vec3 vNormalW; varying vec3 vPosW; varying vec3 vLocal;
  void main() {
    vLocal = position;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPosW = wp.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uBoost;
  varying vec3 vNormalW; varying vec3 vPosW; varying vec3 vLocal;

  float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float noise(vec3 x) {
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) {
    float v = 0.0, a = 0.5;
    for (int k = 0; k < 4; k++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main() {
    vec3 p = normalize(vLocal);
    float n  = fbm(p * 3.0 + uTime * vec3(0.06, 0.04, 0.05));
    float n2 = fbm(p * 7.0 + uTime * vec3(-0.05, 0.06, 0.04) + 3.7);
    float cells = smoothstep(0.30, 0.72, n * 0.65 + n2 * 0.45);
    vec3 col = mix(vec3(0.10, 0.025, 0.006), vec3(1.0, 0.35, 0.0), cells);
    col = mix(col, vec3(1.0, 0.62, 0.22), smoothstep(0.70, 0.92, n2));
    vec3 V = normalize(cameraPosition - vPosW);
    float rim = pow(1.0 - clamp(dot(normalize(vNormalW), V), 0.0, 1.0), 3.0);
    col += rim * vec3(1.0, 0.45, 0.12) * 1.1;
    col *= 1.0 + uBoost * 0.3;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function PlasmaSun({
  radius = 1,
  coronaScale = 4.8,
  hovered = false,
  paused = false,
  spin = 0.06,
}: {
  radius?: number;
  coronaScale?: number;
  hovered?: boolean;
  paused?: boolean;
  spin?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Sprite>(null);
  const timeRef = useRef(0);
  const boostRef = useRef(0);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uBoost: { value: 0 } },
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
      }),
    []
  );

  const coronaTexture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const x = c.getContext("2d")!;
    const gradient = x.createRadialGradient(128, 128, 20, 128, 128, 128);
    gradient.addColorStop(0, "rgba(255, 140, 40, 0.85)");
    gradient.addColorStop(0.4, "rgba(255, 89, 0, 0.22)");
    gradient.addColorStop(1, "rgba(255, 89, 0, 0)");
    x.fillStyle = gradient;
    x.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);

  useFrame((state, delta) => {
    boostRef.current += ((hovered ? 1 : 0) - boostRef.current) * 0.08;
    if (!paused) timeRef.current += delta * (1 + boostRef.current * 1.2);
    material.uniforms.uTime.value = timeRef.current;
    material.uniforms.uBoost.value = boostRef.current;
    if (meshRef.current && !paused) meshRef.current.rotation.y = state.clock.elapsedTime * spin;
    if (coronaRef.current) {
      const t = state.clock.elapsedTime;
      const pulse = paused ? 0 : Math.sin(t * 2.1) * 0.03;
      const cs = coronaScale * (1 + pulse + boostRef.current * 0.06);
      coronaRef.current.scale.set(cs, cs, 1);
      const mat = coronaRef.current.material as THREE.SpriteMaterial;
      mat.opacity = 0.5 + (paused ? 0 : Math.sin(t * 1.6) * 0.08) + boostRef.current * 0.15;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} material={material}>
        <sphereGeometry args={[radius, 96, 96]} />
      </mesh>
      {/* renders before other transparent sprites so the halo sits behind them */}
      <sprite ref={coronaRef} renderOrder={-1} scale={[coronaScale, coronaScale, 1]}>
        <spriteMaterial map={coronaTexture} transparent blending={THREE.AdditiveBlending} depthWrite={false} opacity={0.55} />
      </sprite>
    </group>
  );
}
