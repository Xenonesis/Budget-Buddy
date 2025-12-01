'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

// Static stats data
const stats = [
  { value: '94%', label: 'User satisfaction' },
  { value: '30%', label: 'Average savings' },
  { value: '15min', label: 'Setup time' },
  { value: '100%', label: 'Data security' },
] as const;

// Memoized bubbles component with reduced animations
const CTABubbles = memo(function CTABubbles() {
  return (
    <>
      <div
        className="absolute rounded-full bg-white/5 blur-bubble transform-gpu"
        style={{
          width: 270,
          height: 144,
          top: '12%',
          left: '71%',
          filter: 'blur(27px)',
        }}
      />
      <div
        className="absolute rounded-full bg-white/5 blur-bubble transform-gpu"
        style={{
          width: 231,
          height: 342,
          top: '81%',
          left: '69%',
          filter: 'blur(14px)',
        }}
      />
      <div
        className="absolute rounded-full bg-white/5 blur-bubble transform-gpu"
        style={{
          width: 308,
          height: 256,
          top: '74%',
          left: '23%',
          filter: 'blur(18px)',
        }}
      />
    </>
  );
});

// Memoized stats card
const StatsCard = memo(function StatsCard() {
  return (
    <motion.div
      className="md:col-span-2"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3, duration: 0.6 }}
    >
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl border border-white/20 p-6 shadow-2xl relative overflow-hidden transform-gpu">
        {/* Static gradient orbs instead of animated */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full filter blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-blue-500/10 to-teal-500/10 rounded-full filter blur-3xl opacity-50" />

        <div className="flex items-center justify-between mb-8 relative">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20">
              <CheckCircle className="h-4 w-4 text-green-300" />
            </div>
            <span className="text-sm font-medium text-white">Verified Results</span>
          </div>
          <div className="flex -space-x-3">
            {['A', 'B', 'C'].map((letter, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border border-white/40 bg-white/20 flex items-center justify-center text-xs font-medium"
              >
                {letter}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-white/70">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonial quote */}
        <blockquote className="text-sm text-white/80 border-l-2 border-white/30 pl-4 italic mb-6">
          &quot;Budget Buddy helped me save for my dream vacation in just 6 months. The visual
          insights made all the difference!&quot;
        </blockquote>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-medium">
            JD
          </div>
          <div>
            <div className="text-sm font-medium">Jamie Davis</div>
            <div className="text-xs text-white/70">Significant savings achieved</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export const CTASection = memo(function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-cta text-white relative overflow-hidden">
      <div className="absolute inset-0">
        {/* Static gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-primary/80" />
        <div className="absolute top-0 left-0 right-0 h-px bg-white/30"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/30"></div>
        <CTABubbles />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to take control of your finances?</h2>
          <p className="mb-8 text-lg text-white/90">
            Sign up now and start budgeting like a pro with our AI-powered tools.
          </p>
          <div className="grid md:grid-cols-5 gap-8 items-center">
            <motion.div
              className="md:col-span-3 text-center md:text-left"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-block px-4 py-1 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium mb-6 border border-white/20">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Join 10,000+ happy users</span>
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 relative">
                <span className="absolute -left-4 md:-left-8 top-0 text-6xl opacity-20">
                  &quot;
                </span>
                Ready to take control of your{' '}
                <span className="relative inline-block bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                  finances?
                  <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full w-full" />
                </span>
              </h2>

              <p className="mb-8 text-lg text-white/90 max-w-xl mx-auto md:mx-0 relative">
                <span className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-white/40 to-transparent rounded-full" />
                Start your journey to financial freedom today. Our powerful tools make budgeting
                simple, intuitive, and even enjoyable. Join thousands who&apos;ve already
                transformed their financial future.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <div className="group relative overflow-hidden rounded-xl transform-gpu transition-transform duration-200 hover:scale-105 active:scale-95">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/70 to-pink-500/70 group-hover:from-purple-500/90 group-hover:to-pink-500/90 transition-colors duration-300" />
                  <Button
                    asChild
                    size="lg"
                    className="bg-transparent text-white hover:bg-transparent border-0 px-10 py-6 relative z-10 shadow-lg"
                  >
                    <Link href="/auth/register">
                      <span className="flex items-center gap-3 text-lg">
                        Get Started — Free
                        <ArrowRight className="h-5 w-5" />
                      </span>
                    </Link>
                  </Button>
                </div>

                <div className="relative overflow-hidden rounded-xl transform-gpu transition-transform duration-200 hover:scale-105 active:scale-95">
                  <div className="absolute inset-0 bg-white/5 hover:bg-white/10 transition-colors duration-300" />
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-white/40 text-white hover:text-white hover:bg-transparent px-10 py-6 backdrop-blur-sm relative z-10"
                  >
                    <Link href="/dashboard">
                      <span className="flex items-center gap-3 text-lg">
                        View Demo
                        <ArrowRight className="h-5 w-5" />
                      </span>
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>

            <StatsCard />
          </div>
        </div>
      </div>
    </section>
  );
});
