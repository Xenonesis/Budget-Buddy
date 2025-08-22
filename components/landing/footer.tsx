import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-background to-card border-t overflow-hidden pt-16 pb-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl opacity-70"></div>
        <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-secondary/5 blur-3xl opacity-70"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Footer top section with logo and quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Logo size="sm" withText />
            </div>

            <p className="text-sm text-muted-foreground mb-5 max-w-xs">
              Your personal finance companion for smart budgeting, expense tracking, and financial insights in one beautiful app.
            </p>

            <div className="flex space-x-3 mb-8">
              <a
                href="mailto:itisaddy7@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-background shadow-sm border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:scale-110 transition-all duration-200"
                aria-label="Email"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </a>
              <a
                href="https://www.linkedin.com/in/itisaddy/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-background shadow-sm border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:scale-110 transition-all duration-200"
                aria-label="LinkedIn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a
                href="https://www.instagram.com/i__aditya7/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-background shadow-sm border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:scale-110 transition-all duration-200"
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a
                href="https://github.com/itisaddy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-background shadow-sm border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:scale-110 transition-all duration-200"
                aria-label="GitHub"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
              </a>
            </div>
          </div>

          {/* Navigation columns */}
          {(
            [
              ["Product", ["Features", "Integrations", "Pricing", "Changelog"]], 
              ["Company", ["About Us", "Careers", "Blog", "Press"]], 
              ["Resources", ["Help Center", "Contact Us", "Community", "Status"]], 
              ["Legal", ["Terms of Service", "Privacy Policy", "Cookie Policy", "Compliance"]]
            ] as [string, string[]][]
          ).map(([section, items], i) => (
            <div key={section} className="space-y-4">
              <h3 className="font-semibold text-base">{section}</h3>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href={`/${section.toLowerCase()}/${item.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all inline-block"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer bottom with copyright and links */}
        <div className="mt-12 pt-6 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
            <p className="text-xs text-muted-foreground">© 2024 Budget Buddy. All rights reserved.</p>
            <div className="flex items-center gap-4 md:border-l md:border-border/30 md:pl-4">
              <a href="/legal/privacy-policy" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy</a>
              <a href="/legal/terms-of-service" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms</a>
              <a href="/legal/cookie-policy" className="text-xs text-muted-foreground hover:text-primary transition-colors">Cookies</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative h-8 w-8 bg-background rounded-full border border-border/50 shadow-sm flex items-center justify-center overflow-hidden">
              <ThemeToggle iconOnly />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}