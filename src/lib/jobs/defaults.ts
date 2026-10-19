import type { JobSettings } from "@/lib/schema";

const g = (weight: number, ...terms: string[]) => ({ terms, weight });

/** Starting rules; everything here is editable from /admin/jobs → Settings. */
export const defaultJobSettings: JobSettings = {
  positive: [
    g(20, "node", "node.js", "nodejs"),
    g(12, "express", "express.js", "expressjs"),
    // MERN means Node + Express + MongoDB + React, and alert emails often show only the title
    g(25, "mern", "mean stack"),
    g(10, "junior", "jr", "associate", "entry level", "sde-1", "sde 1", "sde1", "sde-i", "sde i", "engineer - i", "engineer i", "developer i"),
    g(10, "backend", "back end", "back-end"),
    g(8, "mysql"),
    g(8, "mongodb", "mongo"),
    g(6, "rest api", "rest apis", "restful"),
    g(5, "full stack", "fullstack", "full-stack"),
    g(5, "react", "react.js", "reactjs"),
    g(4, "javascript"),
    g(3, "jwt"),
    g(3, "api integration", "integrations"),
    g(3, "typescript"),
  ],
  negative: [
    g(15, "java", "spring", "spring boot", "springboot"),
    g(20, "php", "laravel", "codeigniter"),
    g(20, ".net", "dotnet", "asp.net", "c#"),
    g(10, "python", "django", "flask", "fastapi"),
    g(20, "wordpress", "shopify"),
    g(15, "ruby", "rails"),
    g(10, "flutter", "android", "ios", "react native", "kotlin", "swift"),
    g(5, "angular"),
    g(8, "golang"),
  ],
  excludeTitle: [
    "senior", "sr", "lead", "staff", "principal", "architect", "manager", "director", "head",
    "intern", "internship", "trainer", "faculty", "professor", "teaching", "qa", "tester",
    "frontend", "front end", "front-end", "ui", "designer",
  ],
  locations: [
    "remote", "pune", "bengaluru", "bangalore", "hyderabad", "indore", "india",
    "mumbai", "gurgaon", "gurugram", "noida", "chennai", "ahmedabad",
  ],
  maxMinYears: 2,
  minScore: 30,
  companies: [],
  apis: { remotive: true, remoteok: true },
  templates: {
    linkedinNote:
      "Hi {name}, I just applied for the {role} role at {company}. I'm a Node.js backend developer (1.5+ yrs) and I've built 6 production apps with Express, MySQL and MongoDB. I'd love to be considered. Happy to share details!",
    emailSubject: "Application: {role} | Node.js Backend Developer | 15-day notice",
    emailBody:
      "Hi {name},\n\nI applied for the {role} role on {platform} and wanted to reach out directly. I'm a backend-focused developer with 1.5+ years of experience in Node.js/Express, MySQL and MongoDB. At Quark Consulting I built and delivered 6 client applications, including a Xero accounting automation that cut statement work from 15-20 minutes to one click.\n\nMy resume is attached. I can join within 15 days. I'd be glad to talk if my profile fits.\n\nThanks,\nDevendra Choudhary\n+91 9575590189 | linkedin.com/in/devendra-choudhary-2a538a1b3",
    followUp:
      "Hi {name}, just following up on my application for {role} at {company}. I'm still very interested and happy to do a quick call or technical round anytime. Thanks!",
  },
};
