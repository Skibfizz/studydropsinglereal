import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | StudyDrop',
  description: 'Terms of service and user agreement for StudyDrop',
}

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-lg mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>By accessing and using StudyDrop, you accept and agree to be bound by the terms and conditions of this agreement.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p>StudyDrop provides [description of your service]. We reserve the right to modify, suspend, or discontinue the service at any time.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>You must provide accurate information when creating an account</li>
            <li>You are responsible for maintaining account security</li>
            <li>You must notify us of any security breaches</li>
            <li>We reserve the right to terminate accounts</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. User Conduct</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Violate any laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Upload harmful content or malware</li>
            <li>Impersonate others</li>
            <li>Interfere with the service&apos;s operation</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Payment Terms</h2>
          <p>Details about subscription fees, payment processing, and refunds.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
          <p>All content and materials available on StudyDrop are protected by intellectual property rights.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
          <p>StudyDrop is provided &quot;as is&quot; without warranties of any kind.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of new terms.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
          <p>For questions about these Terms of Service, please contact us.</p>
        </section>
      </div>
    </div>
  )
} 