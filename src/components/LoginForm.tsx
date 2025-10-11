import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Lock, User, LogIn } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

interface LoginFormProps {
  onLogin: (user: any) => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      toast.error('Please enter both username and password')
      return
    }

    try {
      setLoading(true)
      const success = await login(username, password)
      
      if (success) {
        // Login successful, the AuthContext will handle the user state
        // The onLogin callback will trigger navigation
        onLogin({ username, password })
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username Field */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative group">
             <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 group-focus-within:text-white transition-colors">
               <User className="w-5 h-5" />
             </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:bg-white/15 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 font-poppins"
              placeholder="Username"
              required
              disabled={loading}
            />
          </div>
        </motion.div>

        {/* Password Field */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative group">
             <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 group-focus-within:text-white transition-colors">
               <Lock className="w-5 h-5" />
             </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-14 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:bg-white/15 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 font-poppins"
              placeholder="Password"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
               className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white transition-colors"
              disabled={loading}
            >
              <AnimatePresence mode="wait">
                {showPassword ? (
                  <motion.div
                    key="eye-off"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <EyeOff className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="eye"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Eye className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.div>

        {/* Login Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-loginGradientStart py-4 px-6 rounded-2xl hover:bg-white/95 focus:ring-4 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-poppins font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <>
                <div className="spinner-small" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Log in</span>
                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </motion.div>
      </form>


      <style>{`
        .spinner-small {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-left-color: #0B60B0;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}

export default LoginForm
