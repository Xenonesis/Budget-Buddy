'use client';

import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { motion } from 'framer-motion';
import { ArrowUpRight, Heart, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-background via-background/95 to-card border-t overflow-hidden pt-20 pb-8">
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-violet-500/5 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Newsletter section */}
        <motion.div
          className="text-center mb-16 p-8 rounded-2xl bg-gradient-to-r from-primary/5 via-violet-500/5 to-primary/5 border border-primary/10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Stay Updated</span>
          </motion.div>

          <h3 className="text-2xl font-bold mb-2">Get the latest updates</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Subscribe to our newsletter for product updates, financial tips, and exclusive features.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
            <motion.button
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Subscribe
              <ArrowUpRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* Footer top section with logo and quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Enhanced Brand column */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div className="flex items-center gap-3 mb-6" whileHover={{ scale: 1.05 }}>
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-violet-500/20 blur-md" />
                <Logo size="sm" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Budget Buddy
              </span>
            </motion.div>

            <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
              Your personal finance companion for smart budgeting, expense tracking, and financial
              insights in one beautiful app.
            </p>

            {/* Enhanced social links */}
            <div className="flex space-x-3 mb-8">
              {[
                {
                  href: 'mailto:itisaddy7@gmail.com',
                  label: 'Email',
                  icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22,6 12,13 2,6',
                },
                {
                  href: 'https://www.linkedin.com/in/itisaddy/',
                  label: 'LinkedIn',
                  icon: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
                },
                {
                  href: 'https://www.instagram.com/i__aditya7/',
                  label: 'Instagram',
                  icon: 'M2 2h20v20H2z M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01',
                },
                {
                  href: 'https://github.com/itisaddy',
                  label: 'GitHub',
                  icon: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22',
                },
              ].map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm shadow-sm border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary group overflow-hidden"
                  aria-label={social.label}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Hover background effect */}
                  <motion.div
                    className="absolute inset-0 bg-primary/10 rounded-full"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="relative z-10"
                  >
                    <path d={social.icon} />
                  </svg>
                </motion.a>
              ))}
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-500" />
                <span>50k+ Users</span>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Navigation columns */}
          {(
            [
              ['Product', ['Features', 'Integrations', 'Pricing', 'Changelog']],
              ['Company', ['About Us', 'Careers', 'Blog', 'Press']],
              ['Resources', ['Help Center', 'Contact Us', 'Community', 'Status']],
              ['Legal', ['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Compliance']],
            ] as [string, string[]][]
          ).map(([section, items], sectionIndex) => (
            <motion.div
              key={section}
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
            >
              <h3 className="font-semibold text-base text-foreground relative">
                {section}
                <motion.div
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary to-transparent rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: '60%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: sectionIndex * 0.1 + 0.3 }}
                />
              </h3>
              <ul className="space-y-3">
                {items.map((item, itemIndex) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: sectionIndex * 0.1 + itemIndex * 0.05 }}
                  >
                    <motion.a
                      href={`/${section.toLowerCase()}/${item.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-all inline-block group relative"
                      whileHover={{ x: 5 }}
                    >
                      <span className="relative z-10">{item}</span>
                      <motion.div
                        className="absolute inset-0 -left-2 -right-2 bg-primary/5 rounded-md opacity-0 group-hover:opacity-100"
                        initial={{ scale: 0.8 }}
                        whileHover={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Footer bottom with copyright and links */}
        <motion.div
          className="mt-16 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <motion.p
              className="text-sm text-muted-foreground flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              © 2025 Budget Buddy. Made with
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Heart className="w-4 h-4 text-red-500 fill-current" />
              </motion.span>
              for better finances.
            </motion.p>

            <div className="flex items-center gap-6 md:border-l md:border-border/30 md:pl-6">
              {[
                { href: '/legal/privacy-policy', text: 'Privacy' },
                { href: '/legal/terms-of-service', text: 'Terms' },
                { href: '/legal/cookie-policy', text: 'Cookies' },
              ].map((link, index) => (
                <motion.a
                  key={link.text}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors relative group"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  {link.text}
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Enhanced theme toggle */}
            <motion.div
              className="relative h-10 w-10 bg-background/80 backdrop-blur-sm rounded-full border border-border/50 shadow-sm flex items-center justify-center overflow-hidden group"
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/10 to-violet-500/10 rounded-full opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.2 }}
              />
              <ThemeToggle iconOnly />
            </motion.div>

            {/* Back to top button */}
            <motion.button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="h-10 w-10 bg-primary/10 hover:bg-primary/20 rounded-full border border-primary/20 flex items-center justify-center text-primary hover:text-primary transition-all group"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowUpRight className="w-4 h-4 rotate-45" />
              </motion.div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
