"use client";

import { motion } from "motion/react";
import { Download, MapPin } from "lucide-react";
import { portfolioContent } from "@/data/content";

const RESUME_URL = "/Devendra_Choudhary_Resume.pdf";

export default function AboutSection() {
  const { bio, stats } = portfolioContent.about;
  const { name, role } = portfolioContent.hero;

  return (
    <section id="about" className="py-24 relative">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Identity card (stands in for a photo — brand mark, name, CV) */}
          <div className="relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden glass group flex flex-col items-center justify-center gap-6 p-8 text-center">
            {/* warm-to-cool wash + orbit rings */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 30% 25%, rgba(255,89,0,0.14), transparent 55%), radial-gradient(circle at 80% 85%, rgba(124,58,237,0.14), transparent 55%)",
              }}
            />
            <div className="absolute w-64 h-64 rounded-full border border-accent/15 spin-slow" />
            <div className="absolute w-80 h-80 rounded-full border border-nebula/10 spin-slow-rev" />

            <div className="relative z-10 w-28 h-28 rounded-full glass border border-accent/30 shadow-glow-strong grid place-items-center">
              <span className="text-5xl font-heading font-bold text-gradient-accent">DC</span>
            </div>

            <div className="relative z-10">
              <p className="text-2xl font-heading font-bold text-white">{name}</p>
              <p className="text-secondary text-sm mt-1">{role}</p>
              <p className="text-gray-500 text-xs flex items-center justify-center gap-1.5 mt-2">
                <MapPin className="w-3.5 h-3.5" /> Indore, India
              </p>
            </div>

            <a
              href={RESUME_URL}
              download
              className="relative z-10 inline-flex items-center gap-2 bg-accent text-white text-sm font-medium px-6 py-3 rounded-full shadow-glow hover:bg-secondary transition-colors interactive"
            >
              <Download className="w-4 h-4" /> Download CV
            </a>

            {/* Corner Glowing Accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-accent rounded-tl-2xl opacity-50" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-accent rounded-br-2xl opacity-50" />
          </div>

          <div className="flex flex-col space-y-8">
            <div>
              <h2 className="text-4xl font-heading font-bold mb-6">
                About <span className="text-gradient-accent">Me</span>
              </h2>
              <p className="text-gray-400 leading-relaxed text-lg">
                {bio}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="glass p-4 rounded-xl text-center hover:glass-hover transition-all duration-300">
                  <h3 className="text-3xl font-heading font-bold text-accent mb-1">{stat.value}</h3>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
