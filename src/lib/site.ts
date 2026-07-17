// Central site config. After deploying, set NEXT_PUBLIC_SITE_URL in Vercel to
// your real domain (or update the fallback below) so canonical URLs, the
// sitemap, and social previews point at the live site.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://devendra-choudhary.vercel.app";

export const SITE = {
  name: "Devendra Choudhary",
  title: "Devendra Choudhary — Full Stack MERN Developer",
  description:
    "Full Stack MERN developer from Indore building secure, scalable web apps with React, Node.js, Express, and MongoDB — REST APIs, JWT auth, and interfaces that feel fast.",
  url: SITE_URL,
};
