"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  CreditCard, 
  PieChart, 
  Settings, 
  Plus,
  TrendingUp,
  Wallet,
  Target,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  color?: string;
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Home,
    color: "text-blue-600 dark:text-blue-400"
  },
  {
    href: "/dashboard/transactions",
    label: "Transactions",
    icon: CreditCard,
    color: "text-green-600 dark:text-green-400"
  },
  {
    href: "/dashboard/budget",
    label: "Budget",
    icon: PieChart,
    color: "text-purple-600 dark:text-purple-400"
  },
  {
    href: "/dashboard/goals",
    label: "Goals",
    icon: Target,
    color: "text-orange-600 dark:text-orange-400"
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    color: "text-gray-600 dark:text-gray-400"
  }
];

interface EnhancedMobileNavProps {
  className?: string;
  showLabels?: boolean;
}

export function EnhancedMobileNav({ className, showLabels = true }: EnhancedMobileNavProps) {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState(pathname);

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border",
      "pb-safe", // Safe area padding for devices with home indicator
      className
    )}>
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-[60px] py-2 px-3 rounded-lg",
                "transition-all duration-200 touch-manipulation",
                "hover:bg-muted/50 active:scale-95",
                isActive && "bg-primary/10"
              )}
              onClick={() => setActiveItem(item.href)}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    isActive ? "text-primary" : item.color || "text-muted-foreground"
                  )} 
                />
                {item.badge && item.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center"
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </Badge>
                )}
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </div>
              
              {showLabels && (
                <span className={cn(
                  "text-xs mt-1 font-medium transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
      
      {/* Floating Action Button */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
        <Button
          asChild
          size="lg"
          className={cn(
            "h-12 w-12 rounded-full shadow-lg",
            "bg-primary hover:bg-primary/90",
            "transition-all duration-300 hover:scale-110 active:scale-95"
          )}
        >
          <Link href="/dashboard/transactions/new">
            <Plus className="h-6 w-6" />
          </Link>
        </Button>
      </div>
    </nav>
  );
}

// Enhanced bottom navigation with more features
interface AdvancedMobileNavProps {
  className?: string;
  notifications?: number;
  onQuickAction?: () => void;
}

export function AdvancedMobileNav({ 
  className, 
  notifications = 0,
  onQuickAction 
}: AdvancedMobileNavProps) {
  const pathname = usePathname();
  const [showQuickActions, setShowQuickActions] = useState(false);

  const quickActions = [
    { label: "Add Income", icon: TrendingUp, color: "bg-green-500" },
    { label: "Add Expense", icon: CreditCard, color: "bg-red-500" },
    { label: "Transfer", icon: Wallet, color: "bg-blue-500" },
  ];

  return (
    <>
      {/* Quick Actions Overlay */}
      {showQuickActions && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowQuickActions(false)}>
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex flex-col gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={action.label}
                className={cn(
                  "h-12 w-12 rounded-full shadow-lg",
                  action.color,
                  "animate-in slide-in-from-bottom-2",
                  `animation-delay-${index * 100}`
                )}
                onClick={() => {
                  setShowQuickActions(false);
                  onQuickAction?.();
                }}
              >
                <action.icon className="h-5 w-5" />
              </Button>
            ))}
          </div>
        </div>
      )}

      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background/95 backdrop-blur-md border-t border-border",
        "pb-safe",
        className
      )}>
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[60px] py-2 px-3 rounded-lg",
                  "transition-all duration-200 touch-manipulation",
                  "hover:bg-muted/50 active:scale-95",
                  isActive && "bg-primary/10"
                )}
              >
                <div className="relative">
                  <Icon 
                    className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      isActive ? "text-primary" : item.color || "text-muted-foreground"
                    )} 
                  />
                  
                  {item.href === "/dashboard/settings" && notifications > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center"
                    >
                      {notifications > 99 ? "99+" : notifications}
                    </Badge>
                  )}
                </div>
                
                <span className={cn(
                  "text-xs mt-1 font-medium transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          {/* Settings with notification */}
          <Link
            href="/dashboard/settings"
            className={cn(
              "flex flex-col items-center justify-center min-w-[60px] py-2 px-3 rounded-lg",
              "transition-all duration-200 touch-manipulation",
              "hover:bg-muted/50 active:scale-95",
              pathname.startsWith("/dashboard/settings") && "bg-primary/10"
            )}
          >
            <div className="relative">
              <Settings 
                className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  pathname.startsWith("/dashboard/settings") 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )} 
              />
              {notifications > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
            <span className={cn(
              "text-xs mt-1 font-medium transition-colors duration-200",
              pathname.startsWith("/dashboard/settings") ? "text-primary" : "text-muted-foreground"
            )}>
              Settings
            </span>
          </Link>
        </div>
        
        {/* Enhanced FAB with quick actions */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
          <Button
            size="lg"
            onClick={() => setShowQuickActions(!showQuickActions)}
            className={cn(
              "h-12 w-12 rounded-full shadow-lg",
              "bg-primary hover:bg-primary/90",
              "transition-all duration-300 hover:scale-110 active:scale-95",
              showQuickActions && "rotate-45"
            )}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </nav>
    </>
  );
}