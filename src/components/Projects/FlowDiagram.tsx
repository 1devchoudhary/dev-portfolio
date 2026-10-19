// Vertical data-flow pipeline; the dashed connectors drift downward to show direction
export default function FlowDiagram({ steps }: { steps: string[] }) {
  return (
    <div className="card h-full p-6 sm:p-8 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,89,0,0.12),transparent_65%)]">
      <div className="flex items-center justify-between font-mono text-[11px] text-dim">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        </span>
        <span>data flow</span>
      </div>

      <ol className="mt-6 flex flex-col items-center" aria-label="Data flow">
        {steps.map((step, i) => {
          const last = i === steps.length - 1;
          return (
            <li key={step} className="flex flex-col items-center">
              <span
                className={`flex items-center gap-2.5 rounded-lg border px-4 py-2 font-mono text-xs sm:text-[13px] ${
                  last
                    ? "border-accent/60 bg-accent/15 text-foreground shadow-[0_0_24px_-6px_rgba(255,89,0,0.7)]"
                    : "border-border bg-background/60 text-body"
                }`}
              >
                <span className="text-accent">{String(i + 1).padStart(2, "0")}</span>
                {step}
              </span>
              {!last && (
                <svg aria-hidden width="12" height="26" viewBox="0 0 12 26" className="text-accent">
                  <line x1="6" y1="0" x2="6" y2="20" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1.5" strokeDasharray="4 6" className="flow-dash" />
                  <path d="M2 19 L6 25 L10 19" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
