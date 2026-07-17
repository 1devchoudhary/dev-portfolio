"use client";

import { Building2, Code2, LifeBuoy, Stethoscope } from "lucide-react";

type IconType = typeof Code2;

// Pick a motif icon from the project title — an honest visual stand-in, never a
// fake screenshot of confidential client work
function pickIcon(title: string): IconType {
  const t = title.toLowerCase();
  if (t.includes("property") || t.includes("real estate")) return Building2;
  if (t.includes("dental") || t.includes("care") || t.includes("health")) return Stethoscope;
  if (t.includes("support") || t.includes("ticket") || t.includes("resolve") || t.includes("hub"))
    return LifeBuoy;
  return Code2;
}

export default function ProjectVisual({ title, tags }: { title: string; tags: string[] }) {
  const Icon = pickIcon(title);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* warm-to-cool wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 32% 30%, rgba(255,89,0,0.14), transparent 55%), radial-gradient(circle at 78% 82%, rgba(124,58,237,0.13), transparent 55%)",
        }}
      />
      {/* faint dot grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,138,0,0.35) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* orbit rings echoing the hero + journey */}
      <div className="absolute w-52 h-52 md:w-60 md:h-60 rounded-full border border-accent/20 spin-slow" />
      <div className="absolute w-72 h-72 md:w-80 md:h-80 rounded-full border border-nebula/10 spin-slow-rev" />
      <div className="absolute w-52 h-52 md:w-60 md:h-60 spin-slow">
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accent shadow-glow" />
      </div>

      {/* central icon "planet" */}
      <div className="relative z-10 flex flex-col items-center gap-5 px-6">
        <div className="w-24 h-24 rounded-2xl glass grid place-items-center border border-accent/30 shadow-glow-strong">
          <Icon className="w-11 h-11 text-accent" strokeWidth={1.5} />
        </div>
        <div className="flex flex-wrap gap-2 justify-center max-w-[16rem]">
          {tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-[11px] text-secondary bg-background/60 border border-accent/20 px-2.5 py-1 rounded-full font-mono"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
