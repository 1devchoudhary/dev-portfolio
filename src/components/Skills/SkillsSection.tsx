"use client";

import { motion } from "motion/react";
import { portfolioContent } from "@/data/content";

export default function SkillsSection() {
  const { skills } = portfolioContent;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="skills" className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-heading font-bold mb-4">Technical <span className="text-gradient-accent">Arsenal</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A comprehensive list of technologies I use to build scalable, high-performance applications.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {skills.map((skillGroup, groupIdx) => (
            <motion.div
              key={skillGroup.category}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="glass p-8 rounded-2xl flex flex-col items-center hover:glass-hover transition-all duration-300"
            >
              <h3 className="text-xl font-heading font-bold mb-6 text-white">{skillGroup.category}</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {skillGroup.items.map((item, itemIdx) => (
                  <motion.span
                    key={item}
                    variants={itemVariants}
                    className="px-4 py-2 bg-background border border-accent/20 rounded-full text-sm text-gray-300 shadow-[0_0_10px_rgba(255,89,0,0.05)] hover:border-accent hover:text-accent hover:shadow-[0_0_15px_rgba(255,89,0,0.2)] transition-all cursor-default"
                  >
                    {item}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
