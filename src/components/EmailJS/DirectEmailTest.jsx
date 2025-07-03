import React, { useState, useEffect } from 'react'
import emailjs from '@emailjs/browser'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiMail, FiCheckCircle, FiAlertCircle, FiSend, FiClock } = FiIcons

const DirectEmailTest = () => {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)
  const testEmail = 'hoxs@regravity.net'

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init('vORcF7sb8ElcTqXWo')
  }, [])

  const sendTestEmails = async () => {
    setLoading(true)
    setResults({})

    // Test 1: General Template
    try {
      setResults(prev => ({ ...prev, general: { status: 'sending' } }))
      
      const generalParams = {
        email_type: 'Direct Test',
        to_email: testEmail,
        from_name: 'Regravity Test System',
        from_email: 'test@regravity.net',
        subject: 'Direct EmailJS Test - General Template',
        message: `This is a direct test of the EmailJS general template.

Test Details:
- Service ID: service_wi64yag
- Template ID: template_general
- Recipient: ${testEmail}
- Test Time: ${new Date().toLocaleString()}

If you receive this email, the general template is working correctly!

Best regards,
Regravity Test System`,
        additional_info: 'Direct template test',
        timestamp: new Date().toLocaleString()
      }

      const generalResponse = await emailjs.send(
        'service_wi64yag',
        'template_general',
        generalParams
      )

      setResults(prev => ({ 
        ...prev, 
        general: { 
          status: 'success', 
          message: 'General template email sent successfully!',
          response: generalResponse
        } 
      }))
    } catch (error) {
      console.error('General template error:', error)
      setResults(prev => ({ 
        ...prev, 
        general: { 
          status: 'error', 
          message: `General template failed: ${error.text || error.message}`
        } 
      }))
    }

    // Wait 3 seconds between emails
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Test 2: Verification Template
    try {
      setResults(prev => ({ ...prev, verification: { status: 'sending' } }))
      
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      const verificationParams = {
        to_email: testEmail,
        to_name: 'Test User',
        verification_code: verificationCode,
        purpose: 'direct_testing',
        expires_in: '10 minutes',
        company_name: 'Regravity',
        support_email: 'support@regravity.net'
      }

      const verificationResponse = await emailjs.send(
        'service_wi64yag',
        'template_verification',
        verificationParams
      )

      setResults(prev => ({ 
        ...prev, 
        verification: { 
          status: 'success', 
          message: 'Verification template email sent successfully!',
          code: verificationCode,
          response: verificationResponse
        } 
      }))
    } catch (error) {
      console.error('Verification template error:', error)
      setResults(prev => ({ 
        ...prev, 
        verification: { 
          status: 'error', 
          message: `Verification template failed: ${error.text || error.message}`
        } 
      }))
    }

    setLoading(false)
  }

  // Auto-send on component mount
  useEffect(() => {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Direct EmailJS Test</h1>
        <p className="text-gray-600 mb-2">Sending test emails directly to: <strong>{testEmail}</strong></p>
        <p className="text-sm text-gray-500">Using direct EmailJS API calls</p>
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
            <p><strong>Service:</strong> service_wi64yag</p>
            <p><strong>Template:</strong> template_general</p>
            <p><strong>Status:</strong> {results.general?.status || 'waiting'}</p>
          </div>

          {results.general?.message && (
            <div className="mt-4 p-3 bg-white rounded border">
              <p className={`font-medium ${getStatusColor(results.general.status)}`}>
                {results.general.message}
              </p>
              {results.general?.response && (
                <div className="mt-2 text-xs text-gray-600">
                  <p>Response Status: {results.general.response.status}</p>
                  <p>Response Text: {results.general.response.text}</p>
                </div>
              )}
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
            <p><strong>Service:</strong> service_wi64yag</p>
            <p><strong>Template:</strong> template_verification</p>
            <p><strong>Status:</strong> {results.verification?.status || 'waiting'}</p>
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
                    Look for this code in your email
                  </p>
                </div>
              )}
              {results.verification?.response && (
                <div className="mt-2 text-xs text-gray-600">
                  <p>Response Status: {results.verification.response.status}</p>
                  <p>Response Text: {results.verification.response.text}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-yellow-800 mb-3">Troubleshooting</h4>
        <div className="space-y-2 text-sm text-yellow-700">
          <p>• Check your spam/junk folder</p>
          <p>• Emails may take 1-5 minutes to arrive</p>
          <p>• Verify EmailJS service is active</p>
          <p>• Check template IDs are correct</p>
        </div>
      </div>

      {/* Manual Retry */}
      <div className="text-center">
        <button
          onClick={sendTestEmails}
          disabled={loading}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2 mx-auto"
        >
          <SafeIcon icon={FiSend} className="h-4 w-4" />
          <span>{loading ? 'Sending...' : 'Send Test Emails Again'}</span>
        </button>
      </div>

      {/* Debug Information */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Debug Information</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Service ID:</strong> service_wi64yag</p>
          <p><strong>Public Key:</strong> vORcF7sb8ElcTqXWo</p>
          <p><strong>General Template:</strong> template_general</p>
          <p><strong>Verification Template:</strong> template_verification</p>
          <p><strong>Target Email:</strong> {testEmail}</p>
        </div>
      </div>
    </div>
  )
}

export default DirectEmailTest