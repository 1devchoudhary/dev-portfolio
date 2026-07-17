"use client";

// Slow-drifting nebula glows behind every section. Gradients fade to fully
// transparent (no CSS blur filters), so this layer costs almost nothing.
export default function AmbientGlow() {
  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none overflow-hidden">
      <div
        className="nebula-drift-a absolute rounded-full"
        style={{
          width: "58vw",
          height: "58vw",
          top: "6%",
          right: "-16%",
          background: "radial-gradient(circle, rgba(124, 58, 237, 0.13), transparent 62%)",
        }}
      />
      <div
        className="nebula-drift-b absolute rounded-full"
        style={{
          width: "48vw",
          height: "48vw",
          bottom: "-12%",
          left: "-14%",
          background: "radial-gradient(circle, rgba(91, 33, 182, 0.11), transparent 62%)",
        }}
      />
      <div
        className="nebula-drift-b absolute rounded-full"
        style={{
          width: "34vw",
          height: "34vw",
          top: "44%",
          left: "30%",
          background: "radial-gradient(circle, rgba(255, 89, 0, 0.05), transparent 60%)",
        }}
      />
    </div>
  );
}
