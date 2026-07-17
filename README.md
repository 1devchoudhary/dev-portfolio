# 3D Portfolio Website

A premium, dark-themed personal portfolio built with Next.js 15, Tailwind CSS v4, Framer Motion, and React Three Fiber.

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **3D Graphics**: React Three Fiber / Drei
- **Forms**: Web3Forms

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Rename `.env.example` to `.env.local` and add your Web3Forms access key:
   ```env
   NEXT_PUBLIC_WEB3FORMS_KEY=your_access_key_here
   ```
   *You can get a free access key from [Web3Forms](https://web3forms.com/).*

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Editing Content
All content for the portfolio (bio, skills, journey milestones, projects, social links) is stored in a single typed file. 
To edit the content, modify `src/data/content.ts`.

## Deploying to Vercel
1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/) and import the project.
3. Add the `NEXT_PUBLIC_WEB3FORMS_KEY` to the Environment Variables in Vercel settings.
4. Deploy! Next.js will automatically statically generate the pages for optimal performance and SEO.
