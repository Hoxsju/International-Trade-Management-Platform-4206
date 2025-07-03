import React from 'react'
import {Link} from 'react-router-dom'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const {FiShield, FiGlobe, FiTrendingUp, FiUsers, FiCheckCircle, FiArrowRight} = FiIcons

const HomePage = () => {
  const features = [
    {
      icon: FiShield,
      title: 'Secure Payments',
      description: 'Third-party payment management with dispute resolution and insurance coverage'
    },
    {
      icon: FiGlobe,
      title: 'Global Trade',
      description: 'Connect overseas buyers with verified Chinese suppliers seamlessly'
    },
    {
      icon: FiTrendingUp,
      title: 'Quality Control',
      description: 'On-site inspections, laboratory testing, and certification services'
    },
    {
      icon: FiUsers,
      title: 'Trusted Platform',
      description: 'Supplier verification and blacklist system for buyer protection'
    }
  ]

  const services = [
    'Supplier Business Verification',
    'On-site Quality Inspection',
    'Laboratory Testing',
    'Shipping Coordination',
    'Certificate Request (CE, SGS, etc.)',
    'Dispute Resolution & Legal Support'
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Secure International Trade Platform
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Connecting overseas buyers with Chinese suppliers through trusted contract management, 
              quality control, and dispute resolution services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/about"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Regravity?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide comprehensive trade services to ensure secure and successful international transactions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <SafeIcon icon={feature.icon} className="h-12 w-12 text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Comprehensive Trade Services
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                From supplier verification to quality control and shipping coordination, 
                we handle every aspect of your international trade transaction.
              </p>
              
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <SafeIcon icon={FiCheckCircle} className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{service}</span>
                  </div>
                ))}
              </div>
              
              <Link
                to="/services"
                className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium mt-8"
              >
                <span>View All Services</span>
                <SafeIcon icon={FiArrowRight} className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-lg">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Trading?</h3>
                <p className="text-gray-600 mb-6">
                  Join thousands of buyers and suppliers who trust Regravity for their international trade needs.
                </p>
                <div className="space-y-3">
                  <Link
                    to="/register?type=buyer"
                    className="block w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Register as Buyer
                  </Link>
                  <Link
                    to="/register?type=supplier"
                    className="block w-full border-2 border-primary-600 text-primary-600 py-3 px-6 rounded-lg hover:bg-primary-600 hover:text-white transition-colors"
                  >
                    Register as Supplier
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Info Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Trusted by Global Businesses
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Regravity Ltd (Hong Kong) and Shanghai Regravity Trading Co., Ltd (China) 
              provide comprehensive international trade services with legal backing in both jurisdictions.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-400 mb-2">1000+</div>
                <div className="text-gray-300">Successful Trades</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-400 mb-2">50+</div>
                <div className="text-gray-300">Countries Served</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-400 mb-2">24/7</div>
                <div className="text-gray-300">Support Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage