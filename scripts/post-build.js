import fs from 'fs'
import path from 'path'

console.log('🔧 Running post-build optimizations...')

const distPath = './dist'

// Ensure _redirects file is in dist for Netlify
const redirectsSource = './public/_redirects'
const redirectsTarget = path.join(distPath, '_redirects')

if (fs.existsSync(redirectsSource)) {
  fs.copyFileSync(redirectsSource, redirectsTarget)
  console.log('✅ Copied _redirects to dist/')
}

// Ensure .htaccess file is in dist for Apache servers
const htaccessSource = './.htaccess'
const htaccessTarget = path.join(distPath, '.htaccess')

if (fs.existsSync(htaccessSource)) {
  fs.copyFileSync(htaccessSource, htaccessTarget)
  console.log('✅ Copied .htaccess to dist/')
}

// Create a deployment info file
const deployInfo = {
  buildDate: new Date().toISOString(),
  platform: 'Universal (Netlify, Vercel, GitHub Pages, Apache)',
  routing: 'HashRouter with fallbacks',
  files: [
    '_redirects (Netlify)',
    'vercel.json (Vercel)', 
    '.htaccess (Apache)',
    'netlify.toml (Netlify backup)'
  ]
}

fs.writeFileSync(
  path.join(distPath, 'deployment-info.json'), 
  JSON.stringify(deployInfo, null, 2)
)

console.log('✅ Post-build optimization complete!')
console.log('📁 Files ready for deployment:')
console.log('   • dist/ folder contains your app')
console.log('   • _redirects for Netlify')
console.log('   • vercel.json for Vercel')
console.log('   • .htaccess for Apache servers')
console.log('🚀 Ready to deploy!')