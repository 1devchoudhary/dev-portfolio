# Build Prompt: 3D Portfolio Website

Build a premium, dark-themed personal portfolio website from scratch in this empty folder. Follow this spec exactly.

## Tech Stack (no substitutions)

- **Next.js 15+ (App Router) with TypeScript** — use static generation; every page must be statically renderable for SEO.
- **Tailwind CSS v4** for all styling, with the design tokens below defined in the theme.
- **Framer Motion** (`motion` package) for all animations and scroll effects.
- **react-three-fiber + @react-three/drei** for 3D. Do NOT use Spline.
- **No backend, no database, no API routes for data.** All content lives in one typed data file: `src/data/content.ts` (name, bio, skills, journey milestones, projects, social links). Use realistic placeholder content I can edit later.
- Contact form posts to **Web3Forms** (`https://api.web3forms.com/submit`) with the access key read from `NEXT_PUBLIC_WEB3FORMS_KEY` in `.env.local`. Create `.env.example` with a placeholder. Include a honeypot field for spam. Show inline success/error states — no page reload.

## Design System

- **Background:** shining black — gradient from `#09090b` to `#18181b` with subtle radial glows of the accent color at low opacity.
- **Accent:** neon orange `#ff5900`, secondary `#ff8a00`. Use for glows, borders, highlights, and the timeline path.
- **Typography:** `Syne` for headings, `Inter` for body — loaded via `next/font` (no external font CDN requests).
- **Vibe:** dark glassmorphism — translucent panels (`backdrop-blur`), 1px glowing borders, soft orange shadows on hover. Generous whitespace; this should feel expensive, not busy.
- Define all colors, fonts, and glow shadows as Tailwind theme tokens — no hardcoded hex values scattered in components.

## Pages & Sections (single page, anchor navigation)

1. **Hero** — full viewport. Large headline with name + role, short tagline, two CTAs ("View Projects", "Contact Me"). On the right, a 3D scene (see 3D rules below): use a free low-poly character or abstract geometric model that subtly rotates toward the cursor position. Floating tech-stack icons as small 3D or CSS elements.
2. **About** — short bio, photo placeholder, quick stats.
3. **Skills** — grouped by category (Frontend / Backend / Tools), rendered as glowing glass chips.
4. **Journey ("snake road") timeline** — a single SVG path shaped like a winding S-curve road down the section. Use Framer Motion `useScroll` + `pathLength` so the orange glowing stroke draws itself as the user scrolls. Milestone nodes (education, jobs, achievements) sit along the path and fade/slide in as the stroke reaches them. This is the signature piece — make it smooth.
5. **Projects** — 3–4 case-study cards from `content.ts`: title, problem → solution → impact summary, tech tags, screenshot placeholder, links to live demo + GitHub. Hover: card lifts with an orange glow.
6. **Contact** — the Web3Forms form (name, email, message) in a glass panel, plus social links.
7. **Footer** — minimal.

Sticky glass navbar with anchor links and active-section highlighting.

## Signature Interactions

- **Custom cursor:** small glowing orange dot that expands into a translucent glass ring over interactive elements. Desktop only — disable entirely on touch devices, and never hide the native cursor (render on top of it).
- **Magnetic buttons:** CTAs and social icons translate slightly toward the cursor on hover (Framer Motion springs).
- **Loading screen:** minimal full-screen overlay with a pulsing orange monogram while the 3D scene loads; fade it out when ready. Never block text content on it — only the 3D canvas waits.
- **Scroll reveals:** sections fade/slide in once on entry (`whileInView`, `once: true`).

## 3D Rules (critical — do not skip)

- Load the 3D canvas with `next/dynamic` (`ssr: false`) and only after first paint; the hero text must render instantly without it.
- Any GLB/GLTF model must be Draco or meshopt compressed and under ~1.5 MB. If no suitable free model is available, build an abstract animated geometry scene (e.g., glowing torus knot / particle field) in R3F instead — do not ship a huge model.
- On mobile (or when WebGL is unavailable), render a static styled fallback instead of the canvas.
- Pause the render loop when the canvas is offscreen (`frameloop="demand"` or IntersectionObserver).

## Accessibility & Performance (acceptance criteria)

- Respect `prefers-reduced-motion`: use Framer Motion's `useReducedMotion` to replace movement animations with simple fades, and disable the custom cursor and magnetic effects.
- All text must meet WCAG AA contrast on the dark background; interactive elements need visible focus states.
- Semantic HTML (`nav`, `main`, `section`, one `h1`), alt text on images, labeled form fields.
- Target Lighthouse mobile ≥ 90 for Performance, Accessibility, and SEO. No layout shift from fonts or the 3D canvas (reserve space).

## SEO & Meta

- Full metadata via the Next.js Metadata API: title, description, Open Graph + Twitter card with a branded OG image (generate a static one), favicon, `sitemap.xml`, `robots.txt`.

## Deliverables

- Clean component structure under `src/components/` (one folder per section), typed content in `src/data/content.ts`.
- A `README.md` explaining how to run it, edit content, set the Web3Forms key, and deploy to Vercel.
- The project must build with `npm run build` with zero errors and run with `npm run dev`.

Work section by section in this order: scaffold + theme + content file → Hero (with 3D) → About/Skills → Journey timeline → Projects → Contact → polish (cursor, magnetic, loading, reduced-motion, SEO). Verify the build passes before finishing.
