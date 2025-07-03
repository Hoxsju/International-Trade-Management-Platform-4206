import React from 'react'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiScale, FiUsers, FiFileText, FiCheckCircle } = FiIcons

const DisputeResolutionPage = () => {
  const steps = [
    {
      step: 1,
      title: 'Initial Complaint',
      description: 'Submit your dispute through our platform with supporting documentation and evidence.'
    },
    {
      step: 2,
      title: 'Mediation Attempt',
      description: 'Our team facilitates direct communication between parties to reach an amicable resolution.'
    },
    {
      step: 3,
      title: 'Investigation',
      description: 'If mediation fails, we conduct a thorough investigation including third-party verification when needed.'
    },
    {
      step: 4,
      title: 'Resolution Decision',
      description: 'Based on evidence and our terms, we make a binding decision on the dispute resolution.'
    },
    {
      step: 5,
      title: 'Implementation',
      description: 'We enforce the resolution decision, including payment adjustments or service corrections.'
    }
  ]

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <SafeIcon icon={FiScale} className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dispute Resolution</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Fair and transparent dispute resolution process to protect both buyers and suppliers in international trade transactions.
          </p>
        </div>

        {/* Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Commitment to Fair Resolution</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <SafeIcon icon={FiUsers} className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Impartial Process</h3>
              <p className="text-gray-600">Independent review team ensures fair treatment for all parties involved.</p>
            </div>
            <div className="text-center">
              <SafeIcon icon={FiFileText} className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Evidence-Based</h3>
              <p className="text-gray-600">Decisions based on documented evidence and contractual agreements.</p>
            </div>
            <div className="text-center">
              <SafeIcon icon={FiCheckCircle} className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Binding Resolution</h3>
              <p className="text-gray-600">Final decisions are legally binding and enforceable under our terms.</p>
            </div>
          </div>
        </div>

        {/* Resolution Process */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Resolution Process</h2>
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                    {step.step}
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-6 flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Types of Disputes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Common Dispute Types</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiCheckCircle} className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Product quality not meeting specifications</span>
              </div>
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiCheckCircle} className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Delivery delays or non-delivery</span>
              </div>
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiCheckCircle} className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Payment processing issues</span>
              </div>
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiCheckCircle} className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Supplier verification discrepancies</span>
              </div>
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiCheckCircle} className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Service delivery failures</span>
              </div>
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiCheckCircle} className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Contractual disagreements</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Required Documentation</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiFileText} className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <span className="text-gray-700">Original trade order and agreements</span>
              </div>
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiFileText} className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <span className="text-gray-700">Communication records with counterparty</span>
              </div>
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiFileText} className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <span className="text-gray-700">Evidence of issue (photos, reports, etc.)</span>
              </div>
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiFileText} className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <span className="text-gray-700">Financial transaction records</span>
              </div>
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiFileText} className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <span className="text-gray-700">Third-party inspection reports (if applicable)</span>
              </div>
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiFileText} className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <span className="text-gray-700">Any relevant certificates or compliance documents</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Framework */}
        <div className="bg-gray-50 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Legal Framework</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hong Kong Jurisdiction</h3>
              <p className="text-gray-600 mb-4">
                Regravity Ltd operates under Hong Kong law, providing buyers with strong legal protections and access to Hong Kong's efficient legal system.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>• English common law system</li>
                <li>• International arbitration available</li>
                <li>• Strong enforcement mechanisms</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">China Operations</h3>
              <p className="text-gray-600 mb-4">
                Shanghai Regravity Trading Co., Ltd provides local support and enforcement capabilities within mainland China.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>• Local legal representation</li>
                <li>• Direct supplier engagement</li>
                <li>• Chinese commercial law compliance</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact for Disputes */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-900 mb-4">Need to File a Dispute?</h2>
          <p className="text-red-700 mb-6">
            If you're experiencing issues with your trade order, contact our dispute resolution team immediately.
          </p>
          <div className="space-y-2 text-red-700">
            <p><strong>Email:</strong> disputes@regravity.net</p>
            <p><strong>Phone:</strong> +852 3008 5841 (24/7 Emergency Line)</p>
            <p><strong>Response Time:</strong> Within 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DisputeResolutionPage