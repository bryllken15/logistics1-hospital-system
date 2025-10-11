import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ScaleInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
  initialScale?: number
}

const ScaleIn: React.FC<ScaleInProps> = ({ 
  children, 
  delay = 0, 
  duration = 0.4, 
  className = '',
  initialScale = 0.8
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: initialScale }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration, 
        delay, 
        ease: 'easeOut',
        type: 'spring',
        stiffness: 260,
        damping: 20
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default ScaleIn

