// Central site config. After deploying, set NEXT_PUBLIC_SITE_URL in Vercel to
// your real domain (or update the fallback below) so canonical URLs, the
// sitemap, and social previews point at the live site.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://devendra-choudhary.vercel.app";

export const SITE = {
  name: "Devendra Choudhary",
  title: "Devendra Choudhary — Backend-focused Full Stack Developer",
  description:
    "Backend-focused Full Stack Developer from Indore with 1.5+ years building and deploying Node.js/Express applications on MySQL and MongoDB — REST APIs, secure auth, integrations and automation.",
  url: SITE_URL,
};
