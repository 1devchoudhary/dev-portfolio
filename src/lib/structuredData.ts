import type { SiteContent } from "./schema";
import { SITE_URL } from "./site";

/** schema.org ProfilePage + Person, built from the live content so admin edits flow into search results. */
export function profileJsonLd(content: SiteContent, updatedAt: Date | null) {
  const { hero, journey, skills, socials } = content;
  const current = journey.find((step) => step.current);
  const education = journey.filter((step) => /bachelor|master|\b(BCA|MCA|B\.?Tech|M\.?Tech)\b/i.test(step.title));

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: SITE_URL,
    ...(updatedAt && { dateModified: updatedAt.toISOString() }),
    mainEntity: {
      "@type": "Person",
      name: `${hero.firstName} ${hero.lastName}`,
      url: SITE_URL,
      image: `${SITE_URL}/og-image.png`,
      jobTitle: hero.role,
      description: hero.tagline,
      email: `mailto:${socials.email}`,
      address: { "@type": "PostalAddress", addressLocality: hero.location.split("·")[0].trim() },
      ...(current && { worksFor: { "@type": "Organization", name: current.org.split(",")[0].trim() } }),
      ...(education.length && {
        alumniOf: education.map((step) => ({
          "@type": "CollegeOrUniversity",
          name: step.org.split("·")[0].trim(),
        })),
      }),
      knowsAbout: skills.flatMap((group) => group.items),
      sameAs: [socials.github, socials.linkedin],
    },
  };
}

/** JSON.stringify does not escape "<", so a stray "</script>" in content can't break out of the tag. */
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
