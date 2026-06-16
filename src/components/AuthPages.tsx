'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import { Leaf, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import type { UserRole } from '@/lib/store'

export function LoginPage() {
  const { setView, setUser, setFarmerTab, setBuyerTab } = useAppStore()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      setUser(data)
      toast({ title: 'Welcome back!', description: `Signed in as ${data.name}` })
      if (data.role === 'FARMER') {
        setFarmerTab('overview')
        setView('farmer-dashboard')
      } else if (data.role === 'BUYER') {
        setBuyerTab('browse')
        setView('marketplace')
      } else if (data.role === 'LOGISTICS') {
        setView('logistics-dashboard')
      }
    } catch (err: any) {
      toast({ title: 'Login Failed', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = async (email: string) => {
    setEmail(email)
    setPassword('password')
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      setUser(data)
      toast({ title: 'Welcome back!', description: `Signed in as ${data.name}` })
      if (data.role === 'FARMER') {
        setFarmerTab('overview')
        setView('farmer-dashboard')
      } else if (data.role === 'BUYER') {
        setBuyerTab('browse')
        setView('marketplace')
      } else if (data.role === 'LOGISTICS') {
        setView('logistics-dashboard')
      }
    } catch (err: any) {
      toast({ title: 'Login Failed', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Leaf className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your FarmConnect account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>

            <div className="mt-6 border-t pt-6">
              <p className="mb-3 text-center text-xs text-gray-400">Quick Demo Login</p>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => quickLogin('adebayo@farm.ng')}>
                  Farmer
                </Button>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => quickLogin('chinedu@buy.ng')}>
                  Buyer
                </Button>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => quickLogin('emeka@logistics.ng')}>
                  Logistics
                </Button>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <button onClick={() => setView('register')} className="font-medium text-emerald-600 hover:underline">
                Register
              </button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export function RegisterPage() {
  const { setView, setUser, setFarmerTab, setBuyerTab } = useAppStore()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<UserRole>('BUYER')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      setUser(data)
      toast({ title: 'Account Created!', description: `Welcome to FarmConnect, ${data.name}` })
      if (data.role === 'FARMER') {
        setFarmerTab('overview')
        setView('farmer-dashboard')
      } else {
        setBuyerTab('browse')
        setView('marketplace')
      }
    } catch (err: any) {
      toast({ title: 'Registration Failed', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Leaf className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Join FarmConnect today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+234 800 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>I am a:</Label>
                <RadioGroup value={role} onValueChange={(v) => setRole(v as UserRole)} className="flex gap-3">
                  <Label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors has-[[data-state=checked]]:border-emerald-500 has-[[data-state=checked]]:bg-emerald-50">
                    <RadioGroupItem value="FARMER" />
                    <span className="text-sm font-medium">Farmer</span>
                  </Label>
                  <Label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors has-[[data-state=checked]]:border-emerald-500 has-[[data-state=checked]]:bg-emerald-50">
                    <RadioGroupItem value="BUYER" />
                    <span className="text-sm font-medium">Buyer</span>
                  </Label>
                  <Label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors has-[[data-state=checked]]:border-emerald-500 has-[[data-state=checked]]:bg-emerald-50">
                    <RadioGroupItem value="LOGISTICS" />
                    <span className="text-sm font-medium">Logistics</span>
                  </Label>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <button onClick={() => setView('login')} className="font-medium text-emerald-600 hover:underline">
                Sign In
              </button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
