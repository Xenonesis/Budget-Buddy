"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback, memo, useRef, KeyboardEvent as ReactKeyboardEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ensureUserProfile } from "@/lib/utils";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/ui/logo";
import { NotificationCenter } from "@/components/ui/notification-center";
import {
  LayoutGrid,
  BarChart3,
  GanttChartSquare,
  ArrowRightLeft,
  Lightbulb,
  Settings,
  TrendingUp,
  ChevronLeft,
  User,
  LogOut,
  LifeBuoy,
  Ban,
  Menu,
  X,
  Bell,
  Globe
} from 'lucide-react'
import Image from 'next/image'
import { cn, getAppVersion } from '@/lib/utils'

// Group definition for sidebar navigation
interface NavGroup {
  title: string;
  items: NavItem[];
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  label: string;
  shortcutKey?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { 
    setUserId, 
    setUsername, 
    setCurrency, 
    userId, 
    initialized,
    syncWithDatabase,
    setInitialized
  } = useUserPreferences();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const firstNavItemRef = useRef<HTMLAnchorElement>(null);
  const lastNavItemRef = useRef<HTMLAnchorElement>(null);
  const appVersion = getAppVersion();

  // Define all useCallback hooks at component level, not conditionally
  const handleSignOut = useCallback(async () => {
    // Clear user preferences when signing out
    setUserId(null);
    setUsername('');
    setCurrency('USD');
    
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }, [router, setUserId, setUsername, setCurrency]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => {
      const newState = !prev;
      // Save state to localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar-collapsed', newState.toString());
      }
      return newState;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsMobileSidebarOpen(prev => !prev);
    
    // Add a class to show the sidebar but preserve scrolling
    document.documentElement.classList.toggle("sidebar-open");
    
    // Toggle ARIA expanded state for accessibility
    const menuButton = document.querySelector('[aria-label="Toggle menu"]');
    if (menuButton) {
      const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', (!isExpanded).toString());
    }
  }, []);

  const closeSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
    
    // Remove the sidebar class to hide it
    document.documentElement.classList.remove("sidebar-open");
    
    // Update ARIA expanded state
    const menuButton = document.querySelector('[aria-label="Toggle menu"]');
    if (menuButton) {
      menuButton.setAttribute('aria-expanded', 'false');
    }
  }, []);

  const handleSidebarToggleForMobile = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      closeSidebar();
    }
  }, [closeSidebar]);

  // Define component functions with useCallback to ensure consistent hook order
  const NavItemComponent = useCallback(({ item, pathname, onClick, collapsed, isLast }: { 
    item: NavItem; 
    pathname: string;
    onClick?: () => void;
    collapsed?: boolean;
    isLast?: boolean;
  }) => {
    const isExternal = item.href.startsWith('http');
    const isActive = !isExternal && pathname === item.href;
    const itemRef = isLast ? lastNavItemRef : null;
    
    const commonProps = {
      className: `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 relative group overflow-hidden ${
        isActive
          ? "bg-primary/15 text-primary shadow-sm"
          : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
      }`,
      onClick,
      title: collapsed ? item.title : undefined,
      'data-testid': `nav-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`,
      'aria-label': item.shortcutKey ? `${item.title} (Shortcut: ${item.shortcutKey})` : item.title,
    };
    
    return (
      <li>
        {isExternal ? (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            {...commonProps}
          >
            {/* Hover animation background */}
            <span 
              className={`absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isActive ? 'opacity-30' : ''}`} 
              aria-hidden="true"
            ></span>
            
            {/* Icon with animation */}
            <span 
              className={`relative z-10 flex items-center justify-center transition-all duration-300 ${
                isActive 
                  ? 'scale-110 text-primary' 
                  : 'text-muted-foreground group-hover:scale-110 group-hover:text-primary/80'
              }`} 
              aria-hidden="true"
            >
              {item.icon}
            </span>
            
            {/* Title text */}
            <span 
              className={`relative z-10 transition-all duration-300 ${
                collapsed 
                  ? 'opacity-0 w-0 overflow-hidden' 
                  : 'opacity-100'
              }`}
            >
              {item.title}
            </span>
            
            {/* Active indicator */}
            {isActive && (
              <span 
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" 
                aria-hidden="true"
              ></span>
            )}
            
            {/* Collapsed hover indicator */}
            {collapsed && (
              <span 
                className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary/0 group-hover:bg-primary rounded-l-full transition-all duration-300" 
                aria-hidden="true"
              ></span>
            )}
            
            {/* Keyboard shortcut */}
            {item.shortcutKey && !collapsed && (
              <kbd className="relative z-10 hidden sm:flex items-center justify-center ml-auto rounded bg-muted/70 text-muted-foreground px-1.5 py-0.5 text-[10px] font-mono font-medium">
                {item.shortcutKey}
              </kbd>
            )}
          </a>
        ) : (
          <Link
            href={item.href}
            {...commonProps}
            aria-current={isActive ? 'page' : undefined}
            ref={itemRef}
          >
            {/* Hover animation background */}
            <span 
              className={`absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isActive ? 'opacity-30' : ''}`} 
              aria-hidden="true"
            ></span>
            
            {/* Icon with animation */}
            <span 
              className={`relative z-10 flex items-center justify-center transition-all duration-300 ${
                isActive 
                  ? 'scale-110 text-primary' 
                  : 'text-muted-foreground group-hover:scale-110 group-hover:text-primary/80'
              }`} 
              aria-hidden="true"
            >
              {item.icon}
            </span>
            
            {/* Title text */}
            <span 
              className={`relative z-10 transition-all duration-300 ${
                collapsed 
                  ? 'opacity-0 w-0 overflow-hidden' 
                  : 'opacity-100'
              }`}
            >
              {item.title}
            </span>
            
            {/* Active indicator */}
            {isActive && (
              <span 
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" 
                aria-hidden="true"
              ></span>
            )}
            
            {/* Collapsed hover indicator */}
            {collapsed && (
              <span 
                className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary/0 group-hover:bg-primary rounded-l-full transition-all duration-300" 
                aria-hidden="true"
              ></span>
            )}
            
            {/* Keyboard shortcut */}
            {item.shortcutKey && !collapsed && (
              <kbd className="relative z-10 hidden sm:flex items-center justify-center ml-auto rounded bg-muted/70 text-muted-foreground px-1.5 py-0.5 text-[10px] font-mono font-medium">
                {item.shortcutKey}
              </kbd>
            )}
          </Link>
        )}
      </li>
    );
  }, []);
  
  const NavSectionHeaderComponent = useCallback(({ title, collapsed }: { 
    title: string; 
    collapsed: boolean 
  }) => {
    if (collapsed) return null;
    
    return (
      <div className="mb-2 px-4 transition-all duration-300">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">{title}</p>
      </div>
    );
  }, []);

  // Create memoized components
  const NavItem = memo(NavItemComponent);
  NavItem.displayName = 'NavItem';
  
  const NavSectionHeader = memo(NavSectionHeaderComponent);
  NavSectionHeader.displayName = 'NavSectionHeader';

  // Keyboard shortcut for toggling sidebar
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Toggle sidebar with Alt+S
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        toggleCollapsed();
      }
      
      // Escape key to close sidebar on mobile
      if (e.key === 'Escape' && document.documentElement.classList.contains('sidebar-open')) {
        closeSidebar();
      }
    };
    
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [toggleCollapsed, closeSidebar]);

  // Focus trap for mobile sidebar
  useEffect(() => {
    if (!isMobileSidebarOpen) return;
    
    const handleFocusTrap = (e: KeyboardEvent) => {
      if (!sidebarRef.current || e.key !== 'Tab') return;
      
      const focusableElements = sidebarRef.current.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };
    
    document.addEventListener('keydown', handleFocusTrap);
    return () => document.removeEventListener('keydown', handleFocusTrap);
  }, [isMobileSidebarOpen]);

  // Handle body scroll lock when mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMobileSidebarOpen]);

  // Focus management for keyboard navigation
  useEffect(() => {
    if (isMobileSidebarOpen && firstNavItemRef.current) {
      // Set focus to first nav item when sidebar opens
      setTimeout(() => firstNavItemRef.current?.focus(), 100);
    }
  }, [isMobileSidebarOpen]);

  useEffect(() => {
    let isMounted = true;
    
    const getUser = async () => {
      try {
        // Always refresh the auth state when checking
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          throw error;
        }
        
        if (!data.user) {
          router.push("/auth/login");
          return;
        }
        
        setUser(data.user);
        
        // Set the user ID in the store
        setUserId(data.user.id);
        
        // Add detailed console logging to debug user information
        console.log("User authenticated:", {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name,
          metadata: data.user.user_metadata
        });
        
        // Extract preferred currency from user metadata if it exists
        const preferredCurrency = data.user.user_metadata?.preferred_currency;
        if (preferredCurrency) {
          // Set currency directly to avoid timing issues
          setCurrency(preferredCurrency);
          // Store in localStorage for redundancy
          if (typeof window !== 'undefined') {
            localStorage.setItem('budget-currency', preferredCurrency);
          }
        }
        
        // Ensure profile exists using the utility function
        try {
          const profileCreated = await ensureUserProfile(
            data.user.id, 
            data.user.email, 
            data.user.user_metadata?.name,
            preferredCurrency
          );
          
          if (!profileCreated) {
            console.log("Profile creation failed on first attempt, retrying once...");
            // Wait 1 second before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Retry once
            await ensureUserProfile(
              data.user.id, 
              data.user.email, 
              data.user.user_metadata?.name,
              preferredCurrency
            );
          }
        } catch (profileError) {
          console.error("Error ensuring user profile:", profileError);
          // Continue anyway - the app can still function without a complete profile
        }
        
        // Sync user preferences if not already initialized
        if (!initialized || userId !== data.user.id) {
          await syncWithDatabase();
          setInitialized(true);
        }
      } catch (error) {
        console.error("Error getting user:", error);
        // If we get a 401 error, redirect to login
        if (typeof error === 'object' && error !== null && 'status' in error && error.status === 401) {
          router.push("/auth/login");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session && isMounted) {
          router.push("/auth/login");
        }
      }
    );

    getUser();

    // Clean up function
    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [router, setUserId, setCurrency, syncWithDatabase, initialized, userId, setInitialized]);

  // Load sidebar state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sidebar-collapsed');
      if (savedState !== null) {
        setCollapsed(savedState === 'true');
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  // Mobile sidebar toggle handler with window width check
  // Remove this duplicate function since we already have a useCallback version
  // const handleSidebarToggleForMobile = () => {
  //   if (typeof window !== 'undefined' && window.innerWidth < 768) {
  //     closeSidebar();
  //   }
  // };

  // Organize navigation items into groups
  const navGroups: NavGroup[] = [
    {
      title: "Main Navigation",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: <LayoutGrid className="h-5 w-5" />,
          label: "Dashboard",
          shortcutKey: 'Alt+1'
        },
        {
          title: "Transactions",
          href: "/dashboard/transactions",
          icon: <ArrowRightLeft className="h-5 w-5" />,
          label: "Transactions",
          shortcutKey: 'Alt+4'
        },
        {
          title: "Budget",
          href: "/dashboard/budget",
          icon: <GanttChartSquare className="h-5 w-5" />,
          label: "Budget",
          shortcutKey: 'Alt+3'
        },
        {
          title: "Analytics",
          href: "/dashboard/analytics",
          icon: <BarChart3 className="h-5 w-5" />,
          label: "Analytics",
          shortcutKey: 'Alt+2'
        },
        {
          title: "Financial Insights",
          href: "/dashboard/financial-insights",
          icon: <TrendingUp className="h-5 w-5" />,
          label: "Financial Insights",
          shortcutKey: 'Alt+5'
        },
        {
          title: "AI Insights",
          href: "/dashboard/ai-insights",
          icon: <Lightbulb className="h-5 w-5" />,
          label: "AI Insights",
          shortcutKey: 'Alt+6'
        },
        {
          title: "Notifications",
          href: "/dashboard/notifications",
          icon: <Bell className="h-5 w-5" />,
          label: "Notifications",
          shortcutKey: 'Alt+7'
        },
      ],
    },
    {
      title: "System",
      items: [
        {
          title: "Settings",
          href: "/dashboard/settings",
          icon: <Settings className="h-5 w-5" />,
          label: "Settings",
          shortcutKey: 'Alt+,'
        },
        {
          title: "About",
          href: "/dashboard/about",
          icon: <LifeBuoy className="h-5 w-5" />,
          label: "About"
        },
        {
          title: "Nitrolite",
          href: "https://nitrolite.vercel.app",
          icon: <Globe className="h-5 w-5" />,
          label: "Nitrolite"
        },
      ],
    },
  ];

  return (
    <div className="relative min-h-screen">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 shadow-sm backdrop-blur-md pt-safe md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <div className="flex flex-col items-center">
            <Logo size="sm" className="transition-transform duration-300 hover:scale-105" animated />
            <span className="text-[10px] sm:text-xs text-muted-foreground mt-1 tracking-wide">Smart Money Management</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <NotificationCenter />
          <ThemeToggle iconOnly />
          <button
            className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95 transition-transform"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
            aria-expanded="false"
            aria-controls="mobile-sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Backdrop for mobile sidebar */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm sidebar-backdrop md:hidden z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <div
        ref={sidebarRef}
        id="mobile-sidebar"
        className={cn(
          "fixed top-0 left-0 z-40 h-full bg-background/95 border-r backdrop-blur-sm md:hidden",
          "transition-transform duration-300 ease-in-out transform",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-hidden="true"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        <div className="flex flex-col h-full w-72 pt-5 pb-4 px-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-6 px-3">
            <div className="flex flex-col items-center">
              <Logo size="md" className="transition-transform duration-300 hover:scale-105" animated />
              <span className="text-[10px] sm:text-xs text-muted-foreground mt-1 tracking-wide">Smart Money Management</span>
            </div>
            <button 
              type="button"
              className="text-muted-foreground rounded-full p-2 hover:bg-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 transition-colors"
              onClick={() => setIsMobileSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User section */}
          <div className="flex items-center justify-between px-3 py-4 mb-2 bg-accent/20 rounded-lg border border-accent/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary transition-all duration-300 hover:bg-primary/20 user-avatar ring-2 ring-primary/20">
                  {user?.user_metadata?.name?.[0] || user?.email?.[0] || "U"}
                </div>
                <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium truncate max-w-[150px]">
                  {user?.user_metadata?.name || user?.email?.split('@')[0] || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user?.email || ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle iconOnly size="sm" />
              <button
                className="rounded-full p-2 text-muted-foreground hover:bg-accent/50 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 active:scale-95 transition-all duration-200"
                onClick={handleSignOut}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          <nav className="flex-1 space-y-2 py-2">
            <div className="mb-1 px-4 py-1 bg-accent/10 rounded-md">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">MAIN NAVIGATION</p>
            </div>
            <ul className="space-y-1">
              {navGroups[0].items.map((item, index) => (
                <NavItem 
                  key={item.href} 
                  item={item} 
                  pathname={pathname} 
                  onClick={handleSidebarToggleForMobile}
                  collapsed={collapsed}
                  isLast={index === navGroups[0].items.length - 1}
                />
              ))}
            </ul>

            <div className="mb-1 px-4 py-1 mt-6 bg-accent/10 rounded-md">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">SYSTEM</p>
            </div>
            <ul className="space-y-1">
              {navGroups[1].items.map((item, index) => (
                <NavItem 
                  key={item.href} 
                  item={item} 
                  pathname={pathname} 
                  onClick={handleSidebarToggleForMobile}
                  collapsed={collapsed}
                  isLast={index === navGroups[1].items.length - 1}
                />
              ))}
            </ul>
          </nav>

          <div className="pt-4 mt-auto">
            <div className="px-3 py-3 bg-primary/5 rounded-lg text-center">
              <span className="text-xs text-muted-foreground">Budget Buddy v{appVersion}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div 
        className={cn(
          "hidden md:flex h-screen fixed left-0 top-0 bottom-0 flex-col border-r z-30 bg-background/95 backdrop-blur-sm shadow-sm",
          "transition-all duration-300 ease-in-out",
          collapsed ? "w-[70px]" : "w-64"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="relative flex-1 flex flex-col min-h-0 overflow-y-auto scrollbar-thin">
          {/* Sidebar header with toggle */}
          <div className={cn(
            "flex items-center h-16 flex-shrink-0 px-4",
            collapsed ? "justify-center" : "justify-between"
          )}>
            {!collapsed && (
              <div className="flex flex-col items-center">
                <Logo size="md" className="transition-transform duration-300 hover:scale-105" animated />
                <span className="text-[10px] sm:text-xs text-muted-foreground mt-1 tracking-wide">Smart Money Management</span>
              </div>
            )}
            {collapsed && (
              <div className="flex flex-col items-center">
                <Logo size="xs" className="transition-transform duration-300 hover:scale-105" animated />
                <span className="text-[8px] text-muted-foreground mt-0.5 tracking-wide opacity-70">SMM</span>
              </div>
            )}
            <button
              className="hidden md:flex h-10 w-10 items-center justify-center rounded-md bg-accent/30 hover:bg-accent/60 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95 transition-all duration-200 group relative sidebar-toggle-indicator overflow-hidden"
              onClick={toggleCollapsed}
              aria-label="Toggle sidebar"
              aria-expanded="false"
              title={collapsed ? "Expand sidebar (Alt+S)" : "Collapse sidebar (Alt+S)"}
            >
              {/* Background highlight effect */}
              <span className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></span>
              
              <div className="relative z-10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-300"
                  style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full opacity-70 group-hover:animate-ping"></span>
              </div>
              <div className="absolute left-full ml-2 px-2 py-1 bg-card/90 backdrop-blur-sm rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md whitespace-nowrap border">
                {collapsed ? "Expand sidebar" : "Collapse sidebar"} <kbd className="bg-muted/50 px-1.5 ml-1 rounded text-[10px]">Alt+S</kbd>
              </div>
            </button>
          </div>

          {/* User section */}
          <div className={cn(
            "px-3 py-4 flex",
            collapsed ? "justify-center mt-2" : ""
          )}>
            <div className={cn(
              "flex items-center",
              collapsed ? "flex-col" : "space-x-3 bg-accent/20 rounded-lg border border-accent/10 p-3 w-full"
            )}>
              <div className="relative">
                <div className={cn(
                  "rounded-full overflow-hidden border-2 border-primary/30",
                  collapsed ? "w-10 h-10" : "w-12 h-12"
                )}>
                  {user?.user_metadata?.avatar_url ? (
                    <Image 
                      src={user.user_metadata.avatar_url}
                      alt="User avatar" 
                      width={collapsed ? 40 : 48} 
                      height={collapsed ? 40 : 48} 
                      className="object-cover" 
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/15 text-primary">
                      {user?.user_metadata?.name?.[0] || user?.email?.[0] || "U"}
                    </div>
                  )}
                </div>
                <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-primary animate-pulse" />
              </div>
              {!collapsed && (
              <div className="flex flex-col gap-1">
                <div className="font-medium truncate max-w-[150px]">{user?.user_metadata?.name || user?.email?.split('@')[0] || "User"}</div>
                <div className="text-sm text-muted-foreground truncate max-w-[150px]">{user?.email || ""}</div>
              </div>
            )}
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3 py-2">
            {!collapsed && (
              <div className="mb-1 px-4 py-1 bg-accent/10 rounded-md">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">MAIN NAVIGATION</p>
              </div>
            )}
            {collapsed && <div className="h-4"></div>}
            <ul className="space-y-1">
              {navGroups[0].items.map((item, index) => (
                <NavItem 
                  key={item.href} 
                  item={item} 
                  pathname={pathname} 
                  onClick={handleSidebarToggleForMobile}
                  collapsed={collapsed}
                  isLast={index === navGroups[0].items.length - 1}
                />
              ))}
            </ul>

            {!collapsed && (
              <div className="mb-1 px-4 py-1 mt-6 bg-accent/10 rounded-md">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">SYSTEM</p>
              </div>
            )}
            {collapsed && <div className="h-8"></div>}
            <ul className="space-y-1">
              {navGroups[1].items.map((item, index) => (
                <NavItem 
                  key={item.href} 
                  item={item} 
                  pathname={pathname} 
                  onClick={handleSidebarToggleForMobile}
                  collapsed={collapsed}
                  isLast={index === navGroups[1].items.length - 1}
                />
              ))}
            </ul>
          </nav>

          {/* Sidebar footer */}
          <div className={cn(
            "py-4 flex-shrink-0",
            collapsed ? "text-center px-2" : "px-4"
          )}>
            {collapsed ? (
              <div className="flex flex-col items-center gap-3">
                <NotificationCenter />
                <ThemeToggle iconOnly size="sm" />
                <div className="text-xs text-muted-foreground bg-primary/5 py-2 rounded-md">v{appVersion}</div>
              </div>
            ) : (
              <>
                <div className="text-xs text-muted-foreground bg-primary/5 rounded-lg py-3 text-center">
                  Budget Buddy v{appVersion} • <Link href="/dashboard/about" className="hover:underline text-primary/80">About</Link>
                </div>
              
                <div className="flex items-center justify-between mt-4 px-2">
                  <NotificationCenter />
                  <ThemeToggle iconOnly size="sm" />
                  <button
                    className="rounded-full p-2 text-muted-foreground hover:bg-accent/50 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 active:scale-95 transition-all duration-200"
                    onClick={handleSignOut}
                    title="Sign out"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className={`flex-1 pb-16 md:pb-0 transition-all duration-300 ${collapsed ? 'md:ml-[70px]' : 'md:ml-64'}`}>
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
      </main>
    </div>
  );
} 