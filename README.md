# 🌟 Regravity International Trade Platform

A comprehensive international trade platform connecting overseas buyers with Chinese suppliers through verified contract management and dispute resolution services.

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview  # Test the build locally
```

## 📁 Deployment Ready

This app is **pre-configured** for deployment on all major platforms:

### ✅ **Netlify** (Recommended)
- Upload `dist/` folder
- Build command: `npm run build`
- Publish directory: `dist`
- ✨ Automatic configuration via `_redirects` and `netlify.toml`

### ✅ **Vercel**
- Import from GitHub
- Auto-detects settings
- ✨ Automatic configuration via `vercel.json`

### ✅ **GitHub Pages**
- Deploy `dist/` folder to `gh-pages` branch
- ✨ HashRouter works automatically

### ✅ **Traditional Hosting** (cPanel, etc.)
- Upload `dist/` contents to web root
- ✨ Automatic configuration via `.htaccess`

## 🔧 Deployment Commands

```bash
# Universal build (works everywhere)
npm run deploy

# Platform-specific builds
npm run deploy:netlify
npm run deploy:vercel  
npm run deploy:github
```

## 🛠️ Features

### 🔐 **Authentication System**
- Multi-role support (Admin, Buyer, Supplier)
- Email verification with EmailJS
- Secure session management
- Protected routes

### 📊 **Admin Dashboard**
- User management
- Supplier verification
- Order oversight
- Analytics and reporting
- Action logging

### 💼 **Trade Management**
- Order creation and tracking
- Supplier verification system
- Service orders (inspection, testing, etc.)
- Payment coordination
- Dispute resolution

### 📧 **Email Integration**
- EmailJS for notifications
- Verification codes
- Order confirmations
- Invitation system

## 🏗️ Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router (HashRouter for universal compatibility)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Email:** EmailJS
- **Icons:** React Icons (Feather)
- **Forms:** React Hook Form

## 🔒 Security Features

- Row Level Security (RLS)
- Admin action logging
- Email verification
- Session management
- Input validation
- CSRF protection

## 📱 Mobile Responsive

- Mobile-first design
- Touch-friendly interface
- Responsive navigation
- Optimized loading states

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 🚨 Troubleshooting

### Common Issues:

#### **404 Errors After Deployment:**
- ✅ Check `_redirects` file is in `public/`
- ✅ Verify build command: `npm run build`
- ✅ Ensure publish directory: `dist`
- ✅ See `DEPLOYMENT_TROUBLESHOOTING.md` for detailed fixes

#### **White Screen:**
- ✅ Check browser console for errors
- ✅ Verify all environment variables
- ✅ Test with `npm run preview` first

#### **Email Issues:**
- ✅ Verify EmailJS configuration
- ✅ Check spam folder
- ✅ Contact support for service issues

## 📞 Support

- 📧 **Email:** support@regravity.net
- 📱 **Phone:** +852 3008 5841
- 🌐 **Website:** regravity.net

## 📄 License

Copyright © 2024 Regravity Ltd. All rights reserved.

---

## 🎯 Quick Deploy Checklist

- [ ] Run `npm run build`
- [ ] Check `dist/` folder has files
- [ ] Upload to hosting platform
- [ ] Set build command: `npm run build`
- [ ] Set publish directory: `dist`
- [ ] Test all routes work
- [ ] Verify no 404 errors

**🚀 Ready to deploy? The app works on ANY hosting platform!**