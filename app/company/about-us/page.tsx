import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AboutUsPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background overflow-x-hidden">
      <div className="container mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center mb-6 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>

        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">About Budget Buddy</h1>
          <p className="text-xl text-muted-foreground">
            Our mission is to empower individuals to take control of their finances through
            intuitive tools and actionable insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
          <div>
            <h2 className="text-3xl font-semibold mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Budget Buddy was born from a simple observation: managing personal finances
                shouldn&apos;t be complicated. Founded by Aditya Kumar Tiwari in 2025, our platform
                emerged from the belief that everyone deserves access to powerful yet simple
                financial tools.
              </p>
              <p>
                What started as a personal project to solve his own budgeting challenges quickly
                evolved into a comprehensive platform serving thousands of users worldwide. Today,
                Budget Buddy continues to grow with a focus on intuitive design, powerful analytics,
                and world-class security.
              </p>
              <p>
                Our vision is to create a world where financial stress is eliminated through better
                planning, tracking, and insights. We&apos;re committed to continuous improvement,
                listening to our users, and evolving our platform to meet your changing needs.
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 bg-primary/5 rounded-2xl transform rotate-3"></div>
            <div className="relative bg-card border rounded-2xl p-6 shadow-lg">
              <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center mb-6">
                <div className="text-6xl font-bold text-primary/20">BB</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Key Milestones</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                    <Check size={12} className="text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">2025</span>
                    <p className="text-sm text-muted-foreground">Budget Buddy launched</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                    <Check size={12} className="text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">1,000+ Users</span>
                    <p className="text-sm text-muted-foreground">Reached in first month</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                    <Check size={12} className="text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">AI-Powered Insights</span>
                    <p className="text-sm text-muted-foreground">Introduced advanced analytics</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                    <Check size={12} className="text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">$10M+ Tracked</span>
                    <p className="text-sm text-muted-foreground">In user finances</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t pt-20 mb-20">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4">Our Values</h2>
            <p className="text-muted-foreground">
              These core principles guide everything we do at Budget Buddy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Simplicity',
                description:
                  'We believe financial tools should be intuitive and easy to use, regardless of your financial expertise.',
              },
              {
                title: 'Security',
                description:
                  'Your financial data is sensitive, and we treat it that way with bank-level encryption and strict privacy controls.',
              },
              {
                title: 'Empowerment',
                description:
                  'We provide the insights and tools that empower you to take control of your financial future.',
              },
              {
                title: 'Transparency',
                description:
                  "We're clear about how our platform works, how we use your data, and how we make money.",
              },
              {
                title: 'Innovation',
                description:
                  "We're constantly exploring new ways to improve our platform and provide more value to our users.",
              },
              {
                title: 'Inclusivity',
                description:
                  'We design our platform to be accessible and useful for people from all financial backgrounds.',
              },
            ].map((value, index) => (
              <div
                key={index}
                className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-20 mb-20">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4">Meet the Founder</h2>
            <p className="text-muted-foreground">The passionate mind behind Budget Buddy.</p>
          </div>

          <div className="max-w-4xl mx-auto bg-card border rounded-xl p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-primary/20 flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full" />
              <Image
                src="/1.png"
                alt="Aditya Kumar Tiwari"
                width={144}
                height={144}
                className="object-cover"
                priority
              />
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-1">Aditya Kumar Tiwari</h3>
              <p className="text-primary mb-3">Founder & Developer</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="px-3 py-1">
                  Cybersecurity
                </Badge>
                <Badge variant="secondary" className="px-3 py-1">
                  Web Development
                </Badge>
                <Badge variant="secondary" className="px-3 py-1">
                  UI/UX Design
                </Badge>
              </div>

              <p className="text-muted-foreground mb-6">
                Aditya is a passionate Cybersecurity Specialist and Full-Stack Developer currently
                pursuing a BCA in Cybersecurity at Sushant University. With a keen interest in
                financial technology, he created Budget Buddy to address the common challenges
                people face when managing their finances.
              </p>

              <div className="flex gap-3">
                <Link
                  href="https://www.linkedin.com/in/itisaddy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-200"
                >
                  LinkedIn
                </Link>
                <Link
                  href="https://github.com/itisaddy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-200"
                >
                  GitHub
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 rounded-2xl p-10 text-center max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Join Us on Our Mission</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            We&apos;re just getting started on our journey to revolutionize personal finance
            management. Join thousands of users who are already taking control of their financial
            future with Budget Buddy.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <Button asChild size="lg">
              <Link href="/auth/register">Get Started For Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/resources/contact-us">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
