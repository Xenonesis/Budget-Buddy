import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/" className="inline-flex items-center mb-6 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
        
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">
            Last updated: November 1, 2024
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">1. Agreement to Terms</h2>
          <p>
            By accessing or using Budget Buddy, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use our services.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">2. Description of Service</h2>
          <p>
            Budget Buddy provides financial management tools to help users track expenses, create budgets, and gain insights into their spending habits. We may update, modify, or enhance the service at any time.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">3. User Accounts</h2>
          <p>
            To use certain features of our service, you must create an account. You are responsible for:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Providing accurate and complete information</li>
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activity that occurs under your account</li>
            <li>Notifying us of any unauthorized access or use</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">4. User Conduct</h2>
          <p>
            You agree not to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Use the service for any illegal purpose</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Impersonate any person or entity</li>
            <li>Interfere with or disrupt the service</li>
            <li>Attempt to gain unauthorized access to any systems or networks</li>
            <li>Transmit any viruses, malware, or other harmful code</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">5. Intellectual Property</h2>
          <p>
            All content, features, and functionality of our service, including but not limited to text, graphics, logos, icons, and software, are owned by Budget Buddy or its licensors and are protected by copyright, trademark, and other intellectual property laws.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">6. Third-Party Links and Services</h2>
          <p>
            Our service may contain links to third-party websites or services. We are not responsible for the content or practices of these third parties. Your interactions with any third-party website or service are solely between you and that third party.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">7. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL BUDGET BUDDY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, ARISING OUT OF OR RELATING TO YOUR USE OF, OR INABILITY TO USE, THE SERVICE.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">9. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the service at any time, without prior notice or liability, for any reason, including if you breach these Terms of Service.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">10. Changes to Terms</h2>
          <p>
            We may revise these Terms of Service at any time by posting an updated version. Your continued use of the service after any changes constitutes your acceptance of the revised Terms.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">11. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">12. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
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