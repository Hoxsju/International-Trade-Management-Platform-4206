import React from 'react'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiDollarSign, FiClock, FiCheckCircle, FiXCircle } = FiIcons

const RefundPolicyPage = () => {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <SafeIcon icon={FiDollarSign} className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Refund Policy</h1>
          <p className="text-lg text-gray-600">
            Last updated: December 2024
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8 prose prose-lg max-w-none">
          <h2>Service Refund Policy</h2>
          <p>
            Regravity is committed to providing high-quality services. This refund policy outlines the conditions under which refunds may be issued for our various services.
          </p>

          <h3>1. Supplier Business Verification ($50)</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <SafeIcon icon={FiCheckCircle} className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">Eligible for Refund</span>
            </div>
            <ul className="text-green-700 text-sm">
              <li>• If verification cannot be completed due to our inability to access required information</li>
              <li>• If service is cancelled within 24 hours of payment</li>
              <li>• If we determine the supplier cannot be properly verified</li>
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <SafeIcon icon={FiXCircle} className="h-5 w-5 text-red-600" />
              <span className="font-semibold text-red-800">Not Eligible for Refund</span>
            </div>
            <ul className="text-red-700 text-sm">
              <li>• After verification report has been delivered</li>
              <li>• If supplier information provided was incorrect or incomplete</li>
              <li>• If verification reveals negative findings about the supplier</li>
            </ul>
          </div>

          <h3>2. On-site Quality Inspection ($350)</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <SafeIcon icon={FiCheckCircle} className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">Eligible for Refund</span>
            </div>
            <ul className="text-green-700 text-sm">
              <li>• If inspection cannot be conducted due to supplier non-cooperation</li>
              <li>• If cancelled more than 48 hours before scheduled inspection</li>
              <li>• If products are not available for inspection at scheduled time</li>
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <SafeIcon icon={FiXCircle} className="h-5 w-5 text-red-600" />
              <span className="font-semibold text-red-800">Not Eligible for Refund</span>
            </div>
            <ul className="text-red-700 text-sm">
              <li>• After inspection has been completed and report delivered</li>
              <li>• If cancelled less than 48 hours before scheduled inspection</li>
              <li>• If inspection reveals quality issues with products</li>
            </ul>
          </div>

          <h3>3. Laboratory Testing (Quote on Request)</h3>
          <p>
            Refund eligibility for laboratory testing depends on the specific testing requirements and stage of the testing process:
          </p>
          <ul>
            <li><strong>Before Testing:</strong> Full refund available if cancelled before samples are processed</li>
            <li><strong>During Testing:</strong> Partial refund based on work completed</li>
            <li><strong>After Testing:</strong> No refund once results are delivered</li>
          </ul>

          <h3>4. Shipping Coordination (Quote on Request)</h3>
          <p>
            Refunds for shipping coordination services are handled on a case-by-case basis:
          </p>
          <ul>
            <li><strong>Pre-shipment:</strong> Refund available minus any costs already incurred</li>
            <li><strong>During Transit:</strong> No refund, but insurance claims may apply</li>
            <li><strong>Post-delivery:</strong> No refund available</li>
          </ul>

          <h3>5. Certificate Services (Quote on Request)</h3>
          <p>
            Certificate service refunds depend on the certification process:
          </p>
          <ul>
            <li><strong>Application Stage:</strong> Full refund if cancelled before application submission</li>
            <li><strong>Under Review:</strong> Partial refund minus processing fees</li>
            <li><strong>Completed:</strong> No refund once certificates are issued</li>
          </ul>

          <h2>Refund Process</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-blue-900 mb-4 flex items-center">
              <SafeIcon icon={FiClock} className="h-5 w-5 mr-2" />
              How to Request a Refund
            </h3>
            <ol className="text-blue-800 space-y-2">
              <li>1. Contact our support team at refunds@regravity.net</li>
              <li>2. Provide your order ID and reason for refund request</li>
              <li>3. Submit any required documentation</li>
              <li>4. Wait for review (typically 3-5 business days)</li>
              <li>5. Receive refund decision and processing timeline</li>
            </ol>
          </div>

          <h2>Refund Timeline</h2>
          <ul>
            <li><strong>Review Period:</strong> 3-5 business days</li>
            <li><strong>Processing Time:</strong> 7-14 business days after approval</li>
            <li><strong>Bank Transfer:</strong> 3-5 additional business days</li>
            <li><strong>Credit Card:</strong> 5-10 additional business days</li>
          </ul>

          <h2>Partial Refunds</h2>
          <p>
            In some cases, partial refunds may be issued based on:
          </p>
          <ul>
            <li>Work already completed</li>
            <li>Third-party costs incurred</li>
            <li>Administrative processing fees</li>
            <li>Currency conversion costs</li>
          </ul>

          <h2>Dispute Resolution</h2>
          <p>
            If you disagree with a refund decision, you may escalate the matter through our dispute resolution process. See our Dispute Resolution page for more information.
          </p>

          <h2>Contact Information</h2>
          <p>
            For refund requests or questions about this policy:
          </p>
          <ul>
            <li><strong>Email:</strong> refunds@regravity.net</li>
            <li><strong>Phone:</strong> +852 3008 5841</li>
            <li><strong>Response Time:</strong> Within 24 hours</li>
          </ul>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> This refund policy applies to direct service fees paid to Regravity. Trade order amounts held in escrow are governed by separate dispute resolution procedures and may have different refund conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RefundPolicyPage