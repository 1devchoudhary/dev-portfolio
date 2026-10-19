# Devendra Choudhary — Portfolio

Portfolio of a backend-focused full stack developer, built with Next.js and Tailwind CSS. A dark, warm-orange design with a glowing CSS orb, a scroll-told "journey" from first code to production, and project case studies drawn as animated data-flow diagrams — rich to look at, but fast and readable on any device.

**🔗 Live site → [dev-portfolio-nu-ashen.vercel.app](https://dev-portfolio-nu-ashen.vercel.app)**

![Portfolio preview](public/preview.png)

## Highlights

- **Story-driven** — a "My Journey" timeline runs from first programs (BCA, 2020) to shipping production systems, and its line fills in as you scroll.
- **Data-flow case studies** — client work is under NDA, so each project shows how its data moves (e.g. cron → Xero invoice → payment → split → landlord bill) instead of screenshots.
- **Zero-JS visuals** — the hero orb, orbits, glows and flow animations are pure CSS/SVG: no WebGL, no animation libraries, and they work on phones.
- **Motion that never blocks** — no loader, scroll-jacking or custom cursor; content is readable instantly, and every animation turns off under `prefers-reduced-motion`.
- **Mostly server-rendered** — only the navbar, the scroll-reveal observer and the contact form ship client JavaScript.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) · React 19 · TypeScript |
| Styling | Tailwind CSS v4 · Sora / Inter / JetBrains Mono |
| Icons | lucide-react |
| Forms | Web3Forms (no backend) |
| Hosting | Vercel |

## Running locally

```bash
git clone https://github.com/1devchoudhary/dev-portfolio.git
cd dev-portfolio
npm install
```

Create a `.env.local` with a free [Web3Forms](https://web3forms.com) key (only needed for the contact form):

```bash
NEXT_PUBLIC_WEB3FORMS_KEY=your_access_key_here
```

Then:

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Editing content

All copy — hero, stats, journey, projects (including their flow-diagram steps), skills, and social links — lives in one typed file:

```
src/data/content.ts
```

Edit it there and every section updates; no component changes needed. Colours and fonts are defined once in `src/app/globals.css` (`@theme`) and `src/app/layout.tsx`.

## Project structure

```
src/
├─ app/              # layout, fonts, SEO metadata, sitemap, robots, favicon
├─ components/
│  ├─ Hero/          # intro, CSS orb, stats strip
│  ├─ Experience/    # "My Journey" story timeline
│  ├─ Projects/      # case studies + animated flow diagrams
│  ├─ Skills/        # grouped skill cards
│  ├─ Contact/       # Web3Forms contact form
│  ├─ Layout/        # navbar and footer
│  └─ UI/            # scroll reveal, brand icons
├─ data/content.ts   # all site content
└─ lib/site.ts       # site URL + SEO config
```

## Deployment

Deployed on Vercel; pushes to `main` deploy automatically. Set `NEXT_PUBLIC_WEB3FORMS_KEY` (and optionally `NEXT_PUBLIC_SITE_URL`) in the Vercel project's environment variables.

---

Built by [Devendra Choudhary](https://github.com/1devchoudhary) · [LinkedIn](https://www.linkedin.com/in/devendra-choudhary-2a538a1b3/)
