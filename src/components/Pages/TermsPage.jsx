import React from 'react'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiFileText } = FiIcons

const TermsPage = () => {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <SafeIcon icon={FiFileText} className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Use</h1>
          <p className="text-lg text-gray-600">
            Last updated: December 2024
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8 prose prose-lg max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using the Regravity platform, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Regravity provides an international trade platform connecting overseas buyers with Chinese suppliers through secure contract management, quality control, and dispute resolution services.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            Users must register for an account to access our services. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
          </p>

          <h2>4. Payment Terms</h2>
          <p>
            Payment for services is due as specified in your service agreement. We accept various payment methods including bank transfers and letters of credit for international transactions.
          </p>

          <h2>5. Service Fees</h2>
          <ul>
            <li>Supplier Business Verification: $50</li>
            <li>On-site Quality Inspection: $350</li>
            <li>Laboratory Testing: Quote on request</li>
            <li>Shipping Coordination: Quote on request</li>
            <li>Certificate Services: Quote on request</li>
          </ul>

          <h2>6. Dispute Resolution</h2>
          <p>
            Any disputes arising from the use of our services will be resolved through our structured dispute resolution process, with legal jurisdiction in Hong Kong or China as applicable.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            Regravity's liability is limited to the amount paid for our services. We are not liable for indirect, incidental, or consequential damages.
          </p>

          <h2>8. Privacy Policy</h2>
          <p>
            Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.
          </p>

          <h2>9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the platform.
          </p>

          <h2>10. Contact Information</h2>
          <p>
            For questions about these Terms of Use, please contact us at:
          </p>
          <ul>
            <li>Email: legal@regravity.net</li>
            <li>Phone: +852 3008 5841</li>
            <li>Address: Regravity Ltd, Hong Kong</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default TermsPage