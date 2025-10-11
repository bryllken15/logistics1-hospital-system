import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface SlideInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
  direction?: 'left' | 'right' | 'up' | 'down'
}

const SlideIn: React.FC<SlideInProps> = ({ 
  children, 
  delay = 0, 
  duration = 0.5, 
  className = '',
  direction = 'left'
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'left':
        return { x: -100, opacity: 0 }
      case 'right':
        return { x: 100, opacity: 0 }
      case 'up':
        return { y: -100, opacity: 0 }
      case 'down':
        return { y: 100, opacity: 0 }
      default:
        return { x: -100, opacity: 0 }
    }
  }

  return (
    <motion.div
      initial={getInitialPosition()}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default SlideIn

