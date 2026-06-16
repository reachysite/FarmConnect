'use client'

import { useAppStore } from '@/lib/store'
import Header from '@/components/Header'
import LandingPage from '@/components/LandingPage'
import { LoginPage, RegisterPage } from '@/components/AuthPages'
import MarketplacePage from '@/components/MarketplacePage'
import FarmerDashboard from '@/components/FarmerDashboard'
import LogisticsDashboard from '@/components/LogisticsDashboard'
import { AnimatePresence, motion } from 'framer-motion'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

export default function Home() {
  const { currentView } = useAppStore()

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage />
      case 'login':
        return <LoginPage />
      case 'register':
        return <RegisterPage />
      case 'marketplace':
        return <MarketplacePage />
      case 'farmer-dashboard':
        return <FarmerDashboard />
      case 'logistics-dashboard':
        return <LogisticsDashboard />
      default:
        return <LandingPage />
    }
  }

  // Don't show header on landing page (it has its own layout)
  const showHeader = currentView !== 'landing'

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          {showHeader && <Header />}
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
