import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/" className="inline-flex items-center mb-6 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
        
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">
            Last updated: November 1, 2024
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Introduction</h2>
          <p>
            Budget Buddy ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Information We Collect</h2>
          <p>
            We collect information that you provide directly to us when you:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Create an account</li>
            <li>Use our financial tracking features</li>
            <li>Contact customer support</li>
            <li>Complete surveys or feedback forms</li>
            <li>Sign up for newsletters or promotional communications</li>
          </ul>
          
          <p>This information may include:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Personal information (name, email address, phone number)</li>
            <li>Authentication information (password, security questions)</li>
            <li>Financial information (transaction history, budget categories)</li>
            <li>Device and usage information (IP address, browser type, operating system)</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send administrative messages, updates, and security alerts</li>
            <li>Respond to your comments, questions, and customer service requests</li>
            <li>Personalize your experience and provide tailored content</li>
            <li>Monitor and analyze trends, usage, and activities</li>
            <li>Detect, prevent, and address technical issues</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect the security of your personal information. However, please be aware that no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee the absolute security of your data.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Data Sharing and Disclosure</h2>
          <p>We may share your information with:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Service providers who perform services on our behalf</li>
            <li>Business partners with your consent</li>
            <li>Legal authorities when required by law</li>
            <li>In connection with a business transaction (e.g., merger or acquisition)</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Your Rights</h2>
          <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Accessing and updating your information</li>
            <li>Deleting your information</li>
            <li>Restricting or objecting to processing</li>
            <li>Data portability</li>
            <li>Withdrawing consent</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
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