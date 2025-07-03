import React, { Suspense } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import './App.css'

// Lazy load components for better performance
const HomePage = React.lazy(() => import('./components/Pages/HomePage'))
const AboutPage = React.lazy(() => import('./components/Pages/AboutPage'))
const ServicesPage = React.lazy(() => import('./components/Pages/ServicesPage'))
const ContactPage = React.lazy(() => import('./components/Pages/ContactPage'))
const TermsPage = React.lazy(() => import('./components/Pages/TermsPage'))
const PrivacyPage = React.lazy(() => import('./components/Pages/PrivacyPage'))
const DisputeResolutionPage = React.lazy(() => import('./components/Pages/DisputeResolutionPage'))
const RefundPolicyPage = React.lazy(() => import('./components/Pages/RefundPolicyPage'))
const LoginForm = React.lazy(() => import('./components/Auth/LoginForm'))
const RegisterForm = React.lazy(() => import('./components/Auth/RegisterForm'))
const DashboardRouter = React.lazy(() => import('./components/Dashboard/DashboardRouter'))
const CreateOrderForm = React.lazy(() => import('./components/Orders/CreateOrderForm'))
const OrderDetailPage = React.lazy(() => import('./components/Orders/OrderDetailPage'))
const ProtectedRoute = React.lazy(() => import('./components/Auth/ProtectedRoute'))

// Testing Routes
const EmailJSTest = React.lazy(() => import('./components/EmailJS/EmailJSTest'))
const AutoTestSender = React.lazy(() => import('./components/EmailJS/AutoTestSender'))
const DirectEmailTest = React.lazy(() => import('./components/EmailJS/DirectEmailTest'))
const SystemTest = React.lazy(() => import('./components/Testing/SystemTest'))
const RLSTestComponent = React.lazy(() => import('./components/Testing/RLSTestComponent'))
const RegistrationTest = React.lazy(() => import('./components/Testing/RegistrationTest'))
const QuickRegistrationTest = React.lazy(() => import('./components/Testing/QuickRegistrationTest'))
const FunctionTest = React.lazy(() => import('./components/Testing/FunctionTest'))
const ProfileDebugTest = React.lazy(() => import('./components/Testing/ProfileDebugTest'))
const RegistrationLoginTest = React.lazy(() => import('./components/Testing/RegistrationLoginTest'))
const AccountSetupTest = React.lazy(() => import('./components/Testing/AccountSetupTest'))
const CompleteAccountTest = React.lazy(() => import('./components/Testing/CompleteAccountTest'))

// Enhanced Loading component
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-64">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">Loading...</p>
    </div>
  </div>
)

// Enhanced 404 Error Component
const NotFoundPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center">
      <div className="text-8xl font-bold text-primary-600 mb-4">404</div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8 text-lg leading-relaxed">
        The page you're looking for doesn't exist or has been moved. Don't worry, let's get you back on track!
      </p>
      
      <div className="space-y-4 mb-8">
        <a
          href="/#/"
          className="block w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
        >
          🏠 Go to Homepage
        </a>
        <a
          href="/#/login"
          className="block w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
        >
          🔐 Login to Dashboard
        </a>
        <a
          href="/#/register"
          className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          📝 Create Account
        </a>
        <a
          href="/#/contact"
          className="block w-full border-2 border-primary-600 text-primary-600 px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
        >
          📞 Contact Support
        </a>
      </div>

      <div className="text-sm text-gray-500">
        <p className="mb-2">🔧 <strong>Having deployment issues?</strong></p>
        <p>Check that your hosting platform is configured to serve <code className="bg-gray-100 px-2 py-1 rounded">index.html</code> for all routes.</p>
      </div>
    </div>
  </div>
)

