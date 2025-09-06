"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-cta text-white relative overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated Gradient Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-primary/80"
          animate={{
            backgroundPosition: ["0% 0%", "100% 0%"],
          }}
          transition={{
            duration: 15,
            ease: "linear",
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />

        <div className="absolute top-0 left-0 right-0 h-px bg-white/30"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/30"></div>

        {/* Replace random elements with fixed CTABubbles */}
        <CTABubbles />
      </motion.div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to take control of your finances?</h2>
          <p className="mb-8 text-lg text-white/90">Sign up now and start budgeting like a pro with our AI-powered tools.</p>
          <div className="grid md:grid-cols-5 gap-8 items-center">
            <motion.div
              className="md:col-span-3 text-center md:text-left"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="inline-block px-4 py-1 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium mb-6 border border-white/20"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                <motion.span
                  animate={{
                    color: ["rgba(255,255,255,0.9)", "rgba(255,255,255,1)", "rgba(255,255,255,0.9)"]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Join 10,000+ happy users</span>
                </motion.span>
              </motion.div>

              <motion.h2
                className="text-4xl md:text-5xl font-bold tracking-tight mb-6 relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <motion.span
                  className="absolute -left-4 md:-left-8 top-0 text-6xl opacity-20"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 0.2, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  "
                </motion.span>
                Ready to take control of your{" "}
                <motion.span
                  className="relative inline-block bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80"
                  initial={{ color: "white" }}
                  animate={{
                    textShadow: ["0 0 10px rgba(255,255,255,0)", "0 0 20px rgba(255,255,255,0.5)", "0 0 10px rgba(255,255,255,0)"]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  finances?
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                  />
                </motion.span>
              </motion.h2>

              <motion.p
                className="mb-8 text-lg text-white/90 max-w-xl mx-auto md:mx-0 relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <motion.span
                  className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-white/40 to-transparent rounded-full"
                  initial={{ height: 0 }}
                  whileInView={{ height: "100%" }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                />
                Start your journey to financial freedom today. Our powerful tools make
                budgeting simple, intuitive, and even enjoyable. Join thousands who've
                already transformed their financial future.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <motion.div
                  className="group relative overflow-hidden rounded-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/70 to-pink-500/70 group-hover:from-purple-500/90 group-hover:to-pink-500/90 transition-colors duration-300"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  />
                  <motion.div
                    className="absolute -inset-full h-40 w-40 z-0 rotate-45 transform bg-white opacity-20 group-hover:opacity-30 transition-opacity blur-xl"
                    animate={{
                      left: ["-120%", "200%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                  />
                  <Button asChild size="lg" className="bg-transparent text-white hover:bg-transparent border-0 px-10 py-6 relative z-10 shadow-lg">
                    <Link href="/auth/register">
                      <motion.span
                        className="flex items-center gap-3 text-lg"
                        whileHover={{ x: 3 }}
                        transition={{ duration: 0.2 }}
                      >
                        Get Started — Free
                        <ArrowRight className="h-5 w-5" />
                      </motion.span>
                    </Link>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="relative overflow-hidden rounded-xl"
                >
                  <motion.div
                    className="absolute inset-0 bg-white/5 hover:bg-white/10 transition-colors duration-300"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  />
                  <Button asChild variant="outline" size="lg" className="border-white/40 text-white hover:text-white hover:bg-transparent px-10 py-6 backdrop-blur-sm relative z-10">
                    <Link href="/dashboard">
                      <motion.span
                        className="flex items-center gap-3 text-lg"
                        whileHover={{ x: 3 }}
                        transition={{ duration: 0.2 }}
                      >
                        View Demo
                        <motion.div
                          animate={{
                            x: [0, 4, 0],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                          }}
                        >
                          <ArrowRight className="h-5 w-5" />
                        </motion.div>
                      </motion.span>
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Stats/Testimonial Card */}
            <motion.div
              className="md:col-span-2 perspective"
              initial={{ opacity: 0, scale: 0.95, rotateY: 5 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              whileHover={{ scale: 1.02, rotateY: -2 }}
            >
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl border border-white/20 p-6 shadow-2xl relative overflow-hidden">
                <motion.div
                  className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full filter blur-3xl opacity-50"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.3, 0.5],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-blue-500/10 to-teal-500/10 rounded-full filter blur-3xl opacity-50"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.3, 0.5],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />

                <motion.div
                  className="flex items-center justify-between mb-8 relative"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                    </div>
                    <span className="text-sm font-medium text-white">Verified Results</span>
                  </div>
                  <div className="flex -space-x-3">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-7 h-7 rounded-full border border-white/40 bg-white/20 flex items-center justify-center text-xs font-medium"
                        initial={{ x: 10, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 + (i * 0.1), duration: 0.3 }}
                      >
                        {["A", "B", "C"][i]}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {[
                    { value: "94%", label: "User satisfaction" },
                    { value: "30%", label: "Average savings" },
                    { value: "15min", label: "Setup time" },
                    { value: "100%", label: "Data security" }
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      className="text-center"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + (idx * 0.1), duration: 0.4 }}
                    >
                      <motion.div
                        className="text-2xl font-bold"
                        animate={{
                          textShadow: ["0px 0px 0px rgba(255,255,255,0)", "0px 0px 10px rgba(255,255,255,0.5)", "0px 0px 0px rgba(255,255,255,0)"]
                        }}
                        transition={{
                          duration: 2 + idx,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                      >
                        {stat.value}
                      </motion.div>
                      <div className="text-sm text-white/70">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Testimonial quote */}
                <motion.blockquote
                  className="text-sm text-white/80 border-l-2 border-white/30 pl-4 italic mb-6"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                >
                  "Budget Buddy helped me save for my dream vacation in just 6 months. The visual insights made all the difference!"
                </motion.blockquote>

                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-medium">JD</div>
                  <div>
                    <div className="text-sm font-medium">Jamie Davis</div>
                    <div className="text-xs text-white/70">Saved $4,200 in 6 months</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTABubbles() {
  // Reduce CTA bubbles for better performance
  const CTA_BUBBLES = [
    { width: 270, height: 144, top: "12%", left: "71%", blur: "27px" },
    { width: 231, height: 342, top: "81%", left: "69%", blur: "14px" },
    { width: 308, height: 256, top: "74%", left: "23%", blur: "18px" },
  ];

  return (
    <>
      {CTA_BUBBLES.map((bubble, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full blur-bubble"
          animate={{
            x: [0, 8, 0, -8, 0],
            y: [0, -8, 0, 8, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            repeatType: "loop",
            times: [0, 0.25, 0.5, 0.75, 1],
            ease: "easeInOut",
            delay: index * 0.3,
          }}
          style={{
            width: bubble.width,
            height: bubble.height,
            top: bubble.top,
            left: bubble.left,
          }}
        >
          <div
            className="absolute bg-white/5 rounded-full"
            style={{
              width: `${bubble.width}px`,
              height: `${bubble.height}px`,
              top: bubble.top,
              left: bubble.left,
              transform: "translate(-50%, -50%)",
              filter: `blur(${bubble.blur})`,
            }}
          />
        </motion.div>
      ))}
    </>
  );
}