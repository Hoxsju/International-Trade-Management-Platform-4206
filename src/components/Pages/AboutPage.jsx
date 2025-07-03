import React from 'react'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiGlobe, FiShield, FiUsers, FiTrendingUp } = FiIcons

const AboutPage = () => {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Regravity</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Bridging the gap between overseas buyers and Chinese suppliers through secure, 
            transparent, and reliable international trade services.
          </p>
        </div>

        {/* Company Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                Regravity was established to solve the challenges faced by international buyers 
                when sourcing products from Chinese suppliers. We recognized the need for a 
                trusted third-party platform that could handle payments, ensure quality, 
                and resolve disputes fairly.
              </p>
              <p className="text-gray-600">
                Our comprehensive platform provides end-to-end trade management services, 
                from supplier verification to final delivery, ensuring secure and successful 
                international transactions.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Companies</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900">Regravity Ltd</h3>
                  <p className="text-sm text-gray-600">Registered in Hong Kong</p>
                  <p className="text-sm text-gray-600">International operations and buyer services</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900">Shanghai Regravity Trading Co., Ltd</h3>
                  <p className="text-sm text-gray-600">Registered in China</p>
                  <p className="text-sm text-gray-600">Supplier relations and quality control</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <SafeIcon icon={FiShield} className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Security</h3>
              <p className="text-gray-600">
                Protecting buyer investments through secure payment handling and comprehensive insurance coverage.
              </p>
            </div>
            <div className="text-center">
              <SafeIcon icon={FiGlobe} className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Reach</h3>
              <p className="text-gray-600">
                Connecting businesses across continents with seamless international trade solutions.
              </p>
            </div>
            <div className="text-center">
              <SafeIcon icon={FiUsers} className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Trust</h3>
              <p className="text-gray-600">
                Building long-term relationships through transparent processes and reliable service delivery.
              </p>
            </div>
            <div className="text-center">
              <SafeIcon icon={FiTrendingUp} className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Excellence</h3>
              <p className="text-gray-600">
                Continuously improving our services to exceed client expectations and industry standards.
              </p>
            </div>
          </div>
        </div>

        {/* How We Work */}
        <div className="bg-gray-50 rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">How We Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Creation</h3>
              <p className="text-gray-600">
                Buyers create detailed purchase orders with supplier and product information.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verification & Payment</h3>
              <p className="text-gray-600">
                We verify suppliers, review orders, and manage secure payment processing.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality & Delivery</h3>
              <p className="text-gray-600">
                Quality control, shipping coordination, and dispute resolution when needed.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h3>
              <div className="space-y-2 text-gray-600">
                <p><strong>Email:</strong> support@regravity.net</p>
                <p><strong>Phone:</strong> +852 3008 5841</p>
                <p><strong>Website:</strong> regravity.net</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h3>
              <div className="space-y-2 text-gray-600">
                <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM (HKT)</p>
                <p><strong>Saturday:</strong> 9:00 AM - 1:00 PM (HKT)</p>
                <p><strong>Sunday:</strong> Closed</p>
                <p><strong>Emergency Support:</strong> 24/7 Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage