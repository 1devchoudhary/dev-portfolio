import HeroSection from "@/components/Hero/HeroSection";
import AboutSection from "@/components/About/AboutSection";
import SkillsSection from "@/components/Skills/SkillsSection";
import JourneySection from "@/components/Journey/JourneySection";
import ProjectsSection from "@/components/Projects/ProjectsSection";
import ContactSection from "@/components/Contact/ContactSection";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import CustomCursor from "@/components/UI/CustomCursor";
import CursorBuddy from "@/components/UI/CursorBuddy";
import LoadingScreen from "@/components/UI/LoadingScreen";
import SmoothScroll from "@/components/UI/SmoothScroll";
import AmbientGlow from "@/components/UI/AmbientGlow";

export default function Home() {
  return (
    <main className="relative bg-background min-h-screen text-foreground selection:bg-accent selection:text-white">
      <LoadingScreen />
      <SmoothScroll />
      <AmbientGlow />
      <CustomCursor />
      <CursorBuddy />
      <Navbar />
      
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <JourneySection />
      <ProjectsSection />
      <ContactSection />
      
      <Footer />
    </main>
  );
}
