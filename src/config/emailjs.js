// EmailJS Configuration for Production
export const emailjsConfig = {
  serviceId: 'service_wi64yag',
  templateIds: {
    general: 'template_general',
    verification: 'template_verification'
  },
  publicKey: 'vORcF7sb8ElcTqXWo',
  // Production sender configuration
  defaultSender: {
    name: 'Regravity Platform',
    email: 'noreply@regravity.net',
    replyTo: 'support@regravity.net'
  }
}

// Validate configuration
export const validateEmailJSConfig = () => {
  const { serviceId, templateIds, publicKey } = emailjsConfig
  
  if (!serviceId || !publicKey || !templateIds.general || !templateIds.verification) {
    console.error('EmailJS configuration incomplete')
    return false
  }
  
  console.log('✅ EmailJS configured for production domain')
  return true
}

// Initialize EmailJS for production
if (typeof window !== 'undefined') {
  import('@emailjs/browser').then(emailjs => {
    if (emailjs.default?.init) {
      emailjs.default.init(emailjsConfig.publicKey)
      console.log('✅ EmailJS initialized for regravity.net')
    }
  }).catch(error => {
    console.warn('⚠️ EmailJS initialization failed:', error)
  })
}