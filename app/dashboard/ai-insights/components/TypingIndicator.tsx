"use client";

import { useEffect, useState } from "react";
import { Bot } from "lucide-react";

export function TypingIndicator() {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev >= 3 ? 1 : prev + 1));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-3 justify-start animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <Bot className="h-4 w-4 text-primary" />
      </div>
      <div className="bg-muted rounded-lg px-4 py-3 max-w-xs">
        <div className="flex items-center gap-1">
          <div className="text-sm text-muted-foreground">AI is thinking</div>
          <div className="flex gap-1 ml-2">
            {[1, 2, 3].map((dot) => (
              <div
                key={dot}
                className={`w-1.5 h-1.5 bg-muted-foreground/60 rounded-full transition-opacity duration-300 ${
                  dot <= dots ? 'opacity-100' : 'opacity-30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}