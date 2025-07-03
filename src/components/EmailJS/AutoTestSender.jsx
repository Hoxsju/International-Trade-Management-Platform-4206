import React, { useState, useEffect } from 'react'
import { EmailService } from '../../services/emailService'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiMail, FiCheckCircle, FiAlertCircle, FiSend, FiShield, FiClock } = FiIcons

const AutoTestSender = () => {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)
  const testEmail = 'hoxs@regravity.net'

  const sendTestEmails = async () => {
    setLoading(true)
    setResults({})

    // Test 1: General Template
    try {
      setResults(prev => ({ ...prev, general: { status: 'sending' } }))
      
      const generalData = {
        fullName: 'Test User - Regravity',
        email: testEmail,
        subject: 'EmailJS General Template Test - Regravity Platform',
        message: `Hello from Regravity Platform!

This is a test of the GENERAL template (template_general) which handles:
• Contact form submissions
• Order notifications 
• Supplier invitations
• General communications

Template Details:
- Service ID: service_wi64yag
- Template ID: template_general
- Recipient: ${testEmail}
- Test Time: ${new Date().toLocaleString()}

This template is used for all standard communications in the Regravity international trade platform.

Best regards,
Regravity Development Team`
      }

      const generalResponse = await EmailService.sendContactForm(generalData)
      setResults(prev => ({ 
        ...prev, 
        general: { 
          status: 'success', 
          message: 'General template email sent successfully!',
          templateId: 'template_general'
        } 
      }))
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        general: { 
          status: 'error', 
          message: `General template failed: ${error.message}`
        } 
      }))
    }

    // Small delay between emails
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Test 2: Verification Template
    try {
      setResults(prev => ({ ...prev, verification: { status: 'sending' } }))
      
      const verificationResponse = await EmailService.sendVerificationCode(
        testEmail, 
        'Test User - Regravity', 
        'template_testing'
      )
      
      setResults(prev => ({ 
        ...prev, 
        verification: { 
          status: 'success', 
          message: 'Verification template email sent successfully!',
          code: verificationResponse.code,
          templateId: 'template_verification'
        } 
      }))
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        verification: { 
          status: 'error', 
          message: `Verification template failed: ${error.message}`
        } 
      }))
    }

    setLoading(false)
  }

  useEffect(() => {
    // Auto-send emails when component mounts
    sendTestEmails()
  }, [])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sending': return FiClock
      case 'success': return FiCheckCircle
      case 'error': return FiAlertCircle
      default: return FiMail
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'sending': return 'text-blue-600'
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusBg = (status) => {
    switch (status) {
      case 'sending': return 'bg-blue-50 border-blue-200'
      case 'success': return 'bg-green-50 border-green-200'
      case 'error': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 m-4">
      <div className="text-center mb-8">
        <SafeIcon icon={FiMail} className="h-16 w-16 text-primary-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">EmailJS Template Testing</h1>
        <p className="text-gray-600 mb-2">Sending test emails to: <strong>{testEmail}</strong></p>
        <p className="text-sm text-gray-500">Testing both template_general and template_verification</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* General Template Result */}
        <div className={`border rounded-lg p-6 ${getStatusBg(results.general?.status)}`}>
          <div className="flex items-center space-x-3 mb-4">
            <SafeIcon 
              icon={getStatusIcon(results.general?.status)} 
              className={`h-6 w-6 ${getStatusColor(results.general?.status)} ${results.general?.status === 'sending' ? 'animate-spin' : ''}`} 
            />
            <h3 className="text-lg font-semibold text-gray-900">General Template</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <p><strong>Template ID:</strong> template_general</p>
            <p><strong>Purpose:</strong> Contact forms, orders, notifications</p>
            {results.general?.templateId && (
              <p><strong>Used Template:</strong> {results.general.templateId}</p>
            )}
          </div>

          {results.general?.message && (
            <div className="mt-4 p-3 bg-white rounded border">
              <p className={`font-medium ${getStatusColor(results.general.status)}`}>
                {results.general.message}
              </p>
            </div>
          )}
        </div>

        {/* Verification Template Result */}
        <div className={`border rounded-lg p-6 ${getStatusBg(results.verification?.status)}`}>
          <div className="flex items-center space-x-3 mb-4">
            <SafeIcon 
              icon={getStatusIcon(results.verification?.status)} 
              className={`h-6 w-6 ${getStatusColor(results.verification?.status)} ${results.verification?.status === 'sending' ? 'animate-spin' : ''}`} 
            />
            <h3 className="text-lg font-semibold text-gray-900">Verification Template</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <p><strong>Template ID:</strong> template_verification</p>
            <p><strong>Purpose:</strong> Verification codes, security</p>
            {results.verification?.templateId && (
              <p><strong>Used Template:</strong> {results.verification.templateId}</p>
            )}
          </div>

          {results.verification?.message && (
            <div className="mt-4 p-3 bg-white rounded border">
              <p className={`font-medium ${getStatusColor(results.verification.status)}`}>
                {results.verification.message}
              </p>
              {results.verification?.code && (
                <div className="mt-2 p-2 bg-green-100 rounded">
                  <p className="text-green-700 font-mono">
                    <strong>Generated Code:</strong> {results.verification.code}
                  </p>
                  <p className="text-green-600 text-xs mt-1">
                    This code should appear in the email
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Configuration Details */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">EmailJS Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p>✅ <strong>Service ID:</strong> service_wi64yag</p>
            <p>✅ <strong>Public Key:</strong> vORcF7sb8ElcTqXWo</p>
          </div>
          <div>
            <p>✅ <strong>General Template:</strong> template_general</p>
            <p>✅ <strong>Verification Template:</strong> template_verification</p>
          </div>
        </div>
      </div>

      {/* What to Expect */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">What to Expect in Your Inbox</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium mb-2">📧 Email 1: General Template</p>
            <ul className="space-y-1">
              <li>• Subject: "EmailJS General Template Test"</li>
              <li>• From: Regravity Development Team</li>
              <li>• Content: Detailed test message</li>
              <li>• Shows how contact forms work</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-2">🔐 Email 2: Verification Template</p>
            <ul className="space-y-1">
              <li>• Subject: "Your verification code"</li>
              <li>• From: Regravity</li>
              <li>• Content: 6-digit verification code</li>
              <li>• Shows security email format</li>
            </ul>
          </div>
        </div>
        <p className="text-blue-700 mt-4 text-sm">
          <strong>⏰ Delivery Time:</strong> Both emails should arrive within 1-2 minutes. Check your spam folder if they don't appear in your inbox.
        </p>
      </div>

      {/* Retry Button */}
      <div className="text-center mt-6">
        <button
          onClick={sendTestEmails}
          disabled={loading}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2 mx-auto"
        >
          <SafeIcon icon={FiSend} className="h-4 w-4" />
          <span>{loading ? 'Sending Emails...' : 'Send Test Emails Again'}</span>
        </button>
      </div>
    </div>
  )
}

export default AutoTestSender