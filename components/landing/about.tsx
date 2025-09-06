"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Building, Mail, Award, Users, Zap, Target, Shield, DollarSign, TrendingDown, Plus, Minus, HelpCircle } from "lucide-react";
import Link from "next/link";

export function AboutSection() {
  // Meet The Developer section commented out as requested
  return null;
  /*
  return (
    <section id="about" className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-secondary/10 blur-3xl"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet The Developer</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Passion, innovation, and expertise driving Budget Buddy to help you achieve financial freedom
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-border/40 max-w-5xl mx-auto"
        >
          <div className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <motion.div
                className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-primary/20 flex-shrink-0"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full" />
                <Image
                  src="/1.png"
                  alt="Aditya Kumar Tiwari"
                  width={144}
                  height={144}
                  className="object-cover"
                  priority
                />
              </motion.div>

              <div className="flex-1 text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h3 className="text-2xl font-bold mb-1">Aditya Kumar Tiwari</h3>
                  <p className="text-primary mb-3">Cybersecurity Enthusiast | Web Developer | Lifelong Learner</p>

                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                    <Badge variant="secondary" className="px-3 py-1">Cybersecurity</Badge>
                    <Badge variant="secondary" className="px-3 py-1">Python</Badge>
                    <Badge variant="secondary" className="px-3 py-1">JavaScript</Badge>
                    <Badge variant="secondary" className="px-3 py-1">HTML/CSS</Badge>
                    <Badge variant="secondary" className="px-3 py-1">Linux</Badge>
                  </div>

                  <p className="text-muted-foreground mb-6">
                    Aditya is a passionate Cybersecurity Specialist and Full-Stack Developer currently pursuing a BCA in
                    Cybersecurity at Sushant University. He thrives at the intersection of technology and innovation,
                    crafting secure and scalable solutions for real-world challenges.
                  </p>

                  <div className="flex gap-3 justify-center md:justify-start">
                    <Link
                      href="https://iaddy.netlify.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-200"
                    >
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
                        className="mr-2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      Portfolio
                    </Link>
                    <Link
                      href="https://www.linkedin.com/in/itisaddy/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-200"
                    >
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
                        className="mr-2"
                      >
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect x="2" y="9" width="4" height="12" />
                        <circle cx="4" cy="4" r="2" />
                      </svg>
                      LinkedIn
                    </Link>
                    <Link
                      href="https://www.instagram.com/i__aditya7/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-200"
                    >
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
                        className="mr-2"
                      >
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                      </svg>
                      Instagram
                    </Link>
                  </div>

                  <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-card/80 border border-border/50 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      <a href="mailto:itisaddy7@gmail.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">itisaddy7@gmail.com</a>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>

            <motion.div
              className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                  Professional Experience
                </h4>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-background transition-colors duration-300">
                    <div className="font-medium">Mentor (Part-time)</div>
                    <div className="text-sm text-muted-foreground">JhaMobii Technologies Pvt. Ltd., Remote</div>
                    <div className="text-xs text-primary mb-2">Aug 2024 - Present</div>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Provided technical mentorship in cybersecurity</li>
                      <li>• Guided team members through vulnerability assessments</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-background transition-colors duration-300">
                    <div className="font-medium">Cybersecurity Intern</div>
                    <div className="text-sm text-muted-foreground">Null, Remote</div>
                    <div className="text-xs text-primary mb-2">Jun 2024 - Present</div>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Conducted vulnerability assessments</li>
                      <li>• Monitored network traffic and responded to security incidents</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                  Certifications
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="py-2 px-3 rounded-lg border border-primary/30 bg-primary/5 text-primary font-medium text-sm text-center">Foundations of Cybersecurity</div>
                  <div className="py-2 px-3 rounded-lg border border-primary/30 bg-primary/5 text-primary font-medium text-sm text-center">Cyber Threat Management</div>
                  <div className="py-2 px-3 rounded-lg border border-primary/30 bg-primary/5 text-primary font-medium text-sm text-center">OSForensics Triage</div>
                  <div className="py-2 px-3 rounded-lg border border-primary/30 bg-primary/5 text-primary font-medium text-sm text-center">Endpoint Security</div>
                  <div className="py-2 px-3 rounded-lg border border-primary/30 bg-primary/5 text-primary font-medium text-sm text-center">ISO 27001</div>
                  <div className="py-2 px-3 rounded-lg border border-primary/30 bg-primary/5 text-primary font-medium text-sm text-center">Ethical Hacker</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
  */
}