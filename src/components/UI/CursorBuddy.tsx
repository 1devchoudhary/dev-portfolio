"use client";

import { useEffect, useRef, useState } from "react";

type BuddyState = "following" | "bored" | "sleeping";

const QUIPS = [
  "beep boop ⚡",
  "hi, I'm Sparky!",
  "nice cursor moves",
  "have you seen the projects?",
  "the core... it calls to me",
  "*recalibrating vibes*",
  "click something!",
];

// Trails farther behind the pointer than the custom cursor ring so the two
// never read as one blob
const OFFSET = { x: 48, y: 56 };

export default function CursorBuddy() {
  const [enabled, setEnabled] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
  const pupilsRef = useRef<SVGGElement>(null);
  const quipRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  // Desktop pointers only, and never for reduced-motion users
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (fine && !reduced) setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    const sprite = spriteRef.current;
    const pupils = pupilsRef.current;
    const quip = quipRef.current;
    const particles = particlesRef.current;
    if (!root || !sprite || !pupils || !quip || !particles) return;

    let px = window.innerWidth * 0.7;
    let py = window.innerHeight * 0.4;
    let vx = 0, vy = 0;
    let mx = px, my = py;
    let dir = 1;
    let state: BuddyState = "following";
    let lastMove = performance.now();
    let prev = performance.now();
    let lookX = 0, lookY = 0, lookUntil = 0;
    let raf = 0;
    let quipTimer = 0, actTimer = 0, blinkTimer = 0, mouthTimer = 0;

    const setState = (next: BuddyState) => {
      if (state === next) return;
      state = next;
      root.classList.toggle("sparky-sleep", next === "sleeping");
    };

    const say = (text: string, ms = 1900) => {
      quip.textContent = text;
      root.classList.add("sparky-talking");
      window.clearTimeout(quipTimer);
      quipTimer = window.setTimeout(() => root.classList.remove("sparky-talking"), ms);
    };

    const particle = (cls: string, text: string, x: number, y: number) => {
      const s = document.createElement("span");
      s.className = cls;
      s.textContent = text;
      s.style.left = `${x}px`;
      s.style.top = `${y}px`;
      s.style.setProperty("--dx", `${Math.random() * 60 - 30}px`);
      s.style.setProperty("--dy", `${-30 - Math.random() * 40}px`);
      particles.appendChild(s);
      window.setTimeout(() => s.remove(), 2000);
    };

    const burst = (n: number) => {
      for (let i = 0; i < n; i++) {
        particle("sparky-particle", "✦", px + Math.random() * 30 - 15, py - 10 - Math.random() * 20);
      }
    };

    const doAct = (name: string) => {
      root.classList.add("sparky-act");
      window.clearTimeout(mouthTimer);
      mouthTimer = window.setTimeout(() => root.classList.remove("sparky-act"), 900);
      if (name === "spin" || name === "wiggle") {
        sprite.classList.remove("sparky-spin", "sparky-wiggle");
        void sprite.offsetWidth; // restart the CSS animation
        sprite.classList.add(`sparky-${name}`);
      } else if (name === "sparkle") burst(7);
      else if (name === "quip") say(QUIPS[Math.floor(Math.random() * QUIPS.length)]);
      else if (name === "hop") {
        vy -= 480;
        burst(4);
      }
    };

    // Random personality acts while awake
    const scheduleAct = () => {
      actTimer = window.setTimeout(() => {
        if (state !== "sleeping") {
          doAct(["spin", "wiggle", "sparkle", "quip"][Math.floor(Math.random() * 4)]);
        }
        scheduleAct();
      }, 9000 + Math.random() * 7000);
    };
    scheduleAct();

    const scheduleBlink = () => {
      blinkTimer = window.setTimeout(() => {
        if (state !== "sleeping") {
          root.classList.add("sparky-blink");
          window.setTimeout(() => root.classList.remove("sparky-blink"), 110);
        }
        scheduleBlink();
      }, 2600 + Math.random() * 2800);
    };
    scheduleBlink();

    const zzz = window.setInterval(() => {
      if (state === "sleeping") particle("sparky-particle sparky-zee", "z", px + 20, py - 34);
    }, 900);

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (state === "sleeping") {
        say("oh! hi.", 1200);
        burst(3);
      }
      lastMove = performance.now();
    };

    const onDown = () => {
      lastMove = performance.now();
      doAct("hop");
    };

    // Same "interactive element" definition as the custom cursor
    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const hit = target.closest("a, button") || target.classList.contains("interactive");
      root.classList.toggle("sparky-excited", !!hit && state !== "sleeping");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("mouseover", onOver);

    const frame = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.033);
      prev = now;
      const idleFor = (now - lastMove) / 1000;

      if (idleFor > 14) setState("sleeping");
      else if (idleFor > 5) setState("bored");
      else setState("following");

      if (state !== "sleeping") {
        const tx = Math.min(Math.max(mx + OFFSET.x, 34), window.innerWidth - 34);
        const ty = Math.min(Math.max(my + OFFSET.y, 44), window.innerHeight - 30);
        const k = 90, damp = 12;
        vx += ((tx - px) * k - vx * damp) * dt;
        vy += ((ty - py) * k - vy * damp) * dt;
        px += vx * dt;
        py += vy * dt;
      }

      if (Math.abs(vx) > 50) dir = vx < 0 ? -1 : 1;
      const tilt = Math.max(-16, Math.min(16, vx * 0.025)) * dir;
      const bob = state === "sleeping" ? 0 : Math.sin(now / 480) * 3;
      root.style.transform = `translate3d(${px}px, ${py + bob}px, 0)`;
      if (!sprite.classList.contains("sparky-spin") && !sprite.classList.contains("sparky-wiggle")) {
        sprite.style.transform = `scaleX(${dir}) rotate(${tilt}deg)`;
      }

      // Eyes: track motion while following, wander while bored
      if (state === "bored" && now > lookUntil) {
        lookX = Math.random() * 4 - 2;
        lookY = Math.random() * 3 - 1.5;
        lookUntil = now + 900 + Math.random() * 900;
      } else if (state === "following") {
        lookX = Math.max(-2, Math.min(2, vx * 0.004)) * dir;
        lookY = Math.max(-1.5, Math.min(1.5, vy * 0.004));
      }
      pupils.style.transform = `translate(${lookX}px, ${lookY}px)`;

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onActEnd = () => sprite.classList.remove("sparky-spin", "sparky-wiggle");
    sprite.addEventListener("animationend", onActEnd);

    const hello = window.setTimeout(() => say("hey, I'm Sparky ⚡"), 1200);

    return () => {
      cancelAnimationFrame(raf);
      [quipTimer, actTimer, blinkTimer, mouthTimer, hello].forEach(window.clearTimeout);
      window.clearInterval(zzz);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("mouseover", onOver);
      sprite.removeEventListener("animationend", onActEnd);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={particlesRef} aria-hidden className="fixed inset-0 pointer-events-none z-[9989]" />
      <div ref={rootRef} aria-hidden className="sparky fixed top-0 left-0 pointer-events-none z-[9990]">
        <div ref={quipRef} className="sparky-quip" />
        <div ref={spriteRef} className="sparky-sprite">
          <svg width="56" height="66" viewBox="0 0 56 66">
            <defs>
              <filter id="sparky-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="2.1" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="sparky-thrust" cx="50%" cy="25%" r="75%">
                <stop offset="0%" stopColor="rgba(255,138,0,0.85)" />
                <stop offset="100%" stopColor="rgba(255,89,0,0)" />
              </radialGradient>
            </defs>
            <ellipse className="sparky-thruster" cx="28" cy="59" rx="11" ry="5.5" fill="url(#sparky-thrust)" />
            <line x1="28" y1="11" x2="28" y2="4" stroke="#3f3f46" strokeWidth="2" />
            <circle cx="28" cy="3.4" r="2.7" fill="#ff8a00" filter="url(#sparky-glow)" />
            <rect x="8" y="11" width="40" height="38" rx="13" fill="#18181b" stroke="rgba(255,89,0,0.55)" strokeWidth="1.5" />
            <rect x="13" y="18" width="30" height="18" rx="9" fill="#0c0c0e" />
            <g filter="url(#sparky-glow)">
              <g ref={pupilsRef}>
                <rect className="sparky-eye" x="19" y="23" width="6" height="8" rx="3" fill="#ff8a00" />
                <rect className="sparky-eye" x="31" y="23" width="6" height="8" rx="3" fill="#ff8a00" />
              </g>
            </g>
            <path
              className="sparky-mouth"
              d="M24 42 q4 3.4 8 0"
              stroke="#ff8a00"
              strokeWidth="1.7"
              fill="none"
              strokeLinecap="round"
              opacity="0"
            />
            <rect x="3" y="25" width="5" height="12" rx="2.5" fill="#141417" stroke="rgba(255,89,0,0.35)" strokeWidth="1" />
            <rect x="48" y="25" width="5" height="12" rx="2.5" fill="#141417" stroke="rgba(255,89,0,0.35)" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </>
  );
}
