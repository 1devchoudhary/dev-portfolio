import { ArrowUp } from "lucide-react";

const links = [
  { name: "Journey", href: "#journey" },
  { name: "Projects", href: "#projects" },
  { name: "Skills", href: "#skills" },
  { name: "Contact", href: "#contact" },
];

export default function Footer({ name }: { name: string }) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center gap-6 sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="font-heading text-xl font-extrabold">
            DC<span className="text-accent">.</span>
          </span>
          <span className="text-sm text-dim">
            &copy; {new Date().getFullYear()} {name}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <nav className="flex gap-5 text-sm text-body">
            {links.map((link) => (
              <a key={link.name} href={link.href} className="hover:text-foreground transition-colors">
                {link.name}
              </a>
            ))}
          </nav>
          <a
            href="#"
            aria-label="Back to top"
            className="grid h-10 w-10 place-items-center rounded-full border border-border text-body transition-colors hover:border-accent hover:text-accent"
          >
            <ArrowUp className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
