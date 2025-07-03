import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Add error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

console.log('🚀 Starting Regravity app...')

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

try {
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  )
  console.log('✅ Regravity app initialized successfully')
} catch (error) {
  console.error('❌ Failed to initialize app:', error)
  // Fallback rendering
  rootElement.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui; background: #f9fafb;">
      <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px;">
        <h1 style="color: #dc2626; margin-bottom: 1rem; font-size: 1.5rem;">Application Error</h1>
        <p style="color: #374151; margin-bottom: 1rem;">Failed to load the Regravity platform.</p>
        <p style="color: #6b7280; margin-bottom: 1.5rem; font-size: 0.9rem;">Error: ${error.message}</p>
        <button onclick="window.location.reload()" style="background: #2563eb; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem;">
          Reload Page
        </button>
      </div>
    </div>
  `
}