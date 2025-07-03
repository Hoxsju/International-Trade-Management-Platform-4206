import React, { useState } from 'react'
import { EmailService } from '../../services/emailService'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiMail, FiCheckCircle, FiAlertCircle, FiSend, FiShield } = FiIcons

const EmailJSTest = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [testEmail, setTestEmail] = useState('')

  const testGeneralTemplate = async () => {
    if (!testEmail) {
      setResult({ success: false, message: 'Please enter your email address' })
      return
    }

    const testData = {
      fullName: 'Test User',
      email: testEmail,
      subject: 'General Template Test',
      message: 'This is a test message from the Regravity platform to verify the GENERAL template is working correctly. This template handles contact forms, order notifications, supplier invitations, and other general communications.'
    }
    
    return await EmailService.sendContactForm(testData)
  }

  const testVerificationTemplate = async () => {
    if (!testEmail) {
      setResult({ success: false, message: 'Please enter your email address' })
      return
    }

    return await EmailService.sendVerificationCode(testEmail, 'Test User', 'testing')
  }

  const runTest = async (templateType) => {
    setLoading(true)
    setResult(null)

    try {
      let response
      if (templateType === 'general') {
        response = await testGeneralTemplate()
      } else {
        response = await testVerificationTemplate()
      }

      setResult({ 
        success: true, 
        message: `${templateType === 'general' ? 'General' : 'Verification'} template email sent successfully!`,
        code: response.code || null,
        templateType
      })
    } catch (error) {
      setResult({ success: false, message: `Error: ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 m-4">
      <div className="text-center mb-8">
        <SafeIcon icon={FiMail} className="h-16 w-16 text-primary-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">EmailJS Template Testing</h1>
        <p className="text-gray-600">Test both templates with your email address</p>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Email Address
        </label>
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter your email to receive test emails"
          required
        />
      </div>

      {result && (
        <div className={`mb-6 p-4 rounded-lg border ${
          result.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start">
            <SafeIcon 
              icon={result.success ? FiCheckCircle : FiAlertCircle} 
              className={`h-5 w-5 mr-3 mt-0.5 ${
                result.success ? 'text-green-600' : 'text-red-600'
              }`} 
            />
            <div>
              <p className={`font-medium ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.message}
              </p>
              {result.code && (
                <div className="mt-2 p-2 bg-green-100 rounded text-sm">
                  <p className="text-green-700">
                    <strong>Verification Code Generated:</strong> {result.code}
                  </p>
                  <p className="text-green-600 text-xs mt-1">
                    Check your email for this 6-digit code
                  </p>
                </div>
              )}
              {result.templateType && (
                <p className="text-sm text-gray-600 mt-1">
                  Template used: <strong>{result.templateType === 'general' ? 'template_general' : 'template_verification'}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-center mb-4">
            <SafeIcon icon={FiMail} className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-blue-900">General Template</h3>
            <p className="text-sm text-blue-700">template_general</p>
          </div>
          <p className="text-sm text-blue-800 mb-4">
            Tests contact forms, order notifications, supplier invites, and general communications.
          </p>
          <button
            onClick={() => runTest('general')}
            disabled={loading || !testEmail}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <SafeIcon icon={FiSend} className="h-4 w-4" />
            <span>Test General Template</span>
          </button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="text-center mb-4">
            <SafeIcon icon={FiShield} className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-green-900">Verification Template</h3>
            <p className="text-sm text-green-700">template_verification</p>
          </div>
          <p className="text-sm text-green-800 mb-4">
            Tests verification codes for signup, login, and security purposes.
          </p>
          <button
            onClick={() => runTest('verification')}
            disabled={loading || !testEmail}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <SafeIcon icon={FiShield} className="h-4 w-4" />
            <span>Test Verification Template</span>
          </button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Configuration Status</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <p>✅ Service ID: service_wi64yag</p>
          <p>✅ General Template: template_general</p>
          <p>✅ Verification Template: template_verification</p>
          <p>✅ Public Key: Configured</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">What to Expect:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• <strong>General Template:</strong> Contact form style email with subject and message</li>
          <li>• <strong>Verification Template:</strong> Security email with 6-digit code</li>
          <li>• Both emails should arrive within 1-2 minutes</li>
          <li>• Check your spam folder if emails don't arrive</li>
        </ul>
      </div>
    </div>
  )
}

export default EmailJSTest