import { portfolioContent } from "@/data/content";

export default function Footer() {
  return (
    <footer className="py-8 text-center border-t border-accent/10 mt-20">
      <div className="container mx-auto px-6">
        <p className="text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} {portfolioContent.hero.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
