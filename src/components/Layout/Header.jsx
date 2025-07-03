import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiGlobe, FiUser, FiLogOut, FiMenu, FiX } = FiIcons

const Header = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setMobileMenuOpen(false)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3" onClick={closeMobileMenu}>
            <SafeIcon icon={FiGlobe} className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Regravity</h1>
              <p className="text-xs text-gray-500">International Trade Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
              About
            </Link>
            <Link to="/services" className="text-gray-600 hover:text-gray-900 transition-colors">
              Services
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
              Contact
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/dashboard" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiUser} className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{user.email}</span>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <SafeIcon icon={FiLogOut} className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <SafeIcon icon={mobileMenuOpen ? FiX : FiMenu} className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/about" 
                className="text-gray-600 hover:text-gray-900 transition-colors px-2"
                onClick={closeMobileMenu}
              >
                About
              </Link>
              <Link 
                to="/services" 
                className="text-gray-600 hover:text-gray-900 transition-colors px-2"
                onClick={closeMobileMenu}
              >
                Services
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-600 hover:text-gray-900 transition-colors px-2"
                onClick={closeMobileMenu}
              >
                Contact
              </Link>
              
              {user ? (
                <div className="flex flex-col space-y-4 px-2">
                  <Link 
                    to="/dashboard" 
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <SafeIcon icon={FiUser} className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors text-left"
                  >
                    <SafeIcon icon={FiLogOut} className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-4 px-2">
                  <Link 
                    to="/login" 
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-center"
                    onClick={closeMobileMenu}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header