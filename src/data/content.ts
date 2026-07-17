export const portfolioContent = {
  hero: {
    name: "Devendra Choudhary",
    role: "Full Stack MERN Developer",
    tagline:
      "I build end-to-end web applications with React, Node.js, and MongoDB — secure authentication, clean REST APIs, and interfaces that feel fast. Currently shipping production software at Quark Consulting.",
  },
  about: {
    bio: "I'm a full-stack developer from Indore, India, working across the MERN stack. In the past year I've gone from intern to production developer — building REST APIs, JWT-secured auth flows with role-based access, and responsive UIs, and wiring real products together with n8n automations, Twilio, Xero, and CRM integrations. I hold an MCA from MediCaps University, and I like owning features end to end: database to API to pixel. This site — built with Next.js and Three.js — is me stretching beyond the day job.",
    stats: [
      { label: "Years Experience", value: "1+" },
      { label: "Apps Built End-to-End", value: "3+" },
      { label: "REST APIs Shipped", value: "20+" },
    ],
  },
  skills: [
    {
      category: "Frontend",
      items: ["React.js", "JavaScript (ES6+)", "Tailwind CSS", "HTML5 & CSS3", "Vite"],
    },
    {
      category: "Backend & Security",
      items: ["Node.js", "Express.js", "MongoDB", "MySQL", "REST APIs", "JWT · Bcrypt · 2FA"],
    },
    {
      category: "Tools & Integrations",
      items: [
        "Git & GitHub",
        "Postman",
        "MongoDB Atlas",
        "n8n",
        "VPS Deployment",
        "Twilio",
        "Xero",
        "Pipedrive CRM",
        "Google Cloud",
      ],
    },
  ],
  journey: [
    {
      id: 1,
      year: "Now",
      title: "Full Stack Developer",
      company: "Quark Consulting",
      description:
        "Building and maintaining production MERN applications — REST APIs with Node and Express, JWT authentication with role-based access control, and n8n + CRM automations that streamline real business workflows.",
    },
    {
      id: 2,
      year: "2025",
      title: "Full Stack Developer Intern",
      company: "Shanti Infosoft LLP, Indore",
      description:
        "End-to-end MERN development across frontend, backend, and database. Built and tested REST APIs with Node and Express, and shipped responsive React + Tailwind interfaces.",
    },
    {
      id: 3,
      year: "2023",
      title: "MCA — Master of Computer Applications",
      company: "MediCaps University, Indore",
      description:
        "Deepened my software engineering foundations while building full-stack projects alongside the coursework. Graduated in 2025 with a 7.58 CGPA.",
    },
    {
      id: 4,
      year: "2020",
      title: "BCA — Bachelor of Computer Applications",
      company: "Vikram University, Ujjain",
      description:
        "Where it all started — three years of computer applications fundamentals and my first real programs. Finished with 75.5%.",
    },
  ],
  projects: [
    {
      id: 1,
      title: "Property Management System",
      problem:
        "Property managers juggle three very different audiences — admins, landlords, and tenants — plus accounting, scheduling, and constant back-and-forth communication, usually spread across disconnected tools.",
      solution:
        "A full-stack MERN + MySQL platform with role-based workflows for all three user types, secured by JWT, bcrypt, and OTP-based 2FA. Built 20+ REST APIs for property, user, and workflow management, integrated accounting and calendar services, and added a real-time chat and email notification module.",
      impact:
        "One system now covers the entire property workflow — secure multi-role access, automated accounting and scheduling, and conversation tracking across every user.",
      tags: ["React", "Node.js", "Express", "MongoDB", "MySQL", "JWT"],
      liveLink: "",
      githubLink: "",
    },
    {
      id: 2,
      title: "Dental Care Website",
      problem:
        "A dental practice needed more than a brochure site — patient images had to be collected, processed, and routed without anyone doing it by hand.",
      solution:
        "A full-stack MERN application with secure image upload, JWT-protected routes, and n8n automation workflows that process uploads and handle follow-up tasks automatically.",
      impact:
        "Image handling and routine follow-ups run themselves through automation, and every protected route sits behind authenticated access.",
      tags: ["React", "Node.js", "Express", "MongoDB", "n8n"],
      liveLink: "",
      githubLink: "",
    },
    {
      id: 3,
      title: "Resolve Hub — Support Ticketing",
      problem:
        "Support requests scattered across inboxes make it impossible to track who asked what, who's handling it, and whether it ever got resolved.",
      solution:
        "A MERN ticketing system with separate user and admin dashboards, full ticket lifecycle management — creation, updates, status tracking — and role-based access control for each user type.",
      impact:
        "Every request becomes a trackable ticket with an owner and a status, giving users visibility and admins a single queue to work from.",
      tags: ["React", "Node.js", "Express", "MongoDB"],
      liveLink: "",
      githubLink: "",
    },
  ],
  socials: {
    github: "https://github.com/1devchoudhary",
    linkedin: "https://www.linkedin.com/in/devendra-choudhary-2a538a1b3/",
    email: "devendrachoudhary253@gmail.com",
  },
};
