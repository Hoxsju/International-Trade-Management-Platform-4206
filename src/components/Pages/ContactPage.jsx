import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { EmailService } from '../../services/emailService'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiUser, FiMessageSquare, FiCheckCircle, FiAlertCircle } = FiIcons

const ContactPage = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    
    try {
      await EmailService.sendContactForm(data)
      setSuccess(true)
      reset()
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError('Failed to send message. Please try again or contact us directly.')
      console.error('Contact form error:', err)
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: FiMail,
      title: 'Email',
      details: ['support@regravity.net', 'sales@regravity.net'],
      description: 'Send us an email anytime'
    },
    {
      icon: FiPhone,
      title: 'Phone',
      details: ['+852 3008 5841'],
      description: 'Call us during business hours'
    },
    {
      icon: FiMapPin,
      title: 'Offices',
      details: ['Hong Kong: Regravity Ltd', 'China: Shanghai Regravity Trading Co., Ltd'],
      description: 'Visit our offices'
    },
    {
      icon: FiClock,
      title: 'Business Hours',
      details: ['Mon-Fri: 9:00 AM - 6:00 PM (HKT)', 'Sat: 9:00 AM - 1:00 PM (HKT)'],
      description: 'Emergency support available 24/7'
    }
  ]

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch with our team for support, questions, or to discuss your international trade needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <div className="flex items-center">
                  <SafeIcon icon={FiCheckCircle} className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-green-600 text-sm">Thank you for your message! We'll get back to you within 24 hours.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex items-center">
                  <SafeIcon icon={FiAlertCircle} className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <SafeIcon icon={FiUser} className="inline h-4 w-4 mr-1" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    {...register('fullName', { required: 'Full name is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <SafeIcon icon={FiMail} className="inline h-4 w-4 mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  {...register('subject', { required: 'Please select a subject' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a subject...</option>
                  <option value="general">General Inquiry</option>
                  <option value="services">Services Question</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership</option>
                  <option value="complaint">Complaint</option>
                </select>
                {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SafeIcon icon={FiMessageSquare} className="inline h-4 w-4 mr-1" />
                  Message
                </label>
                <textarea
                  {...register('message', { required: 'Message is required' })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Tell us about your inquiry or how we can help you..."
                />
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <SafeIcon icon={FiSend} className="h-4 w-4" />
                <span>{loading ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-100 p-3 rounded-lg flex-shrink-0">
                    <SafeIcon icon={info.icon} className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                    <div className="space-y-1 mb-2">
                      {info.details.map((detail, detailIndex) => (
                        <p key={detailIndex} className="text-gray-900 font-medium">{detail}</p>
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm">{info.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I create an order?</h3>
                <p className="text-gray-600">Register as a buyer, then use our order creation form to submit your purchase request with supplier details.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How long does supplier verification take?</h3>
                <p className="text-gray-600">Supplier verification typically takes 2-3 business days once all required documents are submitted.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600">We accept bank transfers, letters of credit, and other secure payment methods for international trade.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you provide shipping insurance?</h3>
                <p className="text-gray-600">Yes, we offer comprehensive shipping insurance as part of our shipping coordination service.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How do you handle disputes?</h3>
                <p className="text-gray-600">We have a structured dispute resolution process with legal backing in both Hong Kong and China.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I track my order status?</h3>
                <p className="text-gray-600">Yes, you can track your order status in real-time through your dashboard once logged in.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage