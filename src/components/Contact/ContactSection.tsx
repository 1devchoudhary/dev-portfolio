"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { portfolioContent } from "@/data/content";
import { GithubIcon, LinkedinIcon } from "../UI/BrandIcons";

const fieldClass =
  "w-full rounded-lg border border-border bg-background/70 px-4 py-3 text-foreground placeholder:text-dim focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors";

export default function ContactSection() {
  const { socials } = portfolioContent;
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    const formData = new FormData(e.currentTarget);
    
    // Check honeypot
    if (formData.get("botcheck")) {
      setStatus("error");
      setMessage("Spam detected.");
      return;
    }

    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
    if (!accessKey || accessKey === "YOUR_WEB3FORMS_ACCESS_KEY_HERE") {
      setStatus("error");
      setMessage("Web3Forms access key is missing or invalid.");
      return;
    }
    
    const payload = {
      access_key: accessKey,
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      subject: "New message from your portfolio",
      from_name: "Portfolio Contact Form",
    };

    try {
      // JSON + Accept header is Web3Forms' AJAX mode; a plain FormData POST
      // redirects to their thank-you page and trips CORS instead
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setMessage("Thank you! Your message has been sent.");
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus("error");
        setMessage(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("An error occurred while sending your message.");
    }
  };

  const socialLinks = [
    { label: "GitHub", href: socials.github, Icon: GithubIcon },
    { label: "LinkedIn", href: socials.linkedin, Icon: LinkedinIcon },
    { label: "Email", href: `mailto:${socials.email}`, Icon: Mail },
  ];

  return (
    <section id="contact" className="relative overflow-hidden py-24">
      <div aria-hidden className="absolute -bottom-40 left-1/2 -translate-x-1/2 h-[420px] w-[900px] rounded-full bg-accent/10 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-6 grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="reveal">
          <p className="eyebrow">Let&apos;s talk</p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">Get In Touch</h2>
          <p className="mt-5 max-w-md text-lg text-body">
            Hiring for a backend or full-stack role, or have a system that needs building? I&apos;d like to hear about it.
          </p>
          <a href={`mailto:${socials.email}`} className="mt-6 inline-block font-mono text-sm text-accent-2 hover:text-accent transition-colors break-all">
            {socials.email}
          </a>

          <div className="mt-8 flex gap-3">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-12 w-12 place-items-center rounded-full border border-border bg-surface text-body transition-colors hover:border-accent hover:text-accent"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="reveal card p-6 sm:p-8 space-y-5">
          {/* Honeypot field */}
          <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} />

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
              <input type="text" id="name" name="name" required className={fieldClass} placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
              <input type="email" id="email" name="email" required className={fieldClass} placeholder="you@company.com" />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              className={`${fieldClass} resize-none`}
              placeholder="Tell me about the role or project..."
            />
          </div>

          <button
            type="submit"
            disabled={status === "submitting"}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-accent px-5 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Send className="w-4 h-4" /> {status === "submitting" ? "Sending..." : "Send Message"}
          </button>

          <p role="status" className={`text-sm text-center ${status === "success" ? "text-ok" : "text-red-400"}`}>
            {(status === "success" || status === "error") && message}
          </p>
        </form>
      </div>
    </section>
  );
}
