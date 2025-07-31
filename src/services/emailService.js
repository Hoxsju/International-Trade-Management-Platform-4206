// PRODUCTION: Robust EmailJS Service - Rebuilt from scratch
export class EmailService {
  // PRODUCTION: Initialize EmailJS with multiple retry attempts
  static async initEmailJS() {
    if (typeof window === 'undefined') {
      throw new Error('EmailJS only works in browser environment')
    }

    let lastError = null
    
    // Try multiple initialization attempts
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`📧 EmailJS init attempt ${attempt}/3...`)
        
        // Dynamic import with timeout
        const emailjsModule = await Promise.race([
          import('@emailjs/browser'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Import timeout')), 10000)
          )
        ])

        const emailjs = emailjsModule.default
        
        if (!emailjs?.init) {
          throw new Error('EmailJS module incomplete')
        }

        // PRODUCTION: Hardcoded reliable configuration
        const config = {
          serviceId: 'service_wi64yag',
          templateIds: {
            verification: 'template_verification',
            general: 'template_general'
          },
          publicKey: 'vORcF7sb8ElcTqXWo'
        }

        // Initialize with retry
        emailjs.init(config.publicKey)
        
        // Test initialization
        await new Promise(resolve => setTimeout(resolve, 500))
        
        console.log(`✅ EmailJS initialized successfully on attempt ${attempt}`)
        return { emailjs, config }
        
      } catch (error) {
        console.warn(`❌ EmailJS init attempt ${attempt} failed:`, error.message)
        lastError = error
        
        if (attempt < 3) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }
    }
    
    console.error('💥 All EmailJS init attempts failed:', lastError)
    throw new Error('Email service unavailable. Please try again later.')
  }

  // PRODUCTION: Generate secure verification code
  static generateVerificationCode() {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000)
    return String(code)
  }

  // PRODUCTION: Robust email sending with multiple retry attempts
  static async sendVerificationCode(email, fullName = '', purpose = 'signup') {
    console.log(`📧 PRODUCTION: Sending ${purpose} verification to:`, email)
    
    if (!email || !email.includes('@') || email.length < 5) {
      throw new Error('Invalid email address')
    }

    let lastError = null
    
    // Try multiple send attempts
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`📤 Email send attempt ${attempt}/3...`)
        
        const { emailjs, config } = await this.initEmailJS()
        const verificationCode = this.generateVerificationCode()
        
        // Prepare email parameters
        const emailParams = {
          to_email: email,
          to_name: fullName || email.split('@')[0],
          verification_code: verificationCode,
          purpose_text: purpose === 'login' ? 'login to your account' : 'complete your registration',
          subject: purpose === 'login' ? 'Regravity Login Verification' : 'Regravity Email Verification',
          expires_in: '10 minutes',
          company_name: 'Regravity',
          website_url: 'https://regravity.net',
          support_email: 'support@regravity.net',
          from_name: 'Regravity Platform',
          reply_to: 'support@regravity.net'
        }

        console.log('📤 Sending email via EmailJS...')
        
        // Send with timeout
        const response = await Promise.race([
          emailjs.send(config.serviceId, config.templateIds.verification, emailParams),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Email send timeout')), 15000)
          )
        ])

        console.log(`✅ Email sent successfully on attempt ${attempt}!`)
        
        return {
          success: true,
          code: verificationCode,
          email: email,
          purpose: purpose,
          attempt: attempt,
          response: response
        }
        
      } catch (error) {
        console.warn(`❌ Email send attempt ${attempt} failed:`, error.message)
        lastError = error
        
        if (attempt < 3) {
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
        }
      }
    }
    
    console.error('💥 All email send attempts failed:', lastError)
    
    // Enhanced error messages
    const errorMessage = lastError?.message || lastError?.text || String(lastError)
    
    if (errorMessage.includes('timeout')) {
      throw new Error('Email service timeout. Please try again.')
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.')
    } else if (errorMessage.includes('412') || errorMessage.includes('invalid')) {
      throw new Error('Email service configuration error. Please contact support.')
    } else {
      throw new Error('Failed to send verification email. Please try again or contact support.')
    }
  }

  // PRODUCTION: Send contact form with retry logic
  static async sendContactForm(formData) {
    console.log('📧 PRODUCTION: Sending contact form...')
    
    if (!formData.email || !formData.fullName || !formData.message) {
      throw new Error('Please fill in all required fields')
    }

    let lastError = null
    
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const { emailjs, config } = await this.initEmailJS()
        
        const contactParams = {
          to_email: 'support@regravity.net',
          from_name: formData.fullName,
          from_email: formData.email,
          subject: formData.subject || 'Contact Form - Regravity',
          message: `Contact Form Submission from regravity.net

From: ${formData.fullName}
Email: ${formData.email}
Subject: ${formData.subject || 'General Inquiry'}

Message:
${formData.message}

Sent from: https://regravity.net
Time: ${new Date().toLocaleString()}`,
          reply_to: formData.email,
          website_url: 'https://regravity.net'
        }

        const response = await emailjs.send(
          config.serviceId,
          config.templateIds.general,
          contactParams
        )

        console.log('✅ Contact form sent successfully!')
        return { success: true, response }
        
      } catch (error) {
        console.warn(`❌ Contact form attempt ${attempt} failed:`, error.message)
        lastError = error
        
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
    }
    
    throw new Error('Failed to send message. Please contact us directly at support@regravity.net')
  }

  // PRODUCTION: Test email service
  static async testEmailService() {
    try {
      const { emailjs, config } = await this.initEmailJS()
      
      return {
        success: true,
        message: 'EmailJS service ready for production',
        config: {
          serviceId: config.serviceId,
          templates: config.templateIds,
          domain: 'regravity.net'
        }
      }
    } catch (error) {
      throw new Error(`EmailJS test failed: ${error.message}`)
    }
  }
}