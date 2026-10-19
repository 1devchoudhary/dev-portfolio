import { Cloud, Database, LayoutDashboard, Server, Workflow } from "lucide-react";
import { portfolioContent } from "@/data/content";

const icons = [Server, Database, Workflow, Cloud, LayoutDashboard];

export default function SkillsSection() {
  const { skills } = portfolioContent;

  return (
    <section id="skills" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="reveal mb-14">
          <p className="eyebrow">Tech stack</p>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">Skills &amp; Tools</h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {skills.map((group, i) => {
            const Icon = icons[i];
            // 3 cards on the first row, 2 wider ones on the second
            return (
              <div
                key={group.category}
                className={`reveal card card-hover p-6 ${i < 3 ? "lg:col-span-2" : "lg:col-span-3"} ${
                  i === skills.length - 1 ? "sm:col-span-2" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold">{group.category}</h3>
                </div>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li key={item} className="rounded-md border border-border bg-background/60 px-2.5 py-1 text-sm text-body">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
