'use client';

/**
 * Dashboard Layout Component
 *
 * IMPORTANT: Page Content Spacing Standards
 * ==========================================
 * All dashboard pages should use consistent padding to maintain uniform spacing
 * between the sidebar and page content across all pages.
 *
 * Standard padding pattern:
 * - className="container mx-auto px-4 py-6 md:px-6 md:py-6 lg:px-8 lg:py-8 max-w-{size}"
 *
 * Breakdown:
 * - Mobile (default): px-4 (16px horizontal), py-6 (24px vertical)
 * - Tablet (md): px-6 (24px horizontal), py-6 (24px vertical)
 * - Desktop (lg): px-8 (32px horizontal), py-8 (32px vertical)
 *
 * This ensures:
 * 1. Consistent left margin from sidebar across all pages
 * 2. Uniform vertical spacing from top
 * 3. Responsive padding that scales appropriately
 * 4. Professional, cohesive user experience
 *
 * ⚠️ Do NOT use:
 * - `p-4 md:p-6` (doesn't scale properly on large screens)
 * - `pr-4` or `pl-4` only (creates inconsistent horizontal spacing)
 * - `px-3 sm:px-4` (non-standard breakpoints)
 *
 * ✅ Use the standard pattern above for all new dashboard pages
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  useState,
  useEffect,
  useCallback,
  memo,
  useRef,
  useMemo,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ensureUserProfile } from '@/lib/utils';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Logo } from '@/components/ui/logo';
import { NotificationCenter } from '@/components/ui/notification-center';
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
  Globe,
} from 'lucide-react';
import Image from 'next/image';
import { cn, getAppVersion } from '@/lib/utils';

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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
    setInitialized,
  } = useUserPreferences();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const firstNavItemRef = useRef<HTMLAnchorElement>(null);
  const lastNavItemRef = useRef<HTMLAnchorElement>(null);
  const appVersion = getAppVersion();

  // Organize navigation items into groups - memoized for performance
  const navGroups: NavGroup[] = useMemo(
    () => [
      {
        title: 'Main Navigation',
        items: [
          {
            title: 'Dashboard',
            href: '/dashboard',
            icon: <LayoutGrid className="h-5 w-5" />,
            label: 'Dashboard',
            shortcutKey: 'Alt+1',
          },
          {
            title: 'Transactions',
            href: '/dashboard/transactions',
            icon: <ArrowRightLeft className="h-5 w-5" />,
            label: 'Transactions',
            shortcutKey: 'Alt+4',
          },
          {
            title: 'Budget',
            href: '/dashboard/budget',
            icon: <GanttChartSquare className="h-5 w-5" />,
            label: 'Budget',
            shortcutKey: 'Alt+3',
          },
          {
            title: 'Analytics',
            href: '/dashboard/analytics',
            icon: <BarChart3 className="h-5 w-5" />,
            label: 'Analytics',
            shortcutKey: 'Alt+2',
          },
          {
            title: 'Financial Insights',
            href: '/dashboard/financial-insights',
            icon: <TrendingUp className="h-5 w-5" />,
            label: 'Financial Insights',
            shortcutKey: 'Alt+5',
          },
          {
            title: 'AI Insights',
            href: '/dashboard/ai-insights',
            icon: <Lightbulb className="h-5 w-5" />,
            label: 'AI Insights',
            shortcutKey: 'Alt+6',
          },
          {
            title: 'Notifications',
            href: '/dashboard/notifications',
            icon: <Bell className="h-5 w-5" />,
            label: 'Notifications',
            shortcutKey: 'Alt+7',
          },
        ],
      },
      {
        title: 'System',
        items: [
          {
            title: 'Settings',
            href: '/dashboard/settings',
            icon: <Settings className="h-5 w-5" />,
            label: 'Settings',
            shortcutKey: 'Alt+,',
          },
          {
            title: 'About',
            href: '/dashboard/about',
            icon: <LifeBuoy className="h-5 w-5" />,
            label: 'About',
          },
          {
            title: 'Nitrolite',
            href: 'https://nitrolite.vercel.app',
            icon: <Globe className="h-5 w-5" />,
            label: 'Nitrolite',
          },
        ],
      },
    ],
    []
  );

  // Define all useCallback hooks at component level, not conditionally
  const handleSignOut = useCallback(async () => {
    // Clear user preferences when signing out
    setUserId(null);
    setUsername('');
    setCurrency('USD');

    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  }, [router, setUserId, setUsername, setCurrency]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const newState = !prev;
      // Save state to localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar-collapsed', newState.toString());
      }
      return newState;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsMobileSidebarOpen((prev) => !prev);

    // Add a class to show the sidebar but preserve scrolling
    document.documentElement.classList.toggle('sidebar-open');

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
    document.documentElement.classList.remove('sidebar-open');

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
  const NavItemComponent = useCallback(
    ({
      item,
      pathname,
      onClick,
      collapsed,
      isLast,
    }: {
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
        className: `flex items-center gap-3 px-4 py-3 font-mono font-bold text-sm uppercase transition-all duration-200 group border-2 ${
          isActive
            ? 'bg-primary text-primary-foreground border-foreground shadow-[4px_4px_0px_hsl(var(--foreground))] scale-[1.02] z-10'
            : 'bg-transparent text-foreground border-transparent hover:bg-foreground hover:text-background hover:border-foreground hover:shadow-[4px_4px_0px_hsl(var(--primary))] hover:-translate-y-1 hover:translate-x-1'
        }`,
        onClick,
        title: collapsed ? item.title : undefined,
        'data-testid': `nav-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`,
        'aria-label': item.shortcutKey
          ? `${item.title} (Shortcut: ${item.shortcutKey})`
          : item.title,
      };

      return (
        <li className="mb-2">
          {isExternal ? (
            <a href={item.href} target="_blank" rel="noopener noreferrer" {...commonProps}>
              {/* Icon */}
              <span
                className={`relative z-10 flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'text-primary-foreground'
                    : 'text-foreground group-hover:text-background'
                }`}
                aria-hidden="true"
              >
                {item.icon}
              </span>

              {/* Title text */}
              <span
                className={`relative z-10 transition-all duration-200 tracking-widest ${
                  collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                }`}
              >
                {item.title}
              </span>

              {/* Keyboard shortcut */}
              {item.shortcutKey && !collapsed && (
                <kbd className={`relative z-10 hidden sm:flex items-center justify-center ml-auto px-2 py-1 text-[10px] font-mono font-bold border-2 ${isActive ? 'bg-background text-foreground border-foreground' : 'bg-transparent text-foreground border-foreground group-hover:bg-background group-hover:text-foreground'}`}>
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
              {/* Icon */}
              <span
                className={`relative z-10 flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'text-primary-foreground'
                    : 'text-foreground group-hover:text-background'
                }`}
                aria-hidden="true"
              >
                {item.icon}
              </span>

              {/* Title text */}
              <span
                className={`relative z-10 transition-all duration-200 tracking-widest ${
                  collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                }`}
              >
                {item.title}
              </span>

              {/* Keyboard shortcut */}
              {item.shortcutKey && !collapsed && (
                <kbd className={`relative z-10 hidden sm:flex items-center justify-center ml-auto px-2 py-1 text-[10px] font-mono font-bold border-2 ${isActive ? 'bg-background text-foreground border-foreground' : 'bg-transparent text-foreground border-foreground group-hover:bg-background group-hover:text-foreground'}`}>
                  {item.shortcutKey}
                </kbd>
              )}
            </Link>
          )}
        </li>
      );
    },
    []
  );

  const NavSectionHeaderComponent = useCallback(
    ({ title, collapsed }: { title: string; collapsed: boolean }) => {
      if (collapsed) return null;

      return (
        <div className="mb-4 px-4 transition-all duration-300 py-1 bg-foreground text-background border-y-2 border-foreground mt-4">
          <p className="text-xs font-bold uppercase tracking-widest">
            {title}
          </p>
        </div>
      );
    },
    []
  );

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
          router.push('/auth/login');
          return;
        }

        setUser(data.user);

        // Set the user ID in the store
        setUserId(data.user.id);

        // Add detailed console logging to debug user information
        console.log('User authenticated:', {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name,
          metadata: data.user.user_metadata,
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
            console.log('Profile creation failed on first attempt, retrying once...');
            // Wait 1 second before retrying
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Retry once
            await ensureUserProfile(
              data.user.id,
              data.user.email,
              data.user.user_metadata?.name,
              preferredCurrency
            );
          }
        } catch (profileError) {
          console.error('Error ensuring user profile:', profileError);
          // Continue anyway - the app can still function without a complete profile
        }

        // Sync user preferences if not already initialized
        if (!initialized || userId !== data.user.id) {
          await syncWithDatabase();
          setInitialized(true);
        }
      } catch (error) {
        console.error('Error getting user:', error);
        // If we get a 401 error, redirect to login
        if (
          typeof error === 'object' &&
          error !== null &&
          'status' in error &&
          error.status === 401
        ) {
          router.push('/auth/login');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && isMounted) {
        router.push('/auth/login');
      }
    });

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

  return (
    <div className="relative min-h-screen">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-16 md:h-16 items-center justify-between border-b-4 border-foreground bg-paper px-4 shadow-[0px_4px_0px_hsl(var(--foreground))] pt-safe md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 font-display font-black uppercase tracking-widest text-foreground bg-foreground text-background px-3 py-1 border-2 border-foreground shadow-[2px_2px_0px_hsl(var(--foreground))]">
          <Logo size="sm" /> BUDGET BUDDY
        </Link>
        <div className="flex items-center gap-3">
          <NotificationCenter />
          <ThemeToggle iconOnly />
          <button
            className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background shadow-[4px_4px_0px_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[0px_0px_0px_transparent] transition-all focus:outline-none"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
            aria-expanded={isMobileSidebarOpen}
            aria-controls="mobile-sidebar"
          >
            <Menu className="h-6 w-6" strokeWidth={3} />
          </button>
        </div>
      </header>

      {/* Backdrop for mobile sidebar */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm sidebar-backdrop md:hidden z-[60]"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <div
        ref={sidebarRef}
        id="mobile-sidebar"
        className={cn(
          'fixed top-0 left-0 z-[70] h-full bg-paper border-r-4 border-foreground md:hidden',
          'transition-transform duration-300 ease-in-out transform',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-hidden={!isMobileSidebarOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        <div className="flex flex-col h-full w-80 pt-5 pb-4 px-4 overflow-y-auto overflow-x-hidden">
          <div className="flex items-center justify-between mb-6 px-3">
            <div className="flex flex-col items-center bg-foreground text-background border-2 border-foreground px-4 py-2 shadow-[4px_4px_0px_hsl(var(--foreground))]">
              <Logo
                size="md"
                className="transition-transform duration-300 hover:scale-105"
                animated
              />
              <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest mt-1 uppercase">
                SMM
              </span>
            </div>
            <button
              type="button"
              className="border-2 border-foreground bg-background text-foreground rounded-none p-2 hover:bg-foreground hover:text-background shadow-[4px_4px_0px_hsl(var(--foreground))] hover:shadow-[0px_0px_0px_transparent] hover:translate-x-1 hover:translate-y-1 focus:outline-none transition-all"
              onClick={() => setIsMobileSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" strokeWidth={3} />
            </button>
          </div>

          {/* User section */}
          <div className="flex items-center justify-between px-4 py-4 mb-4 bg-primary text-primary-foreground border-4 border-foreground shadow-[8px_8px_0px_hsl(var(--foreground))] relative">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center border-2 border-foreground bg-background text-foreground font-display font-black text-xl">
                  {user?.user_metadata?.name?.[0] || user?.email?.[0] || 'U'}
                </div>
              </div>
              <div className="flex flex-col gap-0">
                <p className="text-sm font-bold font-mono uppercase truncate max-w-[120px] bg-background text-foreground px-1 py-0.5">
                  {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs font-mono font-bold mt-1 truncate max-w-[120px] opacity-80">
                  {user?.email || ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle iconOnly size="sm" />
              <button
                className="border-2 border-foreground bg-background text-foreground p-2 hover:bg-foreground hover:text-background shadow-[4px_4px_0px_hsl(var(--foreground))] hover:shadow-[2px_2px_0px_hsl(var(--foreground))] hover:translate-x-1 hover:-translate-y-1 transition-all"
                onClick={handleSignOut}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" strokeWidth={3} />
              </button>
            </div>
          </div>

          <nav className="flex-1 space-y-2 py-2">
            <div className="mb-1 px-4 py-1 bg-accent/10 rounded-md">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">
                MAIN NAVIGATION
              </p>
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
              <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">
                SYSTEM
              </p>
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
            <div className="px-4 py-3 bg-foreground text-background border-4 border-foreground shadow-[4px_4px_0px_hsl(var(--foreground))] text-center">
              <span className="text-xs font-mono font-bold uppercase tracking-widest">BUDGET BUDDY V{appVersion}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div
        className={cn(
          'hidden md:flex h-screen fixed left-0 top-0 bottom-0 flex-col z-30 bg-paper border-r-4 border-foreground shadow-[8px_0px_0px_hsl(var(--foreground))]',
          'transition-all duration-300 ease-in-out',
          collapsed ? 'w-[90px]' : 'w-64'
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="relative flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden scrollbar-thin">
          {/* Sidebar header with toggle */}
          <div
            className={cn(
              'flex items-center h-16 flex-shrink-0 px-4 relative',
              collapsed ? 'justify-center' : 'justify-between'
            )}
          >
            {!collapsed && (
              <div className="flex flex-col items-center">
                <Logo
                  size="md"
                  className="transition-transform duration-300 hover:scale-105"
                  animated
                />
                <span className="text-[10px] sm:text-xs text-muted-foreground mt-1 tracking-wide">
                  Smart Money Management
                </span>
              </div>
            )}
            {collapsed && (
              <div className="flex flex-col items-center">
                <Logo
                  size="xs"
                  className="transition-transform duration-300 hover:scale-105"
                  animated
                />
                <span className="text-[8px] text-muted-foreground mt-0.5 tracking-wide opacity-70">
                  SMM
                </span>
              </div>
            )}

            {/* Toggle button - always visible */}
            <button
              className={cn(
                'flex h-10 w-10 items-center justify-center border-2 border-foreground bg-foreground text-background focus:outline-none hover:bg-primary hover:text-primary-foreground hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_hsl(var(--foreground))] transition-all duration-200 group relative overflow-visible shadow-[2px_2px_0px_hsl(var(--primary))]',
                collapsed ? 'bg-background text-foreground' : ''
              )}
              onClick={toggleCollapsed}
              aria-label="Toggle sidebar"
              aria-expanded={!collapsed}
              title={collapsed ? 'Expand sidebar (Alt+S)' : 'Collapse sidebar (Alt+S)'}
            >

              <div className="relative z-10">
                <ChevronLeft
                  className={cn(
                    'h-5 w-5 transition-transform duration-300 group-hover:scale-110',
                    collapsed ? 'rotate-180' : 'rotate-0'
                  )}
                />
                {collapsed && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full opacity-70 group-hover:animate-ping"></span>
                )}
              </div>

              {/* Tooltip */}
              <div
                className={cn(
                  'absolute px-3 py-2 bg-card/95 backdrop-blur-sm rounded-md text-sm opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg whitespace-nowrap border border-border/50 z-50',
                  collapsed ? 'left-full ml-3 top-1/2 -translate-y-1/2' : 'left-full ml-3'
                )}
              >
                {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                <kbd className="bg-muted/70 px-2 py-0.5 ml-2 rounded text-xs font-mono">Alt+S</kbd>
              </div>
            </button>
          </div>

          {/* User section */}
          <div className={cn('px-4 py-6 flex border-b-4 border-foreground mb-4', collapsed ? 'justify-center' : '')}>
            <div
              className={cn(
                'flex items-center',
                collapsed
                  ? 'flex-col'
                  : 'space-x-3 bg-primary text-primary-foreground border-2 border-foreground shadow-[4px_4px_0px_hsl(var(--foreground))] p-3 w-full'
              )}
            >
              <div className="relative">
                <div
                  className={cn(
                    'border-2 border-foreground bg-background text-foreground flex items-center justify-center font-display font-black',
                    collapsed ? 'w-10 h-10' : 'w-12 h-12'
                  )}
                >
                  {user?.user_metadata?.avatar_url ? (
                    <Image
                      src={user.user_metadata.avatar_url}
                      alt="User avatar"
                      width={collapsed ? 40 : 48}
                      height={collapsed ? 40 : 48}
                      className="object-cover"
                    />
                  ) : (
                    <span>
                      {user?.user_metadata?.name?.[0] || user?.email?.[0] || 'U'}
                    </span>
                  )}
                </div>
              </div>
              {!collapsed && (
                <div className="flex flex-col gap-0 overflow-hidden">
                  <div className="font-mono font-bold uppercase truncate max-w-[130px] text-sm tracking-tight text-foreground bg-background px-1">
                    {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="text-xs font-mono truncate max-w-[130px] mt-1 line-clamp-1">
                    {user?.email || ''}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3 py-2">
            {!collapsed && (
              <div className="mb-1 px-4 py-1 bg-accent/10 rounded-md">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">
                  MAIN NAVIGATION
                </p>
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
                <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">
                  SYSTEM
                </p>
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
          <div className={cn('py-6 flex-shrink-0 border-t-4 border-foreground mt-auto bg-foreground text-background', collapsed ? 'text-center px-2' : 'px-4')}>
            {collapsed ? (
              <div className="flex flex-col items-center gap-4">
                <NotificationCenter />
                <ThemeToggle iconOnly size="sm" />
                <div className="text-[10px] font-mono font-bold uppercase py-2">
                  V{appVersion}
                </div>
              </div>
            ) : (
              <>
                <div className="text-xs font-mono font-bold uppercase py-2 text-center border-2 border-transparent hover:border-background hover:bg-background/20 transition-colors cursor-pointer mb-4">
                  Budget Buddy v{appVersion}
                </div>

                <div className="flex items-center justify-between px-2">
                  <NotificationCenter />
                  <ThemeToggle iconOnly size="sm" />
                  <button
                    className="border-2 border-background p-2 hover:bg-primary hover:text-primary-foreground hover:border-foreground hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_hsl(var(--foreground))] transition-all duration-200"
                    onClick={handleSignOut}
                    title="SIGN OUT"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={3} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main
        className={`flex-1 pb-16 md:pb-0 transition-all duration-300 ${collapsed ? 'md:ml-[90px]' : 'md:ml-64'}`}
      >
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
      </main>
    </div>
  );
}
