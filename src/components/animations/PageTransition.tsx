import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  const location = useLocation()

  const pageVariants = {
    initial: {
      opacity: 0,
      x: -20,
    },
    in: {
      opacity: 1,
      x: 0,
    },
    out: {
      opacity: 0,
      x: 20,
    },
  }

  const pageTransition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.3,
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default PageTransition

