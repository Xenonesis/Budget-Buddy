import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CompliancePage() {
  return (
    <main className="flex min-h-screen flex-col bg-background overflow-x-hidden">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center mb-6 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>

        <h1 className="text-3xl font-bold mb-8">Compliance</h1>

        <div className="prose dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-6">Last updated: January 1, 2025</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Regulatory Compliance</h2>
          <p>
            At Budget Buddy, we are committed to complying with all applicable laws and regulations
            governing financial services, data protection, and consumer privacy. This page outlines
            our approach to compliance and the regulatory frameworks we adhere to.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Data Protection and Privacy</h2>
          <p>We adhere to the following data protection regulations:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong>General Data Protection Regulation (GDPR):</strong> For users in the European
              Economic Area, we comply with GDPR requirements regarding data collection, processing,
              and storage.
            </li>
            <li>
              <strong>California Consumer Privacy Act (CCPA):</strong> For California residents, we
              comply with CCPA requirements regarding personal information and consumer rights.
            </li>
            <li>
              <strong>Personal Data Protection Act:</strong> We respect and comply with various
              national data protection laws applicable to our users.
            </li>
          </ul>

          <p>
            For more information on how we handle your data, please refer to our{' '}
            <Link href="/legal/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Financial Services Compliance</h2>
          <p>
            Budget Buddy is a financial management tool that provides budgeting and expense tracking
            capabilities. We are not a financial institution, do not provide financial advice, and
            do not directly handle or process payments.
          </p>

          <p>However, we are committed to:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Transparently communicating the nature of our services</li>
            <li>Maintaining the security of any financial data you provide</li>
            <li>Following best practices for financial data protection</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">Security Compliance</h2>
          <p>We implement security measures in line with industry standards:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong>Data Encryption:</strong> We use encryption for data in transit and at rest
            </li>
            <li>
              <strong>Secure Authentication:</strong> We implement multi-factor authentication where
              appropriate
            </li>
            <li>
              <strong>Regular Security Audits:</strong> We conduct periodic security assessments
            </li>
            <li>
              <strong>Vulnerability Management:</strong> We maintain a program to identify and
              address security vulnerabilities
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">Accessibility Compliance</h2>
          <p>
            Budget Buddy is committed to making our website and application accessible to all users,
            including those with disabilities. We strive to comply with the Web Content
            Accessibility Guidelines (WCAG) 2.1 at Level AA.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Reporting Compliance Concerns</h2>
          <p>
            If you have any concerns about our compliance with applicable laws and regulations, or
            if you believe your rights have been violated, please contact us immediately at:
          </p>
          <p>
            <a href="mailto:itisaddy7@gmail.com" className="text-primary hover:underline">
              itisaddy7@gmail.com
            </a>
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Compliance Updates</h2>
          <p>
            As regulations evolve, we continuously update our practices and policies to ensure
            ongoing compliance. This page will be updated to reflect any significant changes to our
            compliance approach.
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
