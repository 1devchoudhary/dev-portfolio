"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { portfolioContent } from "@/data/content";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Skills", href: "#skills" },
    { name: "Journey", href: "#journey" },
    { name: "Projects", href: "#projects" },
    { name: "Contact", href: "#contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Simple intersection logic for active section
      const sections = navLinks.map(link => link.href.substring(1));
      let current = "";
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && window.scrollY >= element.offsetTop - 150) {
          current = section;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 border transition-all duration-300 ${
        scrolled ? "py-4 glass shadow-glow" : "py-6 bg-transparent border-accent/0"
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center max-w-7xl">
        <a href="#" className="text-xl font-heading font-bold tracking-wider hover:text-accent transition-colors">
          DC<span className="text-accent">.</span>
        </a>

        <div className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                activeSection === link.href.substring(1) ? "text-accent" : "text-gray-300"
              }`}
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}
