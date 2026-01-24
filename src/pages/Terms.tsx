import { FileText } from 'lucide-react'

export default function Terms() {
  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-primary-100 p-3 rounded-lg">
              <FileText className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Terms & Conditions</h1>
          </div>
          
          <div className="text-sm text-gray-500 mb-8">
            Last Updated: January 2026
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using the tools and services provided on floorplan.hexagonprofile.com (the "Website"), 
                you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to 
                these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use of Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our tools are provided free of charge for personal and commercial use. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Use the services in compliance with all applicable laws and regulations</li>
                <li>Not attempt to gain unauthorized access to any part of the services</li>
                <li>Not use the services to transmit malicious code or harmful content</li>
                <li>Not attempt to reverse engineer, decompile, or disassemble any part of the services</li>
                <li>Not use automated systems to access the services in a manner that sends more requests than a human can reasonably produce</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                The Website and its original content, features, and functionality are owned by Hexagon Profile and are 
                protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. 
                Content you create using our tools remains your property.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Content</h2>
              <p className="text-gray-700 leading-relaxed">
                You retain all rights to any content you create using our tools. We do not claim ownership of your work. 
                Most of our tools process data locally in your browser, and we do not store or have access to your content 
                unless explicitly stated otherwise.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Disclaimer of Warranties</h2>
              <p className="text-gray-700 leading-relaxed">
                The services are provided "as is" and "as available" without any warranties of any kind, either express or 
                implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or 
                non-infringement. We do not warrant that the services will be uninterrupted, secure, or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                In no event shall Hexagon Profile, its directors, employees, partners, agents, suppliers, or affiliates be 
                liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, 
                loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or 
                inability to access or use the services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Service Availability</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify, suspend, or discontinue any part of the services at any time without notice. 
                We will not be liable to you or any third party for any modification, suspension, or discontinuance of the services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Links to Other Websites</h2>
              <p className="text-gray-700 leading-relaxed">
                Our services may contain links to third-party websites or services that are not owned or controlled by 
                Hexagon Profile. We have no control over and assume no responsibility for the content, privacy policies, 
                or practices of any third-party websites or services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify or replace these terms at any time at our sole discretion. We will provide 
                notice of any material changes by updating the "Last Updated" date at the top of this page. Your continued 
                use of the services after any such changes constitutes your acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These terms shall be governed and construed in accordance with applicable laws, without regard to its 
                conflict of law provisions. Our failure to enforce any right or provision of these terms will not be 
                considered a waiver of those rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms & Conditions, please contact us through the information 
                provided on our website.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              By using our services, you acknowledge that you have read and understood these Terms & Conditions 
              and agree to be bound by them.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
