import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/LoginForm'

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (user: any) => {
    // User is already authenticated by the LoginForm component
    // Just navigate to dashboard
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Background Image with Text Overlay (70%) */}
      <div className="w-full lg:w-[70%] relative h-64 lg:h-screen">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/Logistic1Background.png')`
            }}
        />
        
        {/* Dark Blue Semi-Transparent Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-primary/50 to-secondary/60" />
        
        {/* Centered Text Content */}
        <div className="absolute inset-0 flex items-center justify-center px-4 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center text-white max-w-4xl"
          >
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold font-montserrat tracking-wide mb-6 text-shadow-blue"
              style={{ fontWeight: 800 }}
            >
              LOGISTICS 1
            </motion.h1>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-lg sm:text-xl lg:text-3xl font-poppins font-semibold leading-relaxed text-shadow-lg"
              style={{ fontWeight: 600 }}
            >
              SMART SUPPLY CHAIN &<br />
              PROCUREMENT MANAGEMENT
            </motion.h2>
            
            {/* Decorative Line */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '12rem' }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="h-1 bg-white/40 mx-auto mt-8 rounded-full"
            />
          </motion.div>
        </div>
        
        {/* Animated Corner Accent */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-0 right-0 w-64 h-64 bg-accent rounded-tl-full"
        />
      </div>

      {/* Right Side - Login Form (30%) */}
      <div className="w-full lg:w-[30%] bg-gradient-to-br from-loginGradientStart to-loginGradientEnd flex items-center justify-center p-6 lg:p-8 min-h-screen lg:min-h-0">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-md"
        >
          {/* Logo Circle */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.5
            }}
            className="text-center mb-8"
          >
             <div className="w-56 h-56 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl overflow-hidden ring-4 ring-white/20">
              <img 
                src="/Logistcs1Logo.png" 
                alt="Logistics 1 Logo" 
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  // Fallback if image doesn't load
                  e.currentTarget.style.display = 'none'
                  const parent = e.currentTarget.parentElement
                  if (parent) {
                     parent.innerHTML = '<div class="w-44 h-44 bg-primary rounded-full flex items-center justify-center"><span class="text-white font-bold text-5xl font-montserrat">L1</span></div>'
                  }
                }}
              />
            </div>
            
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-white text-2xl font-poppins font-semibold mb-2"
            >
              Welcome Back
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-white/80 text-sm font-poppins"
            >
              Sign in to continue to your dashboard
            </motion.p>
          </motion.div>

          {/* Login Form Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <LoginForm onLogin={handleLogin} />
          </motion.div>

          {/* Help Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-center mt-8"
          >
            <a 
              href="#" 
              className="text-white/70 hover:text-white text-sm font-poppins transition-colors duration-300 inline-flex items-center gap-1"
            >
              <span>Need Help?</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </a>
          </motion.div>

          {/* Footer Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="text-center mt-6"
          >
            <p className="text-white/50 text-xs font-poppins">
              © 2025 Logistics 1. All rights reserved.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage
