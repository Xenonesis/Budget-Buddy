import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CookiePolicyPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background overflow-x-hidden">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/" className="inline-flex items-center mb-6 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
        
        <h1 className="text-3xl font-bold mb-8">Cookie Policy</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">
            Last updated: November 1, 2024
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">What Are Cookies</h2>
          <p>
            Cookies are small text files that are placed on your computer or mobile device when you visit a website. Cookies are widely used to make websites work more efficiently and provide valuable information to website owners.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">How We Use Cookies</h2>
          <p>
            Budget Buddy uses cookies for several purposes, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Essential cookies:</strong> These cookies are necessary for the website to function properly and cannot be turned off in our systems.</li>
            <li><strong>Analytical/performance cookies:</strong> These cookies allow us to recognize and count the number of visitors and see how visitors move around our website. This helps us improve the way our website works.</li>
            <li><strong>Functionality cookies:</strong> These cookies enable the website to provide enhanced functionality and personalization, such as remembering your preferences.</li>
            <li><strong>Targeting cookies:</strong> These cookies may be set through our site by our advertising partners. They may be used to build a profile of your interests and show you relevant advertisements on other sites.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Types of Cookies We Use</h2>
          
          <h3 className="text-lg font-medium mt-6 mb-3">1. Session Cookies</h3>
          <p>
            Session cookies are temporary cookies that are erased when you close your browser. We use session cookies to enable certain site functionality, such as maintaining your login session.
          </p>
          
          <h3 className="text-lg font-medium mt-6 mb-3">2. Persistent Cookies</h3>
          <p>
            Persistent cookies remain on your device for a set period or until you delete them. We use persistent cookies to remember your preferences and settings when you visit our site again.
          </p>
          
          <h3 className="text-lg font-medium mt-6 mb-3">3. First-Party Cookies</h3>
          <p>
            First-party cookies are set by Budget Buddy directly when you use our website.
          </p>
          
          <h3 className="text-lg font-medium mt-6 mb-3">4. Third-Party Cookies</h3>
          <p>
            Third-party cookies are set by third-party services that appear on our pages, such as analytics services or advertising networks.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Managing Cookies</h2>
          <p>
            Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience, as it will no longer be personalized to you.
          </p>
          
          <p>
            To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit <a href="https://www.allaboutcookies.org" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.allaboutcookies.org</a>.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Changes to This Cookie Policy</h2>
          <p>
            We may update our Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p>
            If you have any questions about our Cookie Policy, please contact us at:
          </p>
          <p>
            <a href="mailto:itisaddy7@gmail.com" className="text-primary hover:underline">itisaddy7@gmail.com</a>
          </p>
        </div>
        
        <div className="mt-12 flex justify-center">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
} 