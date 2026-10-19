import HeroSection from "@/components/Hero/HeroSection";
import ExperienceSection from "@/components/Experience/ExperienceSection";
import ProjectsSection from "@/components/Projects/ProjectsSection";
import SkillsSection from "@/components/Skills/SkillsSection";
import ContactSection from "@/components/Contact/ContactSection";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import Reveal from "@/components/UI/Reveal";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { getContent } from "@/lib/store";
import { profileJsonLd, serializeJsonLd } from "@/lib/structuredData";

// Rebuilt on demand after every save in /admin; the daily refresh is only a safety net
export const revalidate = 86400;

// Title and social cards follow the name and role edited in /admin
export async function generateMetadata(): Promise<Metadata> {
  const { hero } = (await getContent()).content;
  const name = `${hero.firstName} ${hero.lastName}`;
  const title = `${name} — ${hero.role}`;

  return {
    title: { absolute: title },
    openGraph: {
      type: "profile",
      firstName: hero.firstName,
      lastName: hero.lastName,
      url: SITE.url,
      siteName: name,
      title,
      description: SITE.description,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description: SITE.description, images: ["/og-image.png"] },
  };
}

export default async function Home() {
  const { content, updatedAt } = await getContent();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(profileJsonLd(content, updatedAt)) }}
      />
      <Reveal />
      <Navbar />
      <main className="flex-1">
        <HeroSection hero={content.hero} stats={content.stats} />
        <ExperienceSection journey={content.journey} next={content.next} />
        <ProjectsSection projects={content.projects} />
        <SkillsSection skills={content.skills} />
        <ContactSection socials={content.socials} />
      </main>
      <Footer name={`${content.hero.firstName} ${content.hero.lastName}`} />
    </>
  );
}
