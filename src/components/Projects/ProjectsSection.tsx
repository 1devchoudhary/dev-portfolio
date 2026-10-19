import { Lock } from "lucide-react";
import { portfolioContent } from "@/data/content";
import FlowDiagram from "./FlowDiagram";

export default function ProjectsSection() {
  const { projects } = portfolioContent;

  return (
    <section id="projects" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="reveal grid gap-6 md:grid-cols-[1fr_auto] md:items-end mb-14">
          <div>
            <p className="eyebrow">Featured work</p>
            <h2 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">Selected Projects</h2>
          </div>
          <p className="max-w-sm text-body">
            Production systems I built at Quark Consulting — the backend, the integrations and the servers they run on.
            <span className="mt-2 flex items-center gap-1.5 text-sm text-dim">
              <Lock className="w-3.5 h-3.5" /> Client work under NDA, so names and screenshots are withheld.
            </span>
          </p>
        </div>

        <div className="space-y-8">
          {projects.map((project, index) => (
            <article
              key={project.title}
              className={`reveal grid gap-6 items-stretch ${index % 2 === 1 ? "lg:grid-cols-[7fr_5fr]" : "lg:grid-cols-[5fr_7fr]"}`}
            >
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <FlowDiagram steps={project.flow} />
              </div>

              <div className="card card-hover p-6 sm:p-8">
                <h3 className="text-2xl font-bold tracking-tight">{project.title}</h3>
                <p className="mt-2 text-body">{project.summary}</p>

                <dl className="mt-6 space-y-4 text-[15px] leading-relaxed">
                  {[
                    ["Problem", project.problem],
                    ["Solution", project.solution],
                    ["Impact", project.impact],
                  ].map(([label, text]) => (
                    <div key={label} className="grid sm:grid-cols-[88px_1fr] gap-1 sm:gap-4">
                      <dt className="font-mono text-xs uppercase tracking-wider text-accent sm:pt-1">{label}</dt>
                      <dd className="text-body">{text}</dd>
                    </div>
                  ))}
                </dl>

                <ul className="mt-6 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <li key={tag} className="rounded-md border border-accent/30 bg-accent/5 px-2.5 py-1 font-mono text-xs text-accent-2">
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
