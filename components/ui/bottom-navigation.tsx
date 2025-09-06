import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart2, PlusCircle, FileText, User, Sparkles } from "lucide-react";
import { memo, useMemo } from "react";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

// Memoized navigation item to prevent unnecessary re-renders
const NavItemButton = memo(({ item }: { item: NavItem }) => (
  <Link
    href={item.href}
    className={`flex h-16 min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-1 p-1 text-xs transition-all duration-200 relative ${
      item.active
        ? "text-primary"
        : "text-muted-foreground hover:text-foreground"
    }`}
    aria-label={item.label}
    aria-current={item.active ? "page" : undefined}
  >
    <div className={`flex h-11 w-11 items-center justify-center rounded-full transition-all ${
      item.active ? "bg-primary/15 scale-105" : "hover:bg-background/80"
    }`}>
      {item.icon}
    </div>
    <span className={`${item.active ? "font-medium" : ""} truncate max-w-full`}>{item.label}</span>
    {item.active && <div className="absolute bottom-0 h-1.5 w-10 rounded-t-full bg-gradient-to-r from-primary to-violet-400 shadow-[0_-2px_5px_rgba(var(--primary-rgb),0.25)]"></div>}
  </Link>
));

NavItemButton.displayName = 'NavItemButton';

// Original function component definition
function BottomNavigationComponent() {
  const pathname = usePathname();
  
  // Use useMemo to avoid recreating nav items on each render
  const navItems = useMemo(() => [
    {
      href: "/dashboard",
      icon: <Home size={22} className="transform transition-transform group-hover:scale-110" />,
      label: "Home",
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/ai-insights",
      icon: <Sparkles size={22} className="transform transition-transform group-hover:scale-110" />,
      label: "AI Insights",
      active: pathname.startsWith("/dashboard/ai-insights"),
    },
    {
      href: "/dashboard/transactions",
      icon: <FileText size={22} className="transform transition-transform group-hover:scale-110" />,
      label: "Transactions",
      active: pathname.startsWith("/dashboard/transactions"),
    },
    {
      href: "/dashboard/budget",
      icon: <BarChart2 size={22} className="transform transition-transform group-hover:scale-110" />,
      label: "Budget",
      active: pathname.startsWith("/dashboard/budget"),
    },
    {
      href: "/dashboard/settings",
      icon: <User size={22} className="transform transition-transform group-hover:scale-110" />,
      label: "Profile",
      active: pathname.startsWith("/dashboard/settings") || pathname.startsWith("/dashboard/profile"),
    },
    // Limited to 5 items for better mobile experience
  ], [pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-xl shadow-lg md:hidden" aria-label="Mobile navigation">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <NavItemButton key={item.href} item={item} />
        ))}
      </div>
      <div className="h-safe-area-bottom bg-background/95"></div>
    </nav>
  );
}

// Function component definition for AddTransactionButton
function AddTransactionButtonComponent({ 
  onClick 
}: { 
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary to-violet-400 text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 md:hidden"
      aria-label="Add Transaction"
    >
      <PlusCircle size={24} />
      <span className="sr-only">Add Transaction</span>
    </button>
  );
}

// Create memoized versions
const MemoizedBottomNavigation = memo(BottomNavigationComponent);
MemoizedBottomNavigation.displayName = 'BottomNavigation';

const MemoizedAddTransactionButton = memo(AddTransactionButtonComponent);
MemoizedAddTransactionButton.displayName = 'AddTransactionButton';

// Export both the memoized versions with the original names
export { MemoizedBottomNavigation as BottomNavigation, MemoizedAddTransactionButton as AddTransactionButton }; 