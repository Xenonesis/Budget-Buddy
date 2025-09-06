"use client";

import React from "react";
import { TechLogo } from "@/components/ui/tech-logo";

export default function TestTechLogos() {
  const techStack = [
    { name: "Next.js", logo: "/tech/nextjs.svg", desc: "React framework for production" },
    { name: "React", logo: "/tech/react.svg", desc: "UI component library" },
    { name: "TypeScript", logo: "/tech/typescript.svg", desc: "Type-safe JavaScript" },
    { name: "Tailwind CSS", logo: "/tech/tailwind.svg", desc: "Utility-first CSS framework" },
    { name: "Shadcn UI", logo: "/tech/shadcn.png", desc: "UI component system" },
    { name: "Supabase", logo: "/tech/supabase.svg", desc: "Open source Firebase alternative" },
    { name: "PostgreSQL", logo: "/tech/postgres.svg", desc: "Relational database" },
    { name: "Node.js", logo: "/tech/nodejs.svg", desc: "JavaScript runtime" },
    { name: "Auth.js", logo: "/tech/authjs.svg", desc: "Authentication for Next.js" },
    { name: "REST API", logo: "/tech/api.svg", desc: "API architecture" },
    { name: "Vercel", logo: "/tech/vercel.svg", desc: "Deployment platform" },
    { name: "GitHub", logo: "/tech/github.svg", desc: "Version control" },
    { name: "Chart.js", logo: "/tech/chartjs.svg", desc: "Data visualization" },
    { name: "Framer Motion", logo: "/tech/framer.svg", desc: "Animation library" },
    { name: "OpenAI", logo: "/tech/openai.svg", desc: "AI insights integration" }
  ];

  return (
    <div className="min-h-screen p-8 bg-background">
      <h1 className="text-3xl font-bold mb-8">Tech Logo Test</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {techStack.map((tech, i) => (
          <div key={i} className="flex flex-col items-center p-4 rounded-lg border border-muted bg-white/50 dark:bg-gray-900/50">
            <div className="w-16 h-16 mb-3 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-md"></div>
              <div className="relative z-10 w-12 h-12">
                <TechLogo
                  name={tech.name}
                  logo={tech.logo}
                  size={48}
                  className="w-full h-full"
                />
              </div>
            </div>
            <h4 className="text-sm font-medium text-center">{tech.name}</h4>
            <p className="text-xs text-center text-muted-foreground mt-1">{tech.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}