// Home component that redirects authenticated users
const HomeWithRedirect = () => {
  const { user, loading } = useAuth()
  
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  if (loading) {
    return <LoadingFallback />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <HomePage />
}

// Wrapper component to handle scroll to top for all route changes
const ScrollToTopWrapper = ({ children }) => {
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return children
}

function App() {
  const [hasError, setHasError] = React.useState(false)
  const [errorDetails, setErrorDetails] = React.useState('')

  React.useEffect(() => {
    const handleError = (event) => {
      console.error('App Error:', event.error)
      setHasError(true)
      setErrorDetails(event.error?.message || 'Unknown error')
    }

    const handleRejection = (event) => {
      console.error('Unhandled Rejection:', event.reason)
      setHasError(true)
      setErrorDetails(event.reason?.message || 'Promise rejection')
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  if (hasError) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
          <p className="text-gray-600 mb-2">
            There was an error loading the application.
          </p>
          <p className="text-sm text-gray-500 mb-4 bg-gray-50 p-2 rounded font-mono">
            {errorDetails}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => {
                setHasError(false)
                setErrorDetails('')
              }}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <AuthProvider>
        <Router>
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<ScrollToTopWrapper><HomeWithRedirect /></ScrollToTopWrapper>} />
                <Route path="/about" element={<ScrollToTopWrapper><AboutPage /></ScrollToTopWrapper>} />
                <Route path="/services" element={<ScrollToTopWrapper><ServicesPage /></ScrollToTopWrapper>} />
                <Route path="/contact" element={<ScrollToTopWrapper><ContactPage /></ScrollToTopWrapper>} />
                <Route path="/terms" element={<ScrollToTopWrapper><TermsPage /></ScrollToTopWrapper>} />
                <Route path="/privacy" element={<ScrollToTopWrapper><PrivacyPage /></ScrollToTopWrapper>} />
                <Route path="/dispute-resolution" element={<ScrollToTopWrapper><DisputeResolutionPage /></ScrollToTopWrapper>} />
                <Route path="/refund-policy" element={<ScrollToTopWrapper><RefundPolicyPage /></ScrollToTopWrapper>} />
                <Route path="/login" element={<ScrollToTopWrapper><LoginForm /></ScrollToTopWrapper>} />
                <Route path="/register" element={<ScrollToTopWrapper><RegisterForm /></ScrollToTopWrapper>} />

                {/* Testing Routes */}
                <Route path="/email-test" element={<ScrollToTopWrapper><EmailJSTest /></ScrollToTopWrapper>} />
                <Route path="/send-test" element={<ScrollToTopWrapper><AutoTestSender /></ScrollToTopWrapper>} />
                <Route path="/direct-test" element={<ScrollToTopWrapper><DirectEmailTest /></ScrollToTopWrapper>} />
                <Route path="/system-test" element={<ScrollToTopWrapper><SystemTest /></ScrollToTopWrapper>} />
                <Route path="/rls-test" element={<ScrollToTopWrapper><RLSTestComponent /></ScrollToTopWrapper>} />
                <Route path="/registration-test" element={<ScrollToTopWrapper><RegistrationTest /></ScrollToTopWrapper>} />
                <Route path="/quick-test" element={<ScrollToTopWrapper><QuickRegistrationTest /></ScrollToTopWrapper>} />
                <Route path="/function-test" element={<ScrollToTopWrapper><FunctionTest /></ScrollToTopWrapper>} />
                <Route path="/profile-debug" element={<ScrollToTopWrapper><ProfileDebugTest /></ScrollToTopWrapper>} />
                <Route path="/full-test" element={<ScrollToTopWrapper><RegistrationLoginTest /></ScrollToTopWrapper>} />
                <Route path="/account-test" element={<ScrollToTopWrapper><AccountSetupTest /></ScrollToTopWrapper>} />
                <Route path="/complete-test" element={<ScrollToTopWrapper><CompleteAccountTest /></ScrollToTopWrapper>} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<ScrollToTopWrapper>
                  <Suspense fallback={<LoadingFallback />}>
                    <ProtectedRoute>
                      <DashboardRouter />
                    </ProtectedRoute>
                  </Suspense>
                </ScrollToTopWrapper>} />
                
                <Route path="/create-order" element={<ScrollToTopWrapper>
                  <Suspense fallback={<LoadingFallback />}>
                    <ProtectedRoute>
                      <CreateOrderForm />
                    </ProtectedRoute>
                  </Suspense>
                </ScrollToTopWrapper>} />

                <Route path="/order/:orderId" element={<ScrollToTopWrapper>
                  <Suspense fallback={<LoadingFallback />}>
                    <ProtectedRoute>
                      <OrderDetailPage />
                    </ProtectedRoute>
                  </Suspense>
                </ScrollToTopWrapper>} />

                {/* Catch-all route for 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </AuthProvider>
    </div>
  )
}

export default App