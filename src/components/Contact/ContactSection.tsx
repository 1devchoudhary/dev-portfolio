"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Mail, Send } from "lucide-react";
import { portfolioContent } from "@/data/content";
import MagneticButton from "../UI/MagneticButton";

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
    } catch (err) {
      setStatus("error");
      setMessage("An error occurred while sending your message.");
    }
  };

  return (
    <section id="contact" className="py-24 relative">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 gap-16"
        >
          <div>
            <h2 className="text-4xl font-heading font-bold mb-4">Let's <span className="text-gradient-accent">Connect</span></h2>
            <p className="text-gray-400 mb-8 max-w-md leading-relaxed">
              Have a project in mind or just want to say hi? Feel free to reach out. I'm always open to discussing new opportunities and creative ideas.
            </p>

            <div className="flex flex-wrap gap-4">
              <MagneticButton href={socials.github} target="_blank" aria-label="GitHub profile" variant="outline" className="!px-4 !py-4 rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </MagneticButton>
              <MagneticButton href={socials.linkedin} target="_blank" aria-label="LinkedIn profile" variant="outline" className="!px-4 !py-4 rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </MagneticButton>
              <MagneticButton href={`mailto:${socials.email}`} aria-label="Email me" variant="outline" className="!px-4 !py-4 rounded-full">
                <Mail className="w-5 h-5" />
              </MagneticButton>
            </div>
          </div>

          <div className="glass p-8 rounded-2xl relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-bl-full pointer-events-none" />
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* Honeypot field */}
              <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} />
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full bg-background border border-accent/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full bg-background border border-accent/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  className="w-full bg-background border border-accent/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>

              <MagneticButton
                type="submit"
                disabled={status === "submitting"}
                variant="primary"
                className="w-full"
              >
                {status === "submitting" ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </MagneticButton>

              {status === "success" && (
                <p className="text-green-500 text-sm mt-4 text-center">{message}</p>
              )}
              {status === "error" && (
                <p className="text-red-500 text-sm mt-4 text-center">{message}</p>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
