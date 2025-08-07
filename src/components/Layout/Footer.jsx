import React from 'react'
import { Link } from 'react-router-dom'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiMail, FiPhone } = FiIcons

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/logo.png" 
                alt="Regravity Logo" 
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  // Fallback to text logo if image fails to load
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'block'
                }}
              />
              <div style={{ display: 'none' }} className="fallback-logo">
                <div className="h-8 w-8 bg-primary-400 rounded flex items-center justify-center">
                  <span className="text-white font-bold">R</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold">Regravity</h3>
                <p className="text-sm text-gray-400">International Trade Platform</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Connecting overseas buyers with Chinese suppliers through secure, transparent trade
              contract management and dispute resolution.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p><strong>Hong Kong:</strong> Regravity Ltd</p>
              <p><strong>China:</strong> Shanghai Regravity Trading Co., Ltd</p>
              <p><strong>Domain:</strong> regravity.net</p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link
                  to="/services"
                  onClick={() => {
                    setTimeout(() => {
                      const element = document.getElementById('verification');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                  className="hover:text-white"
                >
                  Supplier Verification
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  onClick={() => {
                    setTimeout(() => {
                      const element = document.getElementById('quality');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                  className="hover:text-white"
                >
                  Quality Inspection
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  onClick={() => {
                    setTimeout(() => {
                      const element = document.getElementById('testing');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                  className="hover:text-white"
                >
                  Laboratory Testing
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  onClick={() => {
                    setTimeout(() => {
                      const element = document.getElementById('shipping');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                  className="hover:text-white"
                >
                  Shipping Coordination
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  onClick={() => {
                    setTimeout(() => {
                      const element = document.getElementById('certificates');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                  className="hover:text-white"
                >
                  Certificates
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/terms" className="hover:text-white">Terms of Use</Link></li>
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/dispute-resolution" className="hover:text-white">Dispute Resolution</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © 2024 Regravity Ltd. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <SafeIcon icon={FiMail} className="h-4 w-4" />
              <span>support@regravity.net</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <SafeIcon icon={FiPhone} className="h-4 w-4" />
              <span>+852 3008 5841</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer