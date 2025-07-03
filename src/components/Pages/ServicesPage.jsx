import React from 'react'
import { Link } from 'react-router-dom'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiShield, FiSearch, FiTool, FiTruck, FiAward, FiCheckCircle, FiDollarSign } = FiIcons

const ServicesPage = () => {
  const services = [
    {
      id: 'verification',
      icon: FiShield,
      title: 'Supplier Business Verification',
      cost: '$50',
      description: 'Comprehensive verification of supplier business credentials, licenses, and legitimacy.',
      features: [
        'Business license verification',
        'Company registration check',
        'Legal status confirmation',
        'Contact information validation',
        'Financial stability assessment'
      ]
    },
    {
      id: 'quality',
      icon: FiSearch,
      title: 'On-site Quality Inspection',
      cost: '$350',
      description: 'Professional on-site inspection of products before shipment to ensure quality standards.',
      features: [
        'Pre-shipment inspection',
        'Quality control assessment',
        'Product specification verification',
        'Packaging inspection',
        'Photo documentation',
        'Detailed inspection report'
      ]
    },
    {
      id: 'testing',
      icon: FiTool,
      title: 'Laboratory Testing',
      cost: 'Quote on Request',
      description: 'Professional laboratory testing services for product safety and compliance.',
      features: [
        'Material composition analysis',
        'Safety standard testing',
        'Durability testing',
        'Chemical analysis',
        'Performance testing',
        'Third-party certified labs'
      ]
    },
    {
      id: 'shipping',
      icon: FiTruck,
      title: 'Shipping Coordination',
      cost: 'Quote on Request',
      description: 'End-to-end shipping coordination and logistics management.',
      features: [
        'Freight forwarder coordination',
        'Customs documentation',
        'Shipping insurance',
        'Tracking and monitoring',
        'Delivery confirmation',
        'Multiple shipping options'
      ]
    },
    {
      id: 'certificates',
      icon: FiAward,
      title: 'Certificate Request (CE, SGS, etc.)',
      cost: 'Quote on Request',
      description: 'Assistance with obtaining necessary certificates and compliance documentation.',
      features: [
        'CE marking assistance',
        'SGS certification',
        'FDA compliance',
        'ISO certifications',
        'Product compliance testing',
        'Documentation support'
      ]
    }
  ]

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive international trade services to ensure secure and successful transactions between buyers and suppliers.
          </p>
        </div>

        {/* Services Grid */}
        <div className="space-y-12">
          {services.map((service, index) => (
            <div key={service.id} id={service.id} className="bg-white rounded-lg shadow-sm border">
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="bg-primary-100 p-3 rounded-lg">
                        <SafeIcon icon={service.icon} className="h-8 w-8 text-primary-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{service.title}</h2>
                        <div className="flex items-center space-x-2 mt-1">
                          <SafeIcon icon={FiDollarSign} className="h-4 w-4 text-green-600" />
                          <span className="text-lg font-semibold text-green-600">{service.cost}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6 text-lg">{service.description}</p>
                    <div className="space-y-3">
                      {service.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-3">
                          <SafeIcon icon={FiCheckCircle} className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Get Started</h3>
                    <p className="text-gray-600 mb-6">
                      Ready to add this service to your trade order? Create an order and select the services you need.
                    </p>
                    <Link
                      to="/create-order"
                      className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors text-center block"
                    >
                      Create Order
                    </Link>
                    <div className="mt-4 text-center">
                      <Link
                        to="/contact"
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Have questions? Contact us
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Need Multiple Services?</h2>
          <p className="text-xl text-primary-100 mb-6 max-w-2xl mx-auto">
            Combine multiple services for comprehensive trade protection. Our team will work with you to create a custom package that meets your specific needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/create-order"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Create Order
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServicesPage