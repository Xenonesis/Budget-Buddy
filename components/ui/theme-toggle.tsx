"use client";

import { useEffect, useState, useCallback, memo, useMemo } from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useUserPreferences } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  iconOnly?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}

// Memoized theme menu items to avoid re-rendering
const ThemeMenuItems = memo(function ThemeMenuItems({ 
  onSelectTheme,
  currentTheme
}: { 
  onSelectTheme: (theme: string) => void;
  currentTheme: string; 
}) {
  return (
    <>
      <DropdownMenuItem 
        onClick={() => onSelectTheme("light")} 
        className="focus:bg-amber-50 dark:focus:bg-amber-950/30"
        aria-current={currentTheme === 'light' ? 'true' : undefined}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 mr-2.5 text-white">
              <Sun className="h-4 w-4" />
            </div>
            <span>Light</span>
          </div>
          <kbd className="hidden sm:inline-flex text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">⌘+L</kbd>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem 
        onClick={() => onSelectTheme("dark")} 
        className="focus:bg-violet-50 dark:focus:bg-violet-950/30"
        aria-current={currentTheme === 'dark' ? 'true' : undefined}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 mr-2.5 text-white">
              <Moon className="h-4 w-4" />
            </div>
            <span>Dark</span>
          </div>
          <kbd className="hidden sm:inline-flex text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">⌘+D</kbd>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem 
        onClick={() => onSelectTheme("system")} 
        className="focus:bg-blue-50 dark:focus:bg-blue-950/30"
        aria-current={currentTheme === 'system' ? 'true' : undefined}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-sky-500 mr-2.5 text-white">
              <Laptop className="h-4 w-4" />
            </div>
            <span>System</span>
          </div>
          <kbd className="hidden sm:inline-flex text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">⌘+S</kbd>
        </div>
      </DropdownMenuItem>
    </>
  );
});

ThemeMenuItems.displayName = 'ThemeMenuItems';

// Define as a function component first, then create a memoized version
function ThemeToggleComponent({
  className,
  iconOnly = false,
  variant = "outline",
  size = "icon",
  align = "end",
  side = "bottom",
}: ThemeToggleProps) {
  const { theme, setTheme } = useUserPreferences();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  // Avoid hydration mismatch by waiting until component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize the theme change handler
  const handleThemeChange = useCallback((newTheme: string) => {
    setTheme(newTheme as 'light' | 'dark' | 'system');
    setOpen(false);
  }, [setTheme]);

  // Add keyboard shortcuts 
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'l') {
          e.preventDefault();
          setTheme('light');
        } else if (e.key === 'd') {
          e.preventDefault();
          setTheme('dark');
        } else if (e.key === 's') {
          e.preventDefault();
          setTheme('system');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setTheme]);

  // Simplified button content for better performance
  const buttonContent = useMemo(() => {
    const getThemeIcon = () => {
      switch(theme) {
        case 'light':
          return <Sun className="h-4 w-4 text-amber-600" />;
        case 'dark':
          return <Moon className="h-4 w-4 text-violet-300" />;
        default:
          return <Laptop className="h-4 w-4 text-sky-600 dark:text-sky-400" />;
      }
    };

    if (!mounted) {
      return (
        <div className="flex items-center justify-center">
          <Sun className="h-4 w-4 dark:hidden" />
          <Moon className="h-4 w-4 hidden dark:block" />
          <span className="sr-only">Toggle theme</span>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center">
        {getThemeIcon()}
        {!iconOnly && (
          <span className="ml-2 text-sm font-medium">
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </span>
        )}
        <span className="sr-only">
          {`Current theme: ${theme}. Click to change theme.`}
        </span>
      </div>
    );
  }, [theme, iconOnly, mounted]);

  if (!mounted) {
    // Return a placeholder button with no functionality until mounted
    return (
      <Button 
        variant="ghost" 
        size={size} 
        className={cn(
          "relative w-9 h-9 p-0 rounded-full opacity-0",
          className
        )}
        aria-hidden="true"
        tabIndex={-1}
      >
        <span className="sr-only">Theme toggle - Loading</span>
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size={size} 
          className={cn(
            "relative w-9 h-9 p-0 overflow-hidden rounded-full",
            "bg-accent/10 hover:bg-accent/20",
            "border border-accent-foreground/10 hover:border-accent-foreground/20",
            "transition-all duration-200 ease-in-out",
            iconOnly ? "" : "w-auto px-3",
            className
          )}
          aria-label={`Theme: ${theme}. Click to change`}
        >
          {buttonContent}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} className="w-56 p-2">
        <ThemeMenuItems onSelectTheme={handleThemeChange} currentTheme={theme} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Create a memoized version of ThemeToggle
const MemoizedThemeToggle = memo(ThemeToggleComponent);
MemoizedThemeToggle.displayName = 'ThemeToggle';

// Export both the memoized and original versions
export { MemoizedThemeToggle as ThemeToggle }; 