"use client";

import { useEffect, useState } from "react";
import { Bot, Brain, Sparkles } from "lucide-react";

export function TypingIndicator() {
  const [dots, setDots] = useState(1);
  const [currentMessage, setCurrentMessage] = useState(0);

  const thinkingMessages = [
    "Analyzing your financial data...",
    "Processing insights...",
    "Generating personalized advice...",
    "Reviewing your spending patterns...",
    "Preparing recommendations..."
  ];

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev >= 3 ? 1 : prev + 1));
    }, 400);

    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % thinkingMessages.length);
    }, 2000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(messageInterval);
    };
  }, [thinkingMessages.length]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Brain className="h-3 w-3 animate-pulse" />
        <span className="transition-all duration-500">{thinkingMessages[currentMessage]}</span>
      </div>
      
      <div className="bg-gradient-to-br from-card/80 to-muted/50 backdrop-blur border border-border/50 rounded-2xl p-4 shadow-sm animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-full blur-sm animate-pulse"></div>
              <div className="relative w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium text-foreground">AI Assistant</div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground">Thinking</div>
                <div className="flex gap-1">
                  {[1, 2, 3].map((dot) => (
                    <div
                      key={dot}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        dot <= dots 
                          ? 'bg-gradient-to-r from-primary to-blue-600 opacity-100 scale-110' 
                          : 'bg-muted-foreground/30 opacity-50 scale-90'
                      }`}
                      style={{ 
                        animationDelay: `${dot * 0.1}s`,
                        animation: dot <= dots ? 'pulse 1s infinite' : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Animated thinking waves */}
          <div className="flex items-center gap-1 opacity-60">
            {[1, 2, 3, 4, 5].map((wave) => (
              <div
                key={wave}
                className="w-0.5 bg-gradient-to-t from-primary to-blue-600 rounded-full animate-pulse"
                style={{
                  height: `${Math.sin(wave * 0.5) * 8 + 12}px`,
                  animationDelay: `${wave * 0.1}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 pt-3 border-t border-border/30">
          <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-blue-600 rounded-full animate-pulse" 
                 style={{
                   width: '60%',
                   animation: 'loading-bar 3s ease-in-out infinite'
                 }}
            />
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 60%; }
          100% { width: 90%; }
        }
      `}</style>
    </div>
  );
}