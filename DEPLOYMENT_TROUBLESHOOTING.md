# 🚨 Deployment Troubleshooting Guide

## Common "Page Not Found" Fixes

### 🔍 **Step 1: Identify Your Hosting Platform**

#### **Netlify:**
- ✅ Files needed: `_redirects`, `netlify.toml`
- ✅ Build command: `npm run build`
- ✅ Publish directory: `dist`

#### **Vercel:**
- ✅ Files needed: `vercel.json`
- ✅ Auto-detects React apps
- ✅ Works with HashRouter

#### **GitHub Pages:**
- ✅ HashRouter works automatically
- ✅ Deploy `dist/` folder to `gh-pages` branch
- ✅ No configuration needed

#### **Traditional Hosting (cPanel, etc.):**
- ✅ Files needed: `.htaccess`
- ✅ Upload `dist/` contents to web root
- ✅ Apache mod_rewrite required

### 🔧 **Step 2: Platform-Specific Fixes**

#### **For Netlify:**
1. **Check Build Settings:**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

2. **Verify Files:**
   - `_redirects` in `public/` folder
   - `netlify.toml` in project root

3. **Manual Fix:**
   - Go to Netlify dashboard
   - Site settings → Build & deploy → Post processing
   - Enable "Asset optimization"

#### **For Vercel:**
1. **Check `vercel.json`:**
   ```json
   {
     "rewrites": [{"source": "/(.*)", "destination": "/index.html"}]
   }
   ```

2. **Import Project:**
   - Connect GitHub repo
   - Auto-detects build settings
   - Deploy automatically

#### **For GitHub Pages:**
1. **Build and Deploy:**
   ```bash
   npm run build
   # Deploy dist/ folder to gh-pages branch
   ```

2. **Settings:**
   - Repository → Settings → Pages
   - Source: Deploy from branch
   - Branch: gh-pages / root

#### **For cPanel/Traditional Hosting:**
1. **Upload Files:**
   - Build: `npm run build`
   - Upload `dist/` contents to `public_html/`

2. **Check `.htaccess`:**
   ```apache
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteRule ^ index.html [QSA,L]
   ```

### 🔍 **Step 3: Debugging Checklist**

#### **File Structure Check:**
```
dist/
├── index.html          ✅ Must exist
├── _redirects          ✅ For Netlify
├── .htaccess          ✅ For Apache
├── assets/            ✅ CSS/JS files
└── vite.svg           ✅ Favicon
```

#### **URL Testing:**
- ✅ Root: `your-site.com` → Should load
- ✅ Hash routes: `your-site.com/#/about` → Should load
- ✅ Direct routes: `your-site.com/about` → Should redirect to `/#/about`

#### **Browser Console Check:**
1. Open DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed requests
4. Look for 404s on assets

### 🚀 **Step 4: Quick Deploy Commands**

```bash
# For any platform
npm run deploy

# Platform-specific
npm run deploy:netlify
npm run deploy:vercel
npm run deploy:github
```

### 🆘 **Step 5: Emergency Fixes**

#### **If Nothing Works:**

1. **Force HashRouter Mode:**
   - All URLs will use `#` (e.g., `site.com/#/about`)
   - Works on ANY hosting platform
   - No configuration needed

2. **Manual Redirect Test:**
   - Visit: `your-site.com/#/`
   - If this works, it's a redirect issue

3. **Check Build Output:**
   ```bash
   npm run build
   cd dist
   ls -la  # Should see index.html and assets/
   ```

4. **Local Test:**
   ```bash
   npm run preview
   # Test all routes locally first
   ```

### 📞 **Still Having Issues?**

#### **Contact Information:**
- 📧 Email: support@regravity.net
- 📱 Phone: +852 3008 5841
- 💬 Include: Hosting platform, error message, URL

#### **Provide This Information:**
1. Hosting platform (Netlify, Vercel, etc.)
2. Exact error message
3. URL that's not working
4. Build command used
5. Screenshot of file structure

### ✅ **Success Indicators:**
- ✅ Homepage loads at root URL
- ✅ Direct links work (e.g., `/about`)
- ✅ Refresh works on any page
- ✅ No 404 errors in browser console
- ✅ All assets load correctly

The app is now configured to work on **ANY** hosting platform! 🌟