import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PieChart, LineChart, Wallet, TrendingUp, Calendar, ShieldCheck } from "lucide-react";

export default function FeaturesPage() {
  const features = [
    {
      title: "Expense Tracking",
      description: "Effortlessly record and categorize your daily expenses, income, and financial transactions in one secure place.",
      icon: <Wallet className="h-10 w-10" />,
    },
    {
      title: "Budget Management",
      description: "Create personalized budgets for different categories and track your progress with visual indicators and alerts.",
      icon: <PieChart className="h-10 w-10" />,
    },
    {
      title: "Financial Insights",
      description: "Gain valuable insights into your spending patterns with beautiful charts, trends analysis, and personalized reports.",
      icon: <LineChart className="h-10 w-10" />,
    },
    {
      title: "Goal Setting",
      description: "Set savings goals, track your progress, and celebrate achievements as you work toward financial freedom.",
      icon: <TrendingUp className="h-10 w-10" />,
    },
    {
      title: "Recurring Expenses",
      description: "Never miss a bill payment with reminders for recurring expenses and subscription tracking features.",
      icon: <Calendar className="h-10 w-10" />,
    },
    {
      title: "Secure & Private",
      description: "Rest easy knowing your financial data is protected with bank-level encryption and strict privacy controls.",
      icon: <ShieldCheck className="h-10 w-10" />,
    },
  ];

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="container mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center mb-6 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
        
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Budget Buddy Features</h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to take control of your finances and achieve your financial goals.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div 
              key={feature.title} 
              className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-5 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-6">Ready to experience these features?</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button asChild size="lg">
              <Link href="/auth/register">Get Started For Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
} 