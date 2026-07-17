"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { portfolioContent } from "@/data/content";

const OrbitScene = dynamic(() => import("./OrbitScene"), { ssr: false, loading: () => null });

// oldest first, so scrolling moves forward through time
const JOURNEY = [...portfolioContent.journey].reverse();

export default function JourneySection() {
  // The 3D orbit needs a desktop-class device, WebGL, and full motion;
  // everyone else gets the lightweight timeline
  const [show3D, setShow3D] = useState(false);
  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const wideEnough = window.innerWidth >= 768;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const probe = document.createElement("canvas");
    const hasWebGL = !!(probe.getContext("webgl2") || probe.getContext("webgl"));
    setShow3D(finePointer && wideEnough && hasWebGL && !reduced);
  }, []);

  return show3D ? <OrbitJourney /> : <SimpleJourney />;
}

function OrbitJourney() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });
  const [idx, setIdx] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setIdx(Math.max(0, Math.min(JOURNEY.length - 1, Math.round(v * (JOURNEY.length - 1)))));
  });
  const item = JOURNEY[idx];

  return (
    <section id="journey" ref={wrapRef} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <OrbitScene progress={scrollYProgress} />

        <div className="absolute top-24 left-6 md:left-16 z-10 pointer-events-none">
          <h2 className="text-4xl font-heading font-bold">
            My <span className="text-gradient-accent">Journey</span>
          </h2>
          <p className="text-gray-400 mt-2 text-sm max-w-xs">
            Scroll — each milestone docks into orbit.
          </p>
        </div>

        <div className="absolute left-6 md:left-16 top-1/2 -translate-y-1/2 z-10 w-[min(400px,84vw)]">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="glass rounded-3xl p-8 border border-accent/25 shadow-glow"
          >
            <span className="text-accent font-mono text-4xl font-bold block mb-3">{item.year}</span>
            <h3 className="text-2xl font-heading font-bold text-white mb-1">{item.title}</h3>
            <h4 className="text-secondary text-sm mb-4">{item.company}</h4>
            <p className="text-gray-400 leading-relaxed text-sm">{item.description}</p>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
          {JOURNEY.map((j, i) => (
            <span
              key={j.id}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === idx ? "bg-accent shadow-glow scale-125" : "bg-white/15"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Vertical timeline for mobile, reduced-motion, and no-WebGL visitors
function SimpleJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="journey" className="py-24 relative" ref={containerRef}>
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl font-heading font-bold mb-4">
            My <span className="text-gradient-accent">Journey</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            The path I&apos;ve taken so far, learning and growing along the way.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-white/5">
            <motion.div className="w-full bg-accent shadow-glow" style={{ height: lineHeight }} />
          </div>

          <div className="flex flex-col space-y-16">
            {portfolioContent.journey.map((item) => (
              <div key={item.id} className="relative pl-12">
                <div className="absolute left-[11px] top-6 w-3 h-3 rounded-full bg-background border-2 border-accent -translate-x-1/2 shadow-glow" />
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6 }}
                  className="glass p-6 rounded-2xl hover:glass-hover transition-all duration-300"
                >
                  <span className="text-accent font-mono text-sm tracking-widest font-bold block mb-2">
                    {item.year}
                  </span>
                  <h3 className="text-2xl font-heading font-bold mb-1 text-white">{item.title}</h3>
                  <h4 className="text-gray-400 mb-4">{item.company}</h4>
                  <p className="text-gray-500 leading-relaxed text-sm">{item.description}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
