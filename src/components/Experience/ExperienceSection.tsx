import { ArrowRight, Briefcase, GraduationCap, Rocket } from "lucide-react";
import { portfolioContent } from "@/data/content";

export default function ExperienceSection() {
  const { journey, next } = portfolioContent;

  return (
    <section id="journey" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="reveal grid gap-6 md:grid-cols-[1fr_auto] md:items-end mb-14">
          <div>
            <p className="eyebrow">My journey</p>
            <h2 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">From first code to production</h2>
          </div>
          <p className="max-w-sm text-body">
            Five years, two cities, and a steady move from writing programs to running them for real clients.
          </p>
        </div>

        <ol className="relative">
          {/* Track, plus an orange fill that grows as the section scrolls by */}
          <span aria-hidden className="absolute left-[11px] sm:left-[167px] top-2 bottom-2 w-px bg-border" />
          <span
            aria-hidden
            className="journey-fill absolute left-[11px] sm:left-[167px] top-2 bottom-2 w-px bg-gradient-to-b from-accent via-accent-2 to-accent"
          />

          {journey.map((step) => {
            const Icon = step.points.length ? Briefcase : GraduationCap;
            const current = "current" in step && step.current;
            return (
              <li key={step.title} className="reveal relative grid sm:grid-cols-[140px_1fr] gap-3 sm:gap-14 pb-10 pl-10 sm:pl-0">
                <div className="sm:text-right sm:pt-5">
                  <p className="font-mono text-sm text-foreground">{step.date}</p>
                  <p className="font-mono text-xs text-dim mt-0.5">{step.place}</p>
                </div>

                {/* Node on the line */}
                <span
                  aria-hidden
                  className={`absolute left-[5px] sm:left-[161px] top-1 sm:top-6 h-[13px] w-[13px] rounded-full border-2 ${
                    current
                      ? "border-accent bg-accent shadow-[0_0_14px_3px_rgba(255,89,0,0.6)]"
                      : "border-accent bg-background"
                  }`}
                />

                <div className={`card card-hover p-6 sm:p-7 ${current ? "border-accent/40" : ""}`}>
                  <div className="flex items-start gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                      <Icon className="w-5 h-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold leading-snug">{step.title}</h3>
                      <p className="text-sm text-body">{step.org}</p>
                    </div>
                    {current && (
                      <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 rounded-full border border-ok/30 bg-ok/10 px-2.5 py-1 text-xs text-ok">
                        <span className="h-1.5 w-1.5 rounded-full bg-ok" /> Current
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-foreground/90 italic">{step.story}</p>

                  {step.points.length > 0 && (
                    <ul className="mt-4 space-y-2.5 text-[15px] text-body">
                      {step.points.map((point) => (
                        <li key={point} className="flex gap-3">
                          <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}

          {/* What's next */}
          <li className="reveal relative grid sm:grid-cols-[140px_1fr] gap-3 sm:gap-14 pl-10 sm:pl-0">
            <div className="sm:text-right sm:pt-5">
              <p className="font-mono text-sm text-accent">Next</p>
            </div>
            <span
              aria-hidden
              className="absolute left-[5px] sm:left-[161px] top-1 sm:top-6 h-[13px] w-[13px] rounded-full border-2 border-dashed border-accent bg-background"
            />
            <div className="rounded-2xl border border-dashed border-accent/40 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-4">
              <Rocket className="w-6 h-6 text-accent shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{next.title}</h3>
                <p className="mt-1 text-body">{next.story}</p>
              </div>
              <a href="#contact" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:gap-2.5 transition-all">
                Let&apos;s talk <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}
