// EmailJS Configuration - FIXED to avoid Outlook permission issues
export const emailjsConfig = {
  serviceId: 'service_wi64yag',
  templateIds: {
    general: 'template_general',
    verification: 'template_verification'
  },
  publicKey: 'vORcF7sb8ElcTqXWo',
  // FIXED: Add sender configuration to avoid permission issues
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
  
  console.log('✅ EmailJS configured with fixed sender settings')
  return true
}

// Initialize EmailJS when in browser (only in development)
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  import('@emailjs/browser').then(emailjs => {
    if (emailjs.default?.init) {
      emailjs.default.init(emailjsConfig.publicKey)
      console.log('✅ EmailJS initialized with fixed configuration')
    }
  }).catch(error => {
    console.warn('⚠️ EmailJS initialization failed:', error)
  })
}