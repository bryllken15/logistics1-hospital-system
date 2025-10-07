import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Eye, EyeOff } from 'lucide-react'

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await login(username, password)
    if (success) {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Background Image */}
      <div className="hidden lg:flex lg:w-[70%] relative">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwMCIgaGVpZ2h0PSIxMDAwIiB2aWV3Qm94PSIwIDAgMTAwMCAxMDAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAwMCIgaGVpZ2h0PSIxMDAwIiBmaWxsPSIjMUQzNTU3Ii8+CjxyZWN0IHg9IjIwMCIgeT0iMjAwIiB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzQ1N0I5RCIvPgo8cmVjdCB4PSIzMDAiIHk9IjMwMCIgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMwMEE4OTYiLz4KPHN2ZyB4PSI0MDAiIHk9IjQwMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+')`
          }}
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white px-8"
          >
            <h1 className="text-5xl lg:text-6xl font-bold font-poppins mb-4 drop-shadow-lg">
              LOGISTICS 1
            </h1>
            <h2 className="text-2xl lg:text-3xl font-semibold font-poppins drop-shadow-lg">
              SMART SUPPLY CHAIN &<br />
              PROCUREMENT MANAGEMENT
            </h2>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-[30%] bg-gradient-to-br from-[#0B60B0] to-[#3C99DC] flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">L1</span>
              </div>
            </div>
            <h3 className="text-white text-xl font-semibold">Welcome Back</h3>
          </motion.div>

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-white text-primary font-semibold py-3 px-4 rounded-xl hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Log In'}
            </motion.button>
          </motion.form>

          {/* Help Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-6"
          >
            <a href="#" className="text-white/80 hover:text-white text-sm transition-colors">
              Need Help?
            </a>
          </motion.div>

          {/* Demo Credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-8 p-4 bg-white/10 rounded-xl"
          >
            <p className="text-white/80 text-xs mb-2">Demo Credentials:</p>
            <div className="text-white/60 text-xs space-y-1">
              <div>Admin: admin / admin123</div>
              <div>Manager: manager1 / manager123</div>
              <div>Employee: employee1 / employee123</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage
