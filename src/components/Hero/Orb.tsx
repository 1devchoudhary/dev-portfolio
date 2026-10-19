// Pure CSS hero visual: a glowing sphere with two tilted orbits. No WebGL, works on every device.

const steps = ["Ideas", "Code", "Automate", "Deploy", "Scale"];

// A flat ring squashed into an ellipse; the inner layer spins so the dot travels the orbit.
// The dot counter-spins and un-squashes, so it stays round wherever it is on the ellipse.
function Orbit({ size, tilt, reverse, dotAt }: { size: string; tilt: number; reverse?: boolean; dotAt: number }) {
  return (
    <div
      aria-hidden
      className="absolute left-1/2 top-1/2"
      style={{ width: size, height: size, transform: `translate(-50%, -50%) rotate(${tilt}deg) scaleY(0.3)` }}
    >
      <div className="absolute inset-0 rounded-full border-2 border-accent/30" />
      <div className={`absolute inset-0 ${reverse ? "orbit-spin-rev" : "orbit-spin"}`} style={{ rotate: `${dotAt}deg` }}>
        <div className="absolute left-1/2 top-0">
          <div className={reverse ? "orbit-counter-rev" : "orbit-counter"} style={{ rotate: `${-dotAt}deg` }}>
            <span
              className="block h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffb057] shadow-[0_0_14px_4px_rgba(255,138,0,0.7)]"
              style={{ scale: "1 3.333" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Orb() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[300px] sm:max-w-[460px]">
      {/* Outer glow */}
      <div aria-hidden className="orb-breathe absolute inset-[12%] rounded-full bg-accent/40 blur-[70px]" />

      {/* Corona: soft uneven rays that turn very slowly */}
      <div aria-hidden className="sun-corona orbit-spin-slow absolute inset-[14%] rounded-full" />

      {/* Star: glows from within (bright core, darker limb) with a slowly churning surface */}
      <div
        aria-hidden
        className="absolute z-10 inset-[23%] overflow-hidden rounded-full"
        style={{
          background:
            "radial-gradient(circle, #fff6dc 0%, #ffd98a 18%, #ffab45 42%, #ff7a12 66%, #e24c00 84%, #9c2900 100%)",
          boxShadow:
            "0 0 30px 6px rgba(255, 170, 70, 0.55), 0 0 90px 24px rgba(255, 100, 0, 0.35), inset 0 0 36px 8px rgba(150, 30, 0, 0.55)",
        }}
      >
        <div className="sun-plasma-coarse orbit-spin-slow absolute -inset-[20%]" />
        <div className="sun-plasma-fine orbit-spin-rev-slow absolute -inset-[20%]" />
        {/* Limb darkening drawn over the texture so the edge stays deep orange */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, transparent 55%, rgba(120, 25, 0, 0.45) 100%)" }}
        />
      </div>

      <Orbit size="98%" tilt={-18} dotAt={40} />
      <Orbit size="78%" tilt={24} reverse dotAt={200} />

      {/* "{ API }" tag */}
      <div className="absolute left-[2%] top-[4%] card px-3.5 py-2.5 font-mono text-[11px] leading-relaxed backdrop-blur-sm bg-surface/60">
        <span className="text-accent">{"{ API }"}</span>
        <div className="text-body">
          Build
          <br />
          Automate
          <br />
          Scale
        </div>
      </div>

      {/* Pipeline steps */}
      <ol className="hidden sm:flex absolute -right-6 top-1/2 -translate-y-1/2 flex-col gap-3 font-mono text-[11px] text-dim">
        {steps.map((step, i) => (
          <li key={step} className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                i === steps.length - 1 ? "bg-accent shadow-[0_0_8px_2px_rgba(255,89,0,0.6)]" : "bg-dim/60"
              }`}
            />
            <span className={i === steps.length - 1 ? "text-accent" : ""}>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
