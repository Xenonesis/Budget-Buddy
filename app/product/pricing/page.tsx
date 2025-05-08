import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";

export default function PricingPage() {
  const plans = [
    {
      title: "Free",
      price: "$0",
      description: "Perfect for getting started with basic budgeting",
      features: [
        "Up to 3 budget categories",
        "Basic expense tracking",
        "Monthly spending reports",
        "Email support"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      title: "Premium",
      price: "$9.99",
      per: "month",
      description: "Everything you need for serious money management",
      features: [
        "Unlimited categories",
        "Advanced analytics dashboard",
        "Custom budget goals",
        "Recurring expenses",
        "Priority support",
        "Bank account sync"
      ],
      cta: "Upgrade to Premium",
      popular: true
    },
    {
      title: "Family",
      price: "$19.99",
      per: "month",
      description: "Manage finances together with your family",
      features: [
        "All Premium features",
        "Up to 5 user accounts",
        "Shared budget categories",
        "Family spending insights",
        "Bill splitting",
        "Dedicated support"
      ],
      cta: "Start Family Plan",
      popular: false
    }
  ];

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="container mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center mb-6 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
        
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground">
            Start for free, upgrade when you need more features. No hidden fees or long-term commitments.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={plan.title}
              className={`bg-card rounded-xl border ${plan.popular ? 'border-primary shadow-xl' : 'shadow-sm border-border'} overflow-hidden flex flex-col`}
            >
              {plan.popular && (
                <div className="bg-primary/10 text-primary text-center text-sm font-medium py-1">
                  Most Popular
                </div>
              )}
              <div className="p-6 md:p-8 flex-1">
                <div className="font-semibold text-lg mb-2">{plan.title}</div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.per && <span className="text-muted-foreground">/{plan.per}</span>}
                </div>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <div className="mt-0.5 flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center bg-primary/10">
                        <Check size={10} className="text-primary" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-6 pb-8">
                <Button 
                  asChild 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link href="/auth/register">
                    {plan.cta}
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="max-w-3xl mx-auto mt-16 p-6 bg-muted/30 rounded-lg text-center">
          <div className="font-medium mb-2">Need a custom solution?</div>
          <p className="text-muted-foreground text-sm mb-4">
            Contact us for tailored enterprise solutions with advanced features and dedicated support.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/contact">Contact Sales</Link>
          </Button>
        </div>
        
        <div className="max-w-4xl mx-auto mt-20">
          <h2 className="text-2xl font-semibold mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {[
              {
                question: "Can I cancel my subscription at any time?",
                answer: "Yes, you can cancel your subscription at any time. There are no long-term commitments or cancellation fees. Your subscription will remain active until the end of your current billing period."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and select regional payment methods."
              },
              {
                question: "Is my financial data secure?",
                answer: "Yes, we take security very seriously. All your data is encrypted in transit and at rest. We use bank-level security measures and do not store your actual bank credentials on our servers."
              },
              {
                question: "Can I upgrade or downgrade my plan?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to additional features. When downgrading, the change will take effect at the start of your next billing cycle."
              },
              {
                question: "Is there a free trial for the Premium plan?",
                answer: "Yes, we offer a 14-day free trial for our Premium plan. You won't be charged until the trial period ends, and you can cancel anytime before then."
              }
            ].map((faq, index) => (
              <div key={index} className="border rounded-lg p-6 bg-card">
                <h3 className="text-lg font-medium mb-3">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <div className="flex justify-center gap-4 flex-wrap">
            <Button asChild>
              <Link href="/auth/register">Get Started For Free</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
} 