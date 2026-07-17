"use client";

import { motion } from "motion/react";
import { ExternalLink } from "lucide-react";
import { portfolioContent } from "@/data/content";
import ProjectVisual from "./ProjectVisual";

export default function ProjectsSection() {
  const { projects } = portfolioContent;

  return (
    <section id="projects" className="py-24 relative">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-4xl font-heading font-bold mb-4">Selected <span className="text-gradient-accent">Projects</span></h2>
          <p className="text-gray-400 max-w-2xl">
            A showcase of recent work focusing on performance, design, and complex problem solving.
          </p>
        </motion.div>

        <div className="space-y-24">
          {projects.map((project, index) => {
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} gap-8 lg:gap-16 items-center group`}
              >
                {/* Branded visual (no confidential screenshots needed) */}
                <div className="w-full lg:w-1/2">
                  <div className="relative aspect-video rounded-2xl overflow-hidden glass group-hover:glass-hover transition-all duration-500 transform group-hover:-translate-y-2">
                    <ProjectVisual title={project.title} tags={project.tags} />
                  </div>
                </div>

                {/* Content */}
                <div className="w-full lg:w-1/2 flex flex-col space-y-6">
                  <div>
                    <h3 className="text-3xl font-heading font-bold mb-2 group-hover:text-accent transition-colors">{project.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.tags.map((tag) => (
                        <span key={tag} className="text-xs text-accent bg-accent/10 px-3 py-1 rounded-full font-mono">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="glass p-6 rounded-xl space-y-4 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/20 rounded-l-xl" />
                    <div>
                      <h4 className="text-white font-medium mb-1 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2" /> Problem
                      </h4>
                      <p className="text-sm text-gray-400">{project.problem}</p>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mr-2" /> Solution
                      </h4>
                      <p className="text-sm text-gray-400">{project.solution}</p>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" /> Impact
                      </h4>
                      <p className="text-sm text-gray-400">{project.impact}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    {project.liveLink && (
                    <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-medium text-white hover:text-accent transition-colors">
                      <ExternalLink className="w-4 h-4 mr-2" /> Live Demo
                    </a>
                    )}
                    {project.githubLink && (
                    <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> View Source
                    </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
