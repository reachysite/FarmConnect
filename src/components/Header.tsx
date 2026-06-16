'use client'

import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Leaf,
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Sprout,
  Store,
  TruckIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export default function Header() {
  const {
    user, setView, setUser, clearCart,
    cart, getCartCount, setFarmerTab, setBuyerTab,
  } = useAppStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const cartCount = getCartCount()

  const handleLogout = () => {
    setUser(null)
    clearCart()
    setView('landing')
  }

  const roleConfig: Record<string, { color: string; label: string; icon: any; accentText: string }> = {
    FARMER: { color: 'bg-emerald-600', label: 'Farmer', icon: Sprout, accentText: 'text-emerald-600' },
    BUYER: { color: 'bg-blue-600', label: 'Buyer', icon: Store, accentText: 'text-blue-600' },
    LOGISTICS: { color: 'bg-amber-600', label: 'Logistics', icon: TruckIcon, accentText: 'text-amber-600' },
    ADMIN: { color: 'bg-purple-600', label: 'Admin', icon: LayoutDashboard, accentText: 'text-purple-600' },
  }

  const currentRole = user?.role ? roleConfig[user.role] : null

  const handleDashboard = () => {
    if (user?.role === 'FARMER') {
      setFarmerTab('overview')
      setView('farmer-dashboard')
    } else if (user?.role === 'BUYER') {
      setBuyerTab('browse')
      setView('marketplace')
    } else if (user?.role === 'LOGISTICS') {
      setView('logistics-dashboard')
    }
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => setView('landing')}
          className="flex items-center gap-2 transition hover:opacity-80"
        >
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${currentRole?.color || 'bg-emerald-600'} text-white`}>
            {currentRole ? (
              <currentRole.icon className="h-5 w-5" />
            ) : (
              <Leaf className="h-5 w-5" />
            )}
          </div>
          <span className="text-lg font-bold text-gray-900">
            Farm<span className={currentRole?.accentText || 'text-emerald-600'}>Connect</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <Button
            variant="ghost"
            onClick={() => setView('landing')}
            className="text-sm font-medium text-gray-600 hover:text-emerald-600"
          >
            Home
          </Button>
          {user && user.role === 'BUYER' && (
            <Button
              variant="ghost"
              onClick={() => { setBuyerTab('browse'); setView('marketplace') }}
              className="text-sm font-medium text-gray-600 hover:text-emerald-600"
            >
              Marketplace
            </Button>
          )}
          {!user && (
            <Button
              variant="ghost"
              onClick={() => setView('register')}
              className="text-sm font-medium text-gray-600 hover:text-emerald-600"
            >
              Register
            </Button>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user && user.role === 'BUYER' && (
            <Button
              variant="ghost"
              size="icon"
              className="relative text-gray-600 hover:text-emerald-600"
              onClick={() => { setBuyerTab('cart'); setView('marketplace') }}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 p-0 text-[10px] font-bold text-white">
                  {cartCount}
                </Badge>
              )}
            </Button>
          )}

          {user ? (
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className={`gap-2 ${currentRole ? currentRole.color.replace('bg-', 'border-').replace('600', '200') + ' ' + currentRole.accentText : 'border-emerald-200 text-gray-700'} hover:${currentRole?.color.replace('bg-', 'border-').replace('600', '400') || 'hover:border-emerald-400'}`}>
                    <User className="h-4 w-4" />
                    <span className="text-sm">{user.name}</span>
                    <Badge className={`text-[10px] px-1.5 py-0 ${currentRole?.color || 'bg-emerald-600'} text-white`}>
                      {currentRole?.label || user.role}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleDashboard}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button
              onClick={() => setView('login')}
              className="hidden bg-emerald-600 text-white hover:bg-emerald-700 md:flex"
            >
              Sign In
            </Button>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t bg-white md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              <Button
                variant="ghost"
                className="justify-start text-gray-600"
                onClick={() => { setView('landing'); setMobileMenuOpen(false) }}
              >
                Home
              </Button>
              {user && user.role === 'BUYER' && (
                <Button
                  variant="ghost"
                  className="justify-start text-gray-600"
                  onClick={() => { setBuyerTab('browse'); setView('marketplace'); setMobileMenuOpen(false) }}
                >
                  Marketplace
                </Button>
              )}
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    className="justify-start text-gray-600"
                    onClick={() => { handleDashboard() }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-red-600"
                    onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                  >
                    Logout ({user.name})
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="justify-start text-gray-600"
                    onClick={() => { setView('login'); setMobileMenuOpen(false) }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-gray-600"
                    onClick={() => { setView('register'); setMobileMenuOpen(false) }}
                  >
                    Register
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
