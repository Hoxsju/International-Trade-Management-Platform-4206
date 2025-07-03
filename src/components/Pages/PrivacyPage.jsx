import React from 'react'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiShield } = FiIcons

const PrivacyPage = () => {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <SafeIcon icon={FiShield} className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">
            Last updated: December 2024
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8 prose prose-lg max-w-none">
          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, submit trade orders, or contact us for support.
          </p>

          <h3>Personal Information</h3>
          <ul>
            <li>Name and contact information</li>
            <li>Company details and business information</li>
            <li>Financial and payment information</li>
            <li>Trade order details and communications</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Provide and improve our services</li>
            <li>Process trade orders and payments</li>
            <li>Verify supplier and buyer credentials</li>
            <li>Communicate with you about your orders</li>
            <li>Comply with legal and regulatory requirements</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>
            We may share your information with:
          </p>
          <ul>
            <li>Other parties to your trade transactions (buyers/suppliers)</li>
            <li>Service providers who assist in our operations</li>
            <li>Legal authorities when required by law</li>
            <li>Business partners for verification services</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2>5. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to provide our services and comply with legal obligations, typically for 7 years for trade-related records.
          </p>

          <h2>6. Your Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Object to processing of your information</li>
            <li>Request data portability</li>
          </ul>

          <h2>7. International Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own, including Hong Kong and China, where our operations are based.
          </p>

          <h2>8. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to improve your experience on our platform, analyze usage, and provide personalized content.
          </p>

          <h2>9. Changes to Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our platform.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <ul>
            <li>Email: privacy@regravity.net</li>
            <li>Phone: +852 3008 5841</li>
            <li>Address: Regravity Ltd, Hong Kong</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPage