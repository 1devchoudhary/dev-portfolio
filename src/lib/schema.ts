import { z } from "zod";

// Caps keep a bad (or hostile) save from bloating the page or the database
const text = (max: number) => z.string().trim().max(max);
const list = <T extends z.ZodTypeAny>(item: T, max: number) => z.array(item).max(max);
const link = z
  .string()
  .trim()
  .max(300)
  .regex(/^https?:\/\//, "Must start with http:// or https://");

export const siteContentSchema = z.object({
  hero: z.object({
    firstName: text(40).min(1),
    lastName: text(40).min(1),
    role: text(80).min(1),
    tagline: text(200),
    location: text(80),
  }),
  stats: list(z.object({ value: text(30).min(1), label: text(60) }), 6),
  journey: list(
    z.object({
      date: text(40).min(1),
      place: text(40),
      title: text(120).min(1),
      org: text(120),
      story: text(300),
      points: list(text(400).min(1), 10),
      current: z.boolean().optional(),
    }),
    15
  ),
  next: z.object({ title: text(80), story: text(300) }),
  projects: list(
    z.object({
      title: text(100).min(1),
      summary: text(200),
      flow: list(text(40).min(1), 8),
      problem: text(600),
      solution: text(800),
      impact: text(600),
      tags: list(text(30).min(1), 12),
    }),
    12
  ),
  skills: list(z.object({ category: text(50).min(1), items: list(text(40).min(1), 30) }), 10),
  socials: z.object({
    github: link,
    linkedin: link,
    email: z.email().max(120),
  }),
});

export type SiteContent = z.infer<typeof siteContentSchema>;
