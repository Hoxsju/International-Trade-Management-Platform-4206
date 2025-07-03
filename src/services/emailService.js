export class EmailService {
  static async initEmailJS() {
    if (typeof window === 'undefined') {
      throw new Error('EmailJS only works in browser environment')
    }

    try {
      const emailjs = await import('@emailjs/browser')
      const { emailjsConfig } = await import('../config/emailjs.js')

      if (!emailjs.default?.init) {
        throw new Error('EmailJS not properly loaded')
      }

      emailjs.default.init(emailjsConfig.publicKey)
      return { emailjs: emailjs.default, config: emailjsConfig }
    } catch (error) {
      console.error('EmailJS initialization failed:', error)
      throw new Error('Email service unavailable')
    }
  }

  // FIXED: Get correct base URL for registration links
  static getBaseUrl() {
    if (typeof window !== 'undefined') {
      // For production, use the actual domain where the app is deployed
      const currentOrigin = window.location.origin
      
      // If we're on Quest platform, use the correct URL structure
      if (currentOrigin.includes('questprotocol.xyz')) {
        return currentOrigin
      }
      
      // For other deployments, use current origin
      return currentOrigin
    }
    
    // Fallback for server-side rendering
    return 'https://your-app-domain.com'
  }

  static generateVerificationCode() {
    const code = Math.floor(100000 + Math.random() * 900000)
    return String(code)
  }

  // ENHANCED: Robust verification code sending with fallback
  static async sendVerificationCode(email, fullName = '', purpose = 'signup') {
    try {
      console.log('📧 Starting verification email with robust delivery...', { email, purpose })
      const { emailjs, config } = await this.initEmailJS()
      const code = this.generateVerificationCode()

      // STRATEGY 1: Primary verification template
      console.log('📤 Attempt 1: Primary verification template...')
      try {
        const primaryParams = {
          to_email: email,
          to_name: fullName || email.split('@')[0],
          verification_code: code,
          purpose: purpose === 'login' ? 'login verification' : 'account registration',
          subject: purpose === 'login' ? 'Login verification code' : 'Complete your registration',
          expires_in: '10 minutes',
          company_name: 'Regravity',
          support_email: 'support@regravity.net',
          from_name: 'Regravity',
          reply_to: 'support@regravity.net'
        }

        const response = await emailjs.send(
          config.serviceId,
          config.templateIds.verification,
          primaryParams
        )

        console.log('✅ SUCCESS: Primary verification template worked!')
        return { success: true, code, response, method: 'primary_verification_template' }
      } catch (primaryError) {
        console.log('❌ Primary verification template failed:', primaryError.message)
      }

      // STRATEGY 2: Alternative verification via general template
      console.log('📤 Attempt 2: Verification via general template...')
      try {
        const altParams = {
          to_email: email,
          from_name: 'Regravity',
          subject: `Your verification code: ${code}`,
          message: `Your verification code is: ${code}

This code is for ${purpose === 'login' ? 'login verification' : 'account registration'}.

Code expires in 10 minutes.

If you didn't request this code, please ignore this email.

Best regards,
Regravity Team
support@regravity.net`,
          reply_to: 'support@regravity.net'
        }

        const response = await emailjs.send(
          config.serviceId,
          config.templateIds.general,
          altParams
        )

        console.log('✅ SUCCESS: Alternative verification template worked!')
        return { success: true, code, response, method: 'alternative_verification_template' }
      } catch (altError) {
        console.log('❌ Alternative verification template failed:', altError.message)
      }

      // STRATEGY 3: Minimal verification format
      console.log('📤 Attempt 3: Minimal verification format...')
      try {
        const minimalParams = {
          to_email: email,
          user_name: fullName || 'User',
          verification_code: code,
          message: `Verification code: ${code}`
        }

        const response = await emailjs.send(
          config.serviceId,
          config.templateIds.verification,
          minimalParams
        )

        console.log('✅ SUCCESS: Minimal verification format worked!')
        return { success: true, code, response, method: 'minimal_verification_format' }
      } catch (minimalError) {
        console.log('❌ Minimal verification format failed:', minimalError.message)
      }

      // If all strategies fail
      throw new Error('All verification email strategies failed. Email service configuration needs attention.')
    } catch (error) {
      console.error('❌ Verification email completely failed:', error)
      const errorMessage = error?.message || error?.text || String(error)
      
      if (errorMessage.includes('Outlook') && errorMessage.includes('right to send mail')) {
        throw new Error('Email service configuration issue: Please use the manual verification option or contact support.')
      } else if (errorMessage.includes('412')) {
        throw new Error('Email service configuration issue: Please try again or use manual verification.')
      } else {
        throw new Error(`Verification email failed: ${errorMessage}`)
      }
    }
  }

  // ENHANCED: Robust contact form sending
  static async sendContactForm(formData) {
    try {
      console.log('📧 Starting contact form with robust delivery...', formData.subject)
      const { emailjs, config } = await this.initEmailJS()

      // STRATEGY 1: Primary contact template
      console.log('📤 Attempt 1: Primary contact template...')
      try {
        const primaryParams = {
          to_email: 'support@regravity.net',
          from_name: formData.fullName,
          from_email: formData.email,
          subject: formData.subject || 'Contact Form Submission',
          message: formData.message,
          reply_to: formData.email,
          timestamp: new Date().toLocaleString()
        }

        const response = await emailjs.send(
          config.serviceId,
          config.templateIds.general,
          primaryParams
        )

        console.log('✅ SUCCESS: Primary contact template worked!')
        return { success: true, response, method: 'primary_contact_template' }
      } catch (primaryError) {
        console.log('❌ Primary contact template failed:', primaryError.message)
      }

      // STRATEGY 2: Alternative contact format
      console.log('📤 Attempt 2: Alternative contact format...')
      try {
        const altParams = {
          to_email: 'support@regravity.net',
          user_name: formData.fullName,
          user_email: formData.email,
          message: `Contact Form Submission

From: ${formData.fullName} (${formData.email})
Subject: ${formData.subject || 'General Inquiry'}

Message:
${formData.message}

Sent: ${new Date().toLocaleString()}`
        }

        const response = await emailjs.send(
          config.serviceId,
          config.templateIds.verification,
          altParams
        )

        console.log('✅ SUCCESS: Alternative contact format worked!')
        return { success: true, response, method: 'alternative_contact_format' }
      } catch (altError) {
        console.log('❌ Alternative contact format failed:', altError.message)
      }

      // STRATEGY 3: Minimal contact format
      console.log('📤 Attempt 3: Minimal contact format...')
      try {
        const minimalParams = {
          to_email: 'support@regravity.net',
          message: `${formData.fullName} (${formData.email}): ${formData.message}`
        }

        const response = await emailjs.send(
          config.serviceId,
          config.templateIds.general,
          minimalParams
        )

        console.log('✅ SUCCESS: Minimal contact format worked!')
        return { success: true, response, method: 'minimal_contact_format' }
      } catch (minimalError) {
        console.log('❌ Minimal contact format failed:', minimalError.message)
      }

      throw new Error('All contact form strategies failed')
    } catch (error) {
      console.error('Contact form error:', error)
      throw new Error('Failed to send contact form. Please try again or contact us directly at support@regravity.net')
    }
  }

  // NEW: Service order notification
  static async sendServiceOrderNotification(serviceOrderData) {
    try {
      console.log('📧 Starting service order notification...', serviceOrderData.service_order_id)
      const { emailjs, config } = await this.initEmailJS()

      const serviceDetails = typeof serviceOrderData.service_details === 'string' 
        ? serviceOrderData.service_details 
        : JSON.stringify(serviceOrderData.service_details, null, 2)

      // STRATEGY 1: Primary service order notification
      console.log('📤 Attempt 1: Primary service order notification...')
      try {
        const primaryParams = {
          to_email: 'orders@regravity.net',
          from_name: 'Regravity Service System',
          subject: `New Service Order - ${serviceOrderData.service_order_id}`,
          message: `New Service Order Created

Service Order Details:
- Order ID: ${serviceOrderData.service_order_id}
- Service: ${serviceOrderData.service_name}
- Service Type: ${serviceOrderData.service_type}
- Cost: ${serviceOrderData.service_cost > 0 ? `$${serviceOrderData.service_cost}` : 'Quote Required'}

Buyer Information:
- Name: ${serviceOrderData.buyer_name}
- Company: ${serviceOrderData.buyer_company}
- Email: ${serviceOrderData.buyer_email}

${serviceOrderData.supplier_name ? `Supplier: ${serviceOrderData.supplier_name}` : ''}
${serviceOrderData.supplier_email ? `Supplier Email: ${serviceOrderData.supplier_email}` : ''}

Service Details:
${serviceDetails}

Please review this service order in the admin dashboard.

Service Management: ${this.getBaseUrl()}/#/dashboard`,
          timestamp: new Date().toLocaleString(),
          reply_to: 'support@regravity.net'
        }

        const response = await emailjs.send(
          config.serviceId,
          config.templateIds.general,
          primaryParams
        )

        console.log('✅ SUCCESS: Service order notification sent!')
        return { success: true, response, method: 'primary_service_notification' }
      } catch (primaryError) {
        console.log('❌ Primary service notification failed:', primaryError.message)
      }

      // STRATEGY 2: Alternative service notification format
      console.log('📤 Attempt 2: Alternative service notification format...')
      try {
        const altParams = {
          to_email: 'orders@regravity.net',
          user_name: 'Admin Team',
          message: `New Service Order: ${serviceOrderData.service_order_id} - ${serviceOrderData.service_name} - ${serviceOrderData.buyer_company}`
        }

        const response = await emailjs.send(
          config.serviceId,
          config.templateIds.verification,
          altParams
        )

        console.log('✅ SUCCESS: Alternative service notification worked!')
        return { success: true, response, method: 'alternative_service_notification' }
      } catch (altError) {
        console.log('❌ Alternative service notification failed:', altError.message)
      }

      throw new Error('All service order notification strategies failed')
    } catch (error) {
      console.error('Service order notification error:', error)
      throw new Error('Failed to send service order notification')
    }
  }

  // ENHANCED: Robust order notification sending
  static async sendOrderNotification(orderData) {
    try {
      console.log('📧 Starting order notification with robust delivery...', orderData.order_id)
      const { emailjs, config } = await this.initEmailJS()

      const services = Object.keys(orderData.selected_services || {})
        .filter(key => orderData.selected_services[key])
        .join(', ') || 'None'

      const baseUrl = this.getBaseUrl()

      // STRATEGY 1: Primary order notification
      console.log('📤 Attempt 1: Primary order notification...')
      try {
        const primaryParams = {
          to_email: 'orders@regravity.net',
          from_name: 'Regravity Order System',
          subject: `New Order Created - ${orderData.order_id}`,
          message: `New Order Details:

Order ID: ${orderData.order_id}
Buyer: ${orderData.buyer_name}
Company: ${orderData.buyer_company}
Supplier: ${orderData.supplier_name}
Product: ${orderData.product_description}
Amount: $${orderData.deal_amount}
Services: ${services}

Please review this order in the admin dashboard.

Order Management: ${baseUrl}/#/dashboard`,
          timestamp: new Date().toLocaleString(),
          reply_to: 'support@regravity.net'
        }

        const response = await emailjs.send(
          config.serviceId,
          config.templateIds.general,
          primaryParams
        )

        console.log('✅ SUCCESS: Primary order notification worked!')
        return { success: true, response, method: 'primary_order_notification' }
      } catch (primaryError) {
        console.log('❌ Primary order notification failed:', primaryError.message)
      }

      // STRATEGY 2: Alternative order format
      console.log('📤 Attempt 2: Alternative order format...')
      try {
        const altParams = {
          to_email: 'orders@regravity.net',
          user_name: 'Admin Team',
          message: `New Order: ${orderData.order_id} - ${orderData.buyer_company} - $${orderData.deal_amount}`
        }

        const response = await emailjs.send(
          config.serviceId,
          config.templateIds.verification,
          altParams
        )

        console.log('✅ SUCCESS: Alternative order format worked!')
        return { success: true, response, method: 'alternative_order_format' }
      } catch (altError) {
        console.log('❌ Alternative order format failed:', altError.message)
      }

      throw new Error('All order notification strategies failed')
    } catch (error) {
      console.error('Order notification error:', error)
      throw new Error('Failed to send order notification')
    }
  }

  // ENHANCED: Robust supplier invitation
  static async sendSupplierInvite(supplierData, orderData) {
    try {
      console.log('📧 Starting supplier invitation with robust delivery...', supplierData.email)
      const { emailjs, config } = await this.initEmailJS()

      const baseUrl = this.getBaseUrl()
      const registrationLink = `${baseUrl}/#/register?type=supplier&invite=${orderData.order_id}`

      // STRATEGY 1: Primary supplier invitation
      console.log('📤 Attempt 1: Primary supplier invitation...')
      try {
        const primaryParams = {
          to_email: supplierData.email,
          from_name: 'Regravity',
          subject: `Trade Order Invitation - ${orderData.order_id}`,
          message: `Dear ${supplierData.name},

${orderData.buyer_company} has created a new trade order and selected you as the supplier.

Order Details:
- Order ID: ${orderData.order_id}
- Product: ${orderData.product_description}
- Amount: $${orderData.deal_amount}
- Buyer: ${orderData.buyer_company}

To proceed with this order, please register on our platform:
${registrationLink}

Once registered, you'll be able to:
• View the complete order details
• Accept or negotiate the order
• Track the order progress
• Access secure payment processing

If you have any questions, contact our support team:
support@regravity.net
+852 3008 5841

Best regards,
Regravity Trade Team`,
          timestamp: new Date().toLocaleString(),
          reply_to: 'support@regravity.net'
        }

        const response = await emailjs.send(
          config.serviceId,
          config.templateIds.general,
          primaryParams
        )

        console.log('✅ SUCCESS: Primary supplier invitation worked!')
        return { success: true, response, method: 'primary_supplier_invitation' }
      } catch (primaryError) {
        console.log('❌ Primary supplier invitation failed:', primaryError.message)
      }

      // STRATEGY 2: Alternative supplier format
      console.log('📤 Attempt 2: Alternative supplier format...')
      try {
        const altParams = {
          to_email: supplierData.email,
          user_name: supplierData.name,
          verification_code: orderData.order_id,
          message: `Trade order invitation from ${orderData.buyer_company}. Register: ${registrationLink}`
        }

        const response = await emailjs.send(
          config.serviceId,
          config.templateIds.verification,
          altParams
        )

        console.log('✅ SUCCESS: Alternative supplier format worked!')
        return { success: true, response, method: 'alternative_supplier_format' }
      } catch (altError) {
        console.log('❌ Alternative supplier format failed:', altError.message)
      }

      throw new Error('All supplier invitation strategies failed')
    } catch (error) {
      console.error('Supplier invite error:', error)
      throw new Error('Failed to send supplier invitation')
    }
  }

  // ENHANCED: Robust user invitation with comprehensive fallback handling
  static async sendUserInvitation(invitationData) {
    try {
      console.log('📧 Starting user invitation with robust delivery...', invitationData.email)
      
      // Validate input data
      if (!invitationData?.email || !invitationData?.name) {
        throw new Error('Email and name are required for invitation')
      }

      const sanitizedData = {
        email: String(invitationData.email).trim(),
        name: String(invitationData.name).trim(),
        company: String(invitationData.company || 'Not specified').trim(),
        accountType: String(invitationData.accountType || 'buyer').trim(),
        invitedBy: String(invitationData.invitedBy || 'Admin').trim()
      }

      console.log('📋 Sanitized invitation data:', sanitizedData)

      const { emailjs, config } = await this.initEmailJS()
      const baseUrl = this.getBaseUrl()
      const registrationLink = `${baseUrl}/#/register?type=${sanitizedData.accountType}&invited=true`

      // STRATEGY 1: Primary invitation template
      console.log('📤 Attempt 1: Primary invitation template...')
      try {
        const primaryParams = {
          to_email: sanitizedData.email,
          from_name: 'Regravity',
          subject: 'Join Regravity Platform - Account Invitation',
          message: `Dear ${sanitizedData.name},

You have been invited to join the Regravity international trade platform by ${sanitizedData.invitedBy}.

Account Details:
- Name: ${sanitizedData.name}
- Company: ${sanitizedData.company}
- Account Type: ${sanitizedData.accountType}

Registration Link: ${registrationLink}

With Regravity, you can:
• Connect with verified international partners
• Manage secure trade contracts
• Access quality control services
• Resolve disputes with legal backing

Platform Features:
• Supplier verification system
• Secure payment processing
• Quality inspection services
• 24/7 customer support

To get started:
1. Click the registration link above
2. Complete your profile information
3. Verify your email address
4. Start trading securely

If you have any questions, contact our support team:
support@regravity.net
+852 3008 5841

Best regards,
Regravity Team`,
          reply_to: 'support@regravity.net',
          timestamp: new Date().toLocaleString()
        }

        const response = await emailjs.send(
          config.serviceId,
          config.templateIds.general,
          primaryParams
        )

        console.log('✅ SUCCESS: Primary invitation template worked!')
        return { success: true, response, method: 'primary_invitation_template', email: sanitizedData.email }
      } catch (primaryError) {
        console.log('❌ Primary invitation template failed:', primaryError.message)
      }

      // STRATEGY 2: Alternative invitation via verification template
      console.log('📤 Attempt 2: Alternative invitation via verification template...')
      try {
        const altParams = {
          to_email: sanitizedData.email,
          to_name: sanitizedData.name,
          verification_code: 'INVITATION',
          purpose: 'platform invitation',
          company_name: 'Regravity',
          support_email: 'support@regravity.net'
        }

        const response = await emailjs.send(
          config.serviceId,
          config.templateIds.verification,
          altParams
        )

        console.log('✅ SUCCESS: Alternative invitation template worked!')
        return { success: true, response, method: 'alternative_invitation_template', email: sanitizedData.email }
      } catch (altError) {
        console.log('❌ Alternative invitation template failed:', altError.message)
      }

      // STRATEGY 3: Minimal invitation format
      console.log('📤 Attempt 3: Minimal invitation format...')
      try {
        const minimalParams = {
          to_email: sanitizedData.email,
          user_name: sanitizedData.name,
          user_email: sanitizedData.email,
          message: `You're invited to join Regravity!

Company: ${sanitizedData.company}
Account Type: ${sanitizedData.accountType}

Register: ${registrationLink}

Support: support@regravity.net`
        }

        const response = await emailjs.send(
          config.serviceId,
          config.templateIds.verification,
          minimalParams
        )

        console.log('✅ SUCCESS: Minimal invitation format worked!')
        return { success: true, response, method: 'minimal_invitation_format', email: sanitizedData.email }
      } catch (minimalError) {
        console.log('❌ Minimal invitation format failed:', minimalError.message)
      }

      // If all strategies fail, throw a comprehensive error
      throw new Error('All invitation email strategies failed. Email service needs attention.')
    } catch (error) {
      console.error('❌ User invitation completely failed:', error)
      const errorMessage = error?.message || error?.text || String(error)
      
      // Provide specific error messages based on the error type
      if (errorMessage.includes('Outlook') && errorMessage.includes('right to send mail')) {
        throw new Error('Email service configuration issue: The EmailJS service needs reconfiguration. Please use the manual invitation option.')
      } else if (errorMessage.includes('412')) {
        throw new Error('Email service configuration issue: Please try the manual invitation option or contact administrator.')
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        throw new Error('Network error: Failed to connect to email service. Please check your internet connection.')
      } else {
        throw new Error(`Email service temporarily unavailable: ${errorMessage}`)
      }
    }
  }

  // ENHANCED: Admin user invitation with better fallback handling
  static async sendAdminUserInvitation(formData, invitedBy) {
    try {
      console.log('🔧 Admin invitation request with robust delivery...', formData.email)
      
      if (!formData?.email || !formData?.full_name) {
        throw new Error('Email and full name are required')
      }

      const invitationData = {
        email: formData.email.trim(),
        name: formData.full_name.trim(),
        company: formData.company_name || 'Not specified',
        accountType: formData.account_type || 'buyer',
        invitedBy: invitedBy || 'Admin'
      }

      return await this.sendUserInvitation(invitationData)
    } catch (error) {
      console.error('❌ Admin invitation failed:', error)
      throw error
    }
  }

  // ENHANCED: Robust registration notification
  static async sendRegistrationNotification(userData) {
    try {
      console.log('📧 Starting registration notification with robust delivery...', userData.email)
      const { emailjs, config } = await this.initEmailJS()
      const baseUrl = this.getBaseUrl()

      // STRATEGY 1: Primary registration notification
      console.log('📤 Attempt 1: Primary registration notification...')
      try {
        const primaryParams = {
          to_email: userData.email,
          from_name: 'Regravity',
          subject: 'Welcome to Regravity - Registration Successful',
          message: `Dear ${userData.fullName},

Welcome to Regravity! Your account has been successfully created.

Account Details:
- Name: ${userData.fullName}
- Email: ${userData.email}
- Company: ${userData.companyName}
- Account Type: ${userData.accountType}

Next Steps:
1. Complete your profile information
2. Verify any pending documentation
3. Start exploring the platform features

Dashboard: ${baseUrl}/#/dashboard

Platform Features:
• Secure international trade management
• Verified supplier network
• Quality control services
• Dispute resolution support

If you need assistance, our support team is here to help:
support@regravity.net
+852 3008 5841

Best regards,
Regravity Team`,
          reply_to: 'support@regravity.net',
          timestamp: new Date().toLocaleString()
        }

        const response = await emailjs.send(
          config.serviceId,
          config.templateIds.general,
          primaryParams
        )

        console.log('✅ SUCCESS: Primary registration notification worked!')
        return { success: true, response, method: 'primary_registration_notification' }
      } catch (primaryError) {
        console.log('❌ Primary registration notification failed:', primaryError.message)
      }

      // STRATEGY 2: Alternative registration format
      console.log('📤 Attempt 2: Alternative registration format...')
      try {
        const altParams = {
          to_email: userData.email,
          user_name: userData.fullName,
          verification_code: 'WELCOME',
          message: `Welcome to Regravity! Your ${userData.accountType} account is ready.`
        }

        const response = await emailjs.send(
          config.serviceId,
          config.templateIds.verification,
          altParams
        )

        console.log('✅ SUCCESS: Alternative registration format worked!')
        return { success: true, response, method: 'alternative_registration_format' }
      } catch (altError) {
        console.log('❌ Alternative registration format failed:', altError.message)
      }

      throw new Error('All registration notification strategies failed')
    } catch (error) {
      console.error('Registration notification error:', error)
      // Don't throw error for registration notifications - they're not critical
      console.warn('Registration notification failed, but registration was successful')
      return { success: false, error: error.message }
    }
  }

  // ENHANCED: Robust buyer invitation from dashboard
  static async sendBuyerInvitation(invitationData, senderInfo) {
    try {
      console.log('📧 Starting buyer invitation from dashboard with robust delivery...')
      
      const enhancedInvitationData = {
        ...invitationData,
        invitedBy: `${senderInfo.name} (${senderInfo.company})`,
        senderCompany: senderInfo.company,
        senderEmail: senderInfo.email
      }

      const { emailjs, config } = await this.initEmailJS()
      const baseUrl = this.getBaseUrl()
      const registrationLink = `${baseUrl}/#/register?type=buyer&invited=true&ref=${encodeURIComponent(senderInfo.company)}`

      // STRATEGY 1: Primary buyer invitation
      console.log('📤 Attempt 1: Primary buyer invitation...')
      try {
        const primaryParams = {
          to_email: enhancedInvitationData.email,
          from_name: 'Regravity',
          subject: `Business Invitation from ${senderInfo.company}`,
          message: `Dear ${enhancedInvitationData.name},

${senderInfo.name} from ${senderInfo.company} has invited you to join the Regravity international trade platform.

Invitation Details:
- Invited by: ${senderInfo.name}
- Company: ${senderInfo.company}
- Your Role: ${enhancedInvitationData.accountType}

Why Join Regravity?
• Connect with verified international suppliers
• Secure trade contract management
• Professional quality control services
• Legal dispute resolution support
• Transparent payment processing

Registration Link: ${registrationLink}

The person who invited you will be able to see when you join and can help guide you through the platform.

Platform Benefits:
• Access to 1000+ verified suppliers
• End-to-end trade management
• Quality inspection services
• 24/7 multilingual support

Questions? Contact us:
support@regravity.net
+852 3008 5841

Best regards,
Regravity Team`,
          reply_to: 'support@regravity.net',
          timestamp: new Date().toLocaleString()
        }

        const response = await emailjs.send(
          config.serviceId,
          config.templateIds.general,
          primaryParams
        )

        console.log('✅ SUCCESS: Primary buyer invitation worked!')
        return { success: true, response, method: 'primary_buyer_invitation' }
      } catch (primaryError) {
        console.log('❌ Primary buyer invitation failed:', primaryError.message)
      }

      // STRATEGY 2: Alternative buyer format
      console.log('📤 Attempt 2: Alternative buyer invitation format...')
      try {
        const altParams = {
          to_email: enhancedInvitationData.email,
          user_name: enhancedInvitationData.name,
          verification_code: senderInfo.company,
          message: `${senderInfo.name} invited you to join Regravity. Register: ${registrationLink}`
        }

        const response = await emailjs.send(
          config.serviceId,
          config.templateIds.verification,
          altParams
        )

        console.log('✅ SUCCESS: Alternative buyer invitation worked!')
        return { success: true, response, method: 'alternative_buyer_invitation' }
      } catch (altError) {
        console.log('❌ Alternative buyer invitation failed:', altError.message)
      }

      throw new Error('All buyer invitation strategies failed')
    } catch (error) {
      console.error('Buyer invitation error:', error)
      throw new Error('Failed to send buyer invitation')
    }
  }

  // ENHANCED: Robust supplier invitation from dashboard
  static async sendSupplierInvitationFromDashboard(invitationData, senderInfo) {
    try {
      console.log('📧 Starting supplier invitation from dashboard with robust delivery...')
      
      const enhancedInvitationData = {
        ...invitationData,
        invitedBy: `${senderInfo.name} (${senderInfo.company})`,
        senderCompany: senderInfo.company,
        senderEmail: senderInfo.email
      }

      const { emailjs, config } = await this.initEmailJS()
      const baseUrl = this.getBaseUrl()
      const registrationLink = `${baseUrl}/#/register?type=supplier&invited=true&ref=${encodeURIComponent(senderInfo.company)}`

      // STRATEGY 1: Primary supplier dashboard invitation
      console.log('📤 Attempt 1: Primary supplier dashboard invitation...')
      try {
        const primaryParams = {
          to_email: enhancedInvitationData.email,
          from_name: 'Regravity',
          subject: `Supplier Partnership Invitation from ${senderInfo.company}`,
          message: `Dear ${enhancedInvitationData.name},

${senderInfo.name} from ${senderInfo.company} has invited you to join Regravity as a verified supplier.

Invitation Details:
- Invited by: ${senderInfo.name}
- Buyer Company: ${senderInfo.company}
- Your Role: Verified Supplier

Supplier Benefits on Regravity:
• Direct access to international buyers
• Secure payment guarantees
• Professional verification system
• Quality control support
• Legal contract protection

Registration Link: ${registrationLink}

As a Regravity supplier, you'll receive:
• Enhanced credibility with verification badge
• Priority listing in supplier directory
• Professional order management tools
• Secure payment processing
• Dispute resolution support

Verification Process:
1. Complete your supplier registration
2. Submit business documentation
3. Pass our verification review
4. Start receiving buyer inquiries

The verification process typically takes 2-3 business days and significantly increases your credibility with international buyers.

Questions about becoming a supplier?
supplier-support@regravity.net
+852 3008 5841

Best regards,
Regravity Supplier Team`,
          reply_to: 'supplier-support@regravity.net',
          timestamp: new Date().toLocaleString()
        }

        const response = await emailjs.send(
          config.serviceId,
          config.templateIds.general,
          primaryParams
        )

        console.log('✅ SUCCESS: Primary supplier dashboard invitation worked!')
        return { success: true, response, method: 'primary_supplier_dashboard_invitation' }
      } catch (primaryError) {
        console.log('❌ Primary supplier dashboard invitation failed:', primaryError.message)
      }

      // STRATEGY 2: Alternative supplier dashboard format
      console.log('📤 Attempt 2: Alternative supplier dashboard format...')
      try {
        const altParams = {
          to_email: enhancedInvitationData.email,
          user_name: enhancedInvitationData.name,
          verification_code: senderInfo.company,
          purpose: 'supplier partnership',
          company_name: 'Regravity',
          support_email: 'supplier-support@regravity.net'
        }

        const response = await emailjs.send(
          config.serviceId,
          config.templateIds.verification,
          altParams
        )

        console.log('✅ SUCCESS: Alternative supplier dashboard format worked!')
        return { success: true, response, method: 'alternative_supplier_dashboard_format' }
      } catch (altError) {
        console.log('❌ Alternative supplier dashboard format failed:', altError.message)
      }

      throw new Error('All supplier dashboard invitation strategies failed')
    } catch (error) {
      console.error('Supplier dashboard invitation error:', error)
      throw new Error('Failed to send supplier invitation from dashboard')
    }
  }

  // Test function to diagnose EmailJS issues
  static async testEmailService() {
    try {
      console.log('🧪 Testing EmailJS service...')
      const { emailjs, config } = await this.initEmailJS()
      
      console.log('✅ EmailJS initialized successfully')
      console.log('📊 Service configuration:', {
        serviceId: config.serviceId,
        generalTemplate: config.templateIds.general,
        verificationTemplate: config.templateIds.verification,
        baseUrl: this.getBaseUrl()
      })
      
      return {
        success: true,
        config,
        baseUrl: this.getBaseUrl(),
        message: 'EmailJS service initialized and ready for robust email delivery'
      }
    } catch (error) {
      console.error('❌ EmailJS service test failed:', error)
      throw new Error(`EmailJS service test failed: ${error.message}`)
    }
  }

  // CREATE MANUAL FALLBACK TEXT for any type of email
  static createManualFallbackText(emailType, data) {
    const baseUrl = this.getBaseUrl()
    
    switch (emailType) {
      case 'user_invitation':
        return this.createManualInvitationText(data)
        
      case 'supplier_invitation':
        const supplierLink = `${baseUrl}/#/register?type=supplier&invite=${data.orderId}`
        return `
MANUAL SUPPLIER INVITATION - Copy and send this to ${data.email}:

Subject: Trade Order Invitation - ${data.orderId}

Dear ${data.name},

${data.buyerCompany} has created a trade order and selected you as the supplier.

Order Details:
- Order ID: ${data.orderId}
- Product: ${data.productDescription}
- Amount: $${data.dealAmount}

Registration Link: ${supplierLink}

Once registered, you can view the complete order details and begin the trade process.

Support: support@regravity.net
        `.trim()
        
      case 'buyer_invitation':
        const buyerLink = `${baseUrl}/#/register?type=buyer&invited=true`
        return `
MANUAL BUYER INVITATION - Copy and send this to ${data.email}:

Subject: Business Invitation from ${data.senderCompany}

Dear ${data.name},

${data.senderName} from ${data.senderCompany} has invited you to join the Regravity international trade platform.

Registration Link: ${buyerLink}

Platform Benefits:
• Connect with verified suppliers
• Secure trade management
• Quality control services

Support: support@regravity.net
        `.trim()
        
      case 'verification_code':
        return `
MANUAL VERIFICATION CODE - Send this to ${data.email}:

Subject: Your verification code

Your verification code is: ${data.code}

This code expires in 10 minutes. If you didn't request this code, please ignore this message.

Support: support@regravity.net
        `.trim()
        
      case 'registration_welcome':
        return `
MANUAL WELCOME MESSAGE - Send this to ${data.email}:

Subject: Welcome to Regravity

Dear ${data.name},

Welcome to Regravity! Your ${data.accountType} account has been successfully created.

Dashboard: ${baseUrl}/#/dashboard

Support: support@regravity.net
        `.trim()
        
      default:
        return `
MANUAL EMAIL - Send this to ${data.email}:

Subject: ${data.subject || 'Message from Regravity'}

${data.message}

Support: support@regravity.net
        `.trim()
    }
  }

  // Legacy method - keep for compatibility
  static createManualInvitationText(invitationData) {
    const baseUrl = this.getBaseUrl()
    const registrationLink = `${baseUrl}/#/register?type=${invitationData.accountType}&invited=true`
    
    return `
MANUAL INVITATION - Copy and send this to ${invitationData.email}:

Subject: You're invited to join Regravity Platform

Dear ${invitationData.name},

You have been invited to join the Regravity international trade platform by ${invitationData.invitedBy}.

Account Details:
- Name: ${invitationData.name}
- Company: ${invitationData.company}
- Account Type: ${invitationData.accountType}

Registration Link: ${registrationLink}

With Regravity, you can:
• Connect with verified international partners
• Manage secure trade contracts
• Access quality control services
• Resolve disputes with legal backing

If you have questions, contact:
support@regravity.net

Best regards,
Regravity Team
    `.trim()
  }
}