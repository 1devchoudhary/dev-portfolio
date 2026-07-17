"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { portfolioContent } from "@/data/content";
import MagneticButton from "../UI/MagneticButton";

// Dynamically load the 3D scene so it doesn't block hydration or text rendering
const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => <StaticGlow />,
});

// Shown while the 3D chunk loads, and permanently on touch/small/no-WebGL devices
function StaticGlow() {
  return (
    <div aria-hidden className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-52 h-52 md:w-72 md:h-72">
        <div className="absolute inset-0 rounded-full bg-accent/30 blur-3xl motion-safe:animate-pulse" />
        <div className="absolute inset-4 rounded-full border border-accent/40 bg-[#121215] shadow-glow-strong" />
        <div className="absolute inset-0 rounded-full border border-accent/15" />
      </div>
    </div>
  );
}

export default function HeroSection() {
  const { name, role, tagline } = portfolioContent.hero;
  const sectionRef = useRef<HTMLElement>(null);

  // Only fetch and mount the 3D scene on desktop-class devices with WebGL;
  // everyone else keeps the lightweight static visual
  const [show3D, setShow3D] = useState(false);
  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const wideEnough = window.innerWidth >= 768;
    const probe = document.createElement("canvas");
    const hasWebGL = !!(probe.getContext("webgl2") || probe.getContext("webgl"));
    setShow3D(finePointer && wideEnough && hasWebGL);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative w-full h-screen min-h-[600px] flex items-center"
    >
      {/* Full-bleed 3D backdrop: spans the whole hero so the canvas has no visible
          edges; pointer events are routed from the section element instead */}
      {show3D && (
        <div className="absolute inset-0 pointer-events-none">
          <Scene eventSource={sectionRef} />
        </div>
      )}

      <div className="container mx-auto px-6 max-w-7xl grid md:grid-cols-2 gap-8 items-center z-10">
        
        <div className="flex flex-col items-start space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-accent font-medium tracking-widest uppercase mb-2">Hello, I am</h2>
            <h1 className="text-5xl md:text-7xl font-heading font-bold leading-tight mb-2">
              {name}
            </h1>
            <h3 className="text-2xl md:text-3xl text-gray-400 font-heading">
              {role}
            </h3>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-gray-400 max-w-md leading-relaxed"
          >
            {tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <MagneticButton href="#projects" variant="primary">
              View Projects
            </MagneticButton>
            <MagneticButton href="#contact" variant="outline">
              Contact Me
            </MagneticButton>
          </motion.div>
        </div>

        <div className="relative w-full h-[300px] md:h-[600px]">
          {!show3D && <StaticGlow />}
        </div>
      </div>
    </section>
  );
}
