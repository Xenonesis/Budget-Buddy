"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Alex Johnson",
    title: "Small Business Owner",
    company: "Johnson's Coffee Roasters",
    quote: "Budget Buddy completely transformed how I manage both my personal and business finances. The AI categorization caught subscription services I'd forgotten about, saving me $180/month. The business expense tracking helped me identify that I was overspending on supplies by 30%. In just one year, I've saved over $5,200 and increased my profit margins significantly.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    rating: 5,
    savings: "$5,200",
    timeUsing: "14 months",
    location: "Portland, OR"
  },
  {
    name: "Sarah Williams",
    title: "Certified Financial Planner",
    company: "Williams Wealth Management",
    quote: "I recommend Budget Buddy to all my clients because it bridges the gap between professional financial planning and daily money management. The goal tracking feature has a 73% higher success rate compared to traditional methods I've seen. My clients love the visual progress indicators and automated insights. It's become an essential tool in my practice.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    rating: 5,
    savings: "Helps clients save avg $3,400/year",
    timeUsing: "2+ years",
    location: "Austin, TX"
  },
  {
    name: "Michael Chen",
    title: "Senior Software Engineer",
    company: "TechFlow Solutions",
    quote: "As someone who was terrible at tracking expenses, this app has been a game-changer. The automated categorization is incredibly accurate - it correctly identifies 95% of my transactions. I used to spend 2-3 hours monthly on budgeting; now it takes me 15 minutes. The investment tracking feature helped me rebalance my portfolio and I'm up 12% this year.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    rating: 5,
    savings: "5+ hours monthly",
    timeUsing: "18 months",
    location: "San Francisco, CA"
  },
  {
    name: "Priya Patel",
    title: "Graduate Student",
    company: "Stanford University",
    quote: "Living on a $1,800/month stipend was challenging until I found Budget Buddy. The student discount made it affordable, and the app showed me I was spending $340/month on food delivery! Now I meal prep and cook more, saving $200/month. The goal feature helped me save $2,400 for a summer research trip to India. As a data science student, I love the detailed analytics.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    rating: 5,
    savings: "$2,400 goal achieved",
    timeUsing: "10 months",
    location: "Palo Alto, CA"
  },
  {
    name: "David Kim",
    title: "Emergency Room Physician",
    company: "Metro General Hospital",
    quote: "Working irregular hours made budgeting nearly impossible. Budget Buddy's automated tracking handles everything while I focus on saving lives. The goal setting feature helped me save $45,000 for a house down payment in 18 months. The bill reminders ensure I never miss payments despite my chaotic schedule. The family plan helps my wife and I coordinate our finances seamlessly.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    rating: 5,
    savings: "$45,000 house fund",
    timeUsing: "2 years",
    location: "Chicago, IL"
  },
  {
    name: "Emma Rodriguez",
    title: "Marketing Director",
    company: "BrandForward Agency",
    quote: "I've tried Mint, YNAB, PocketGuard, and others, but Budget Buddy strikes the perfect balance between powerful features and ease of use. The AI insights revealed I was spending $450/month on work lunches and coffee. Now I budget $200 and bring lunch twice a week. The custom reports help me track business expenses for tax season. Highly recommend to any professional!",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    rating: 5,
    savings: "$3,000 annually",
    timeUsing: "16 months",
    location: "Denver, CO"
  },
  {
    name: "James Thompson",
    title: "Retired Teacher",
    company: "Lincoln Elementary (Retired)",
    quote: "At 67, I thought I was too old to learn new technology, but Budget Buddy's interface is so intuitive! It helps me manage my pension, Social Security, and retirement savings all in one place. The bill tracking ensures I never miss my medication refills or insurance payments. I've optimized my fixed income and even found ways to save $150/month on utilities and subscriptions.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    rating: 5,
    savings: "$1,800 annually",
    timeUsing: "8 months",
    location: "Phoenix, AZ"
  },
  {
    name: "Lisa Park",
    title: "Working Mother of 3",
    company: "Park Family Household",
    quote: "Managing finances for a family of 5 was overwhelming until we started using Budget Buddy's Family plan. The kids' allowance tracking teaches financial responsibility, and shared budgets keep my husband and I aligned. We discovered we were spending $800/month on groceries and dining out. Now we budget $500 and meal plan together. We've saved enough for a Disney vacation!",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    rating: 5,
    savings: "$4,200 vacation fund",
    timeUsing: "13 months",
    location: "Orlando, FL"
  }
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 md:py-32 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent opacity-30"
        animate={{
          y: ["0%", "100%"],
        }}
        transition={{
          duration: 20,
          ease: "linear",
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />

      <div className="container mx-auto px-4 relative">
        <motion.div
          className="max-w-xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h3
            className="text-sm text-primary font-medium uppercase tracking-wider mb-2"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            Testimonials
          </motion.h3>
          <motion.h2
            className="text-3xl font-bold tracking-tight sm:text-4xl mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Hear what our users are saying
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Real stories from real people who have taken control of their finances with our platform.
          </motion.p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={testimonial.name}
              className="flex flex-col h-full bg-glass border rounded-xl p-6 relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, boxShadow: "0 10px 30px -15px rgba(0,0,0,0.1)" }}
            >
              <motion.div
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/5 via-primary/40 to-primary/5 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 + 0.2, duration: 0.6 }}
              />

              <div className="mb-4 flex">
                {[...Array(5)].map((_, starIdx) => (
                  <motion.div
                    key={starIdx}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: idx * 0.1 + 0.3 + starIdx * 0.05,
                      duration: 0.3,
                      type: "spring"
                    }}
                  >
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  </motion.div>
                ))}
              </div>

              <motion.blockquote
                className="flex-1 mb-4 text-muted-foreground relative"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 + 0.3, duration: 0.5 }}
              >
                <motion.span
                  className="absolute -top-2 -left-1 text-4xl text-primary/20"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 + 0.2, duration: 0.4 }}
                >
                  "
                </motion.span>
                {testimonial.quote}
              </motion.blockquote>

              <motion.div
                className="flex items-center mt-auto"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 + 0.4, duration: 0.5 }}
              >
                <motion.img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full mr-3 border-2 border-primary/20"
                  whileHover={{ scale: 1.1, borderColor: "var(--primary)" }}
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 + 0.5, duration: 0.4 }}
                />
                <div>
                  <motion.div
                    className="font-medium"
                    initial={{ opacity: 0, y: 5 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 + 0.5, duration: 0.3 }}
                  >
                    {testimonial.name}
                  </motion.div>
                  <motion.div
                    className="text-sm text-muted-foreground"
                    initial={{ opacity: 0, y: 5 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 + 0.6, duration: 0.3 }}
                  >
                    {testimonial.title}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}