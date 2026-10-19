import HeroSection from "@/components/Hero/HeroSection";
import ExperienceSection from "@/components/Experience/ExperienceSection";
import ProjectsSection from "@/components/Projects/ProjectsSection";
import SkillsSection from "@/components/Skills/SkillsSection";
import ContactSection from "@/components/Contact/ContactSection";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import Reveal from "@/components/UI/Reveal";

export default function Home() {
  return (
    <>
      <Reveal />
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ExperienceSection />
        <ProjectsSection />
        <SkillsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
