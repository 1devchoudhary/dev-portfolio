import { ArrowRight, Box, CodeXml, Database, FileText, MapPin, Zap } from "lucide-react";
import { portfolioContent } from "@/data/content";
import Orb from "./Orb";

const statIcons = [CodeXml, Box, Database, Zap];

export default function HeroSection() {
  const { firstName, lastName, role, tagline, location, resume } = portfolioContent.hero;
  const { stats } = portfolioContent;

  return (
    <section id="hero" className="relative overflow-hidden pt-28 sm:pt-32 pb-16">
      <div aria-hidden className="absolute inset-0 bg-grid" />
      <div
        aria-hidden
        className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-accent/10 blur-[120px]"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="flex items-center gap-3 text-body">
              Hello, I&apos;m <span className="h-px w-8 bg-accent" />
            </p>
            <h1 className="mt-4 text-5xl sm:text-7xl font-extrabold leading-[1.02] tracking-tight">
              {firstName}
              <br />
              <span className="text-gradient">{lastName}</span>
            </h1>
            <p className="mt-6 text-xl sm:text-2xl font-heading font-semibold">{role}</p>
            <p className="mt-3 text-body text-lg">{tagline}</p>
            <p className="mt-4 flex items-center gap-1.5 text-sm text-dim">
              <MapPin className="w-4 h-4" /> {location}
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#projects"
                className="group inline-flex items-center gap-2 rounded-lg bg-gradient-accent px-6 py-3 font-semibold text-white shadow-[0_8px_30px_-8px_rgba(255,89,0,0.6)] transition-transform hover:-translate-y-0.5"
              >
                View Projects
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href={resume}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-accent/50 px-6 py-3 font-semibold transition-colors hover:border-accent hover:bg-accent/10"
              >
                <FileText className="w-4 h-4" /> Résumé
              </a>
            </div>
          </div>

          <Orb />
        </div>

        {/* Stats strip */}
        <div className="card mt-16 grid grid-cols-2 lg:grid-cols-4 overflow-hidden bg-gradient-to-br from-accent/[0.06] to-transparent border-accent/20">
          {stats.map((stat, i) => {
            const Icon = statIcons[i];
            return (
              <div
                key={stat.label}
                className={`p-6 sm:p-7 ${i % 2 === 1 ? "border-l border-border" : ""} ${
                  i >= 2 ? "border-t lg:border-t-0 border-border" : ""
                } ${i === 2 ? "lg:border-l" : ""}`}
              >
                <Icon className="w-6 h-6 text-accent" strokeWidth={1.75} />
                <p className="mt-4 font-heading text-xl sm:text-2xl font-bold">{stat.value}</p>
                <p className="mt-1 text-sm text-body">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
