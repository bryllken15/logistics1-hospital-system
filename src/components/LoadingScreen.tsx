import { motion, AnimatePresence } from 'framer-motion'

const LoadingScreen = () => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
          className="text-center relative"
        >
          {/* Animated Background Circles */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/10 rounded-full blur-xl"
          />
          
          {/* Logo Container with Image */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
            className="relative z-10"
          >
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl overflow-hidden ring-8 ring-white/20">
              <img 
                src="/Images/Logistcs1Logo.png" 
                alt="Logistics 1 Logo" 
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  // Fallback if image doesn't load
                  e.currentTarget.style.display = 'none'
                  const parent = e.currentTarget.parentElement
                  if (parent) {
                    parent.innerHTML = '<div class="w-20 h-20 bg-primary rounded-full flex items-center justify-center"><span class="text-white font-bold text-3xl font-montserrat">L1</span></div>'
                  }
                }}
              />
            </div>

            {/* Spinning Ring Animation */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-36 h-36 border-4 border-white/30 border-t-white rounded-full"
            />
          </motion.div>
          
          {/* Loading Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative z-10"
          >
            <h2 className="text-3xl font-bold text-white mb-2 font-montserrat tracking-wide">
              LOGISTICS 1
            </h2>
            
            <p className="text-white/80 font-poppins text-lg mb-2">
              Smart Supply Chain & Procurement
            </p>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-white/60 text-sm font-poppins"
            >
              Loading your dashboard...
            </motion.p>
          </motion.div>
          
          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 w-80 max-w-full mx-auto"
          >
            <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 2.5,
                  ease: "easeInOut",
                  repeat: Infinity
                }}
                className="h-full bg-gradient-to-r from-white/80 via-white to-white/80 rounded-full relative"
              >
                {/* Shimmer effect */}
                <motion.div
                  animate={{
                    x: ['-100%', '200%']
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Loading Dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-2 mt-6"
          >
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: index * 0.2
                }}
                className="w-2 h-2 bg-white/60 rounded-full"
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight 
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            className="absolute w-1 h-1 bg-white/40 rounded-full"
          />
        ))}
      </motion.div>
    </AnimatePresence>
  )
}

export default LoadingScreen
