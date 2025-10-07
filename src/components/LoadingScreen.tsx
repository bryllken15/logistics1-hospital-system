import React from 'react'
import { motion } from 'framer-motion'

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="text-center"
      >
        {/* Logo Animation */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <span className="text-white font-bold text-xl">L1</span>
        </motion.div>
        
        {/* Loading Text */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-semibold text-primary mb-2"
        >
          LOGISTICS 1
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600"
        >
          Loading your dashboard...
        </motion.p>
        
        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="h-full bg-primary rounded-full"
          />
        </motion.div>
      </motion.div>
    </div>
  )
}

export default LoadingScreen
