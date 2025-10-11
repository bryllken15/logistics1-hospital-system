import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}

const FadeIn: React.FC<FadeInProps> = ({ 
  children, 
  delay = 0, 
  duration = 0.5, 
  className = '',
  direction = 'none'
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: 20 }
      case 'down':
        return { y: -20 }
      case 'left':
        return { x: 20 }
      case 'right':
        return { x: -20 }
      default:
        return {}
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...getInitialPosition() }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default FadeIn

