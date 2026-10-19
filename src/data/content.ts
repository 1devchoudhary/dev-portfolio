import type { SiteContent } from "@/lib/schema";

// Fallback content: used until the first save from /admin, or whenever the database is unreachable
export const defaultContent: SiteContent = {
  hero: {
    firstName: "Devendra",
    lastName: "Choudhary",
    role: "Backend-focused Full Stack Developer",
    tagline: "I build APIs, automations and the servers they run on.",
    location: "Indore, MP · Open to relocation",
  },
  stats: [
    { value: "1.5+ years", label: "building with Node.js & Express" },
    { value: "6", label: "client apps shipped" },
    { value: "10+", label: "production migrations" },
    { value: "15 min → 1 click", label: "Xero statement automation" },
  ],
  journey: [
    {
      date: "2020",
      place: "Ujjain",
      title: "BCA — Bachelor of Computer Applications",
      org: "Vikram University · 75.5%",
      story: "Where I wrote my first programs and got hooked on making things work.",
      points: [],
    },
    {
      date: "2023",
      place: "Indore",
      title: "MCA — Master of Computer Applications",
      org: "MediCaps University · CGPA 7.58",
      story: "Moved to Indore and started building full-stack projects alongside the coursework.",
      points: [],
    },
    {
      date: "Jan 2025",
      place: "First job",
      title: "Full Stack Web Developer Intern",
      org: "Shanti Infosoft LLP, Indore",
      story: "My first team, first code reviews, and first app with real users.",
      points: [
        "Built ResolveHub, a MERN ticketing system: users raise and track tickets; admins assign, prioritise and update status through JWT-protected admin routes.",
        "Tested REST APIs with Postman and built responsive React + Tailwind CSS dashboards for users and admins.",
      ],
    },
    {
      date: "Jul 2025 — Present",
      place: "Production",
      title: "Full Stack Developer",
      org: "Quark Consulting, Indore",
      story: "Now I own client systems end to end — from database schema to the server they run on.",
      current: true,
      points: [
        "Built and delivered 6 client applications end to end (property, workforce, marketing analytics, health-tech): Node.js/Express REST APIs, MySQL and MongoDB schemas, React front-ends.",
        "Migrated 10+ production websites with near-zero downtime: Nginx, PM2, SSL, database backup & restore and DNS cutover.",
        "Deployed 6–7 of my own applications and several teammates' projects to Linux VPS servers with Nginx reverse proxy, PM2 and SSL.",
        "Built n8n automations: a lead pipeline (Facebook group → Google Sheets → CRM) and a Vapi AI voice assistant that answers calls for a salon.",
      ],
    },
  ],
  next: {
    title: "Next chapter",
    story: "Looking for a backend-focused role where I can own APIs, data and deployments. Open to relocation.",
  },
  projects: [
    {
      title: "Property Management Platform",
      summary: "Rent, accounting and landlord statements for a property manager — live in production.",
      flow: ["Cron · 30 min", "Xero invoice", "Payment", "Fee / landlord split", "Landlord bill"],
      problem: "Rent invoicing, payment matching and landlord statements were manual work in Xero, taking 15–20 minutes per statement.",
      solution:
        "Automated the rent cycle with Xero over OAuth2 — invoices every 30 minutes, payments read back and split, landlord bills after admin approval — plus a daily bank-transaction import with auto-matching and a review queue.",
      impact: "Statements went from 15–20 minutes of manual work to one click, with 8 scheduled cron jobs guarded against overlap.",
      tags: ["Node.js", "Express", "MySQL", "Xero API", "React"],
    },
    {
      title: "Workforce Management SaaS",
      summary: "Rostering, timesheets, clock-in and leave for employers — live, rollout in progress.",
      flow: ["Login", "JWT 15 min", "Rotating refresh", "RBAC · 5 roles", "Rosters & timesheets"],
      problem: "The employer was paying for a commercial tool to manage rosters, timesheets and leave.",
      solution:
        "Built the replacement with secure auth: 15-minute JWT access tokens and rotating refresh tokens in httpOnly cookies, 5-level role-based access through Express middleware, and login rate limiting.",
      impact: "Reusing an old refresh token revokes every session, so a stolen token can't quietly stay valid.",
      tags: ["Node.js", "Express", "MySQL", "React"],
    },
    {
      title: "Marketing Analytics Dashboard",
      summary: "One dashboard over 8 marketing and CRM APIs.",
      flow: ["8 APIs", "Parallel requests", "Failure isolation", "30-min cache", "Dashboard"],
      problem: "Marketing data lived in Google Analytics, Google Ads, LinkedIn, Mailchimp, Meta, Asana and more — each in its own tab.",
      solution: "Combined 8 marketing and CRM APIs into one dashboard with parallel requests, per-API failure isolation and a 30-minute cache.",
      impact: "One slow or failing API no longer breaks the whole view, and repeat loads come from cache.",
      tags: ["Node.js", "Express", "React"],
    },
    {
      title: "AI Dental Screening App",
      summary: "Patients upload photos and receive an AI screening report.",
      flow: ["5 photos", "Multer upload", "n8n AI workflow", "Screening report"],
      problem: "Dental screening needed a simple way to collect photos and turn them into a report without manual handling.",
      solution: "A 5-photo upload with Multer feeding an n8n AI workflow that returns a per-view screening report; email-OTP signup with a MongoDB TTL index and JWT refresh-token login.",
      impact: "Upload to report runs end to end through automation, behind OTP-verified accounts.",
      tags: ["Node.js", "Express", "MongoDB", "React", "n8n"],
    },
  ],
  skills: [
    {
      category: "Backend",
      items: ["JavaScript (ES6+)", "Node.js", "Express.js", "REST APIs", "JWT", "OAuth2", "Role-based access", "Multer", "node-cron"],
    },
    { category: "Databases", items: ["MySQL", "SQL", "MongoDB (Mongoose)"] },
    {
      category: "Integrations & Automation",
      items: ["Xero API", "Google APIs", "Mailchimp", "n8n", "Vapi", "Webhooks"],
    },
    { category: "DevOps", items: ["Linux VPS", "Nginx", "PM2", "Docker (basic)", "SSL", "DNS"] },
    {
      category: "Frontend & Tools",
      items: ["React.js", "Tailwind CSS", "Git", "GitHub", "Postman", "Claude Code"],
    },
  ],
  socials: {
    github: "https://github.com/1devchoudhary",
    linkedin: "https://www.linkedin.com/in/devendra-choudhary-2a538a1b3/",
    email: "devendrachoudhary253@gmail.com",
  },
};
