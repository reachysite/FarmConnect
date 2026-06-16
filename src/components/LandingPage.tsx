'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Truck,
  Leaf,
  Shield,
  Star,
  ArrowRight,
  Sprout,
  Apple,
  Wheat,
  Egg,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { Product, Farm } from '@/lib/store'

const categories = [
  { name: 'vegetables', label: 'Vegetables', icon: Sprout, color: 'bg-emerald-100 text-emerald-700' },
  { name: 'fruits', label: 'Fruits', icon: Apple, color: 'bg-orange-100 text-orange-700' },
  { name: 'grains', label: 'Grains', icon: Wheat, color: 'bg-amber-100 text-amber-700' },
  { name: 'livestock', label: 'Livestock', icon: Egg, color: 'bg-red-100 text-red-700' },
]

const features = [
  {
    icon: Truck,
    title: 'Direct Delivery',
    description: 'Get farm-fresh products delivered straight to your doorstep from local farmers.',
  },
  {
    icon: Leaf,
    title: 'Fresh & Organic',
    description: 'Access the freshest produce harvested and listed by verified local farmers.',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Safe and seamless transactions with Paystack and Flutterwave integration.',
  },
  {
    icon: Star,
    title: 'Verified Farmers',
    description: 'All farms are verified to ensure quality produce and authentic farming practices.',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function LandingPage() {
  const { setView, setProducts, setFarms, setSelectedProductId, setSelectedCategory, products, farms } = useAppStore()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [topFarms, setTopFarms] = useState<Farm[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const [productsRes, farmsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/farms'),
        ])
        const productsData = await productsRes.json()
        const farmsData = await farmsRes.json()
        setProducts(productsData)
        setFarms(farmsData)
        setFeaturedProducts(productsData.slice(0, 8))
        setTopFarms(farmsData.slice(0, 4))
      } catch (err) {
        console.error('Failed to load landing data:', err)
      }
    }
    loadData()
  }, [])

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-white" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge className="mb-6 border-emerald-400 bg-emerald-800/50 px-4 py-1.5 text-sm text-emerald-100">
              Direct from Farm to Table
            </Badge>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Fresh Farm Products{' '}
              <span className="text-emerald-200">Delivered To Your Doorstep</span>
            </h1>
            <p className="mb-10 text-lg leading-relaxed text-emerald-100 sm:text-xl">
              Connect directly with local farmers. Buy fresh vegetables, fruits, grains,
              and livestock products at the best prices. No middlemen, no hassle.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                onClick={() => { setSelectedCategory(''); setView('marketplace') }}
                className="bg-white text-emerald-700 hover:bg-emerald-50 text-base font-semibold px-8 py-6"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setView('register')}
                className="border-white/40 bg-transparent px-8 py-6 text-base font-semibold text-white hover:bg-white/10"
              >
                Become a Farmer
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b bg-gray-50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-gray-200 sm:grid-cols-4 lg:divide-x">
          {[
            { value: '500+', label: 'Registered Farmers' },
            { value: '10K+', label: 'Products Listed' },
            { value: '25K+', label: 'Orders Delivered' },
            { value: '50+', label: 'Cities Covered' },
          ].map((stat) => (
            <div key={stat.label} className="px-6 py-6 text-center sm:px-8">
              <div className="text-2xl font-bold text-emerald-700 sm:text-3xl">{stat.value}</div>
              <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
            <p className="mt-3 text-gray-500">Browse products by category to find what you need</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
            {categories.map((cat) => (
              <motion.button
                key={cat.name}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setSelectedCategory(cat.name); setView('marketplace') }}
                className="group flex flex-col items-center gap-3 rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${cat.color} transition-transform group-hover:scale-110`}>
                  <cat.icon className="h-8 w-8" />
                </div>
                <span className="text-sm font-semibold text-gray-700">{cat.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="bg-gray-50 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
                <p className="mt-3 text-gray-500">Fresh picks from our top-rated farms</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => { setSelectedCategory(''); setView('marketplace') }}
                className="hidden text-emerald-600 hover:text-emerald-700 sm:flex"
              >
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {featuredProducts.map((product) => (
                <motion.div key={product.id} variants={item}>
                  <Card
                    className="group cursor-pointer overflow-hidden border shadow-sm transition-all hover:shadow-lg"
                    onClick={() => { setSelectedProductId(product.id); setView('marketplace') }}
                  >
                                       <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img
                        src={product.image || `/images/products/${product.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`}
                        alt={product.name}
                        onError={(e) => { const el = e.currentTarget; if (!el.src.startsWith('/images/')) el.src = `/images/products/${product.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`; }}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <Badge className="absolute left-3 top-3 bg-emerald-600 text-white">
                        {product.category}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="mt-1 text-xs text-gray-500">
                        {product.farm?.farmName || 'Local Farm'}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-lg font-bold text-emerald-600">
                          {formatPrice(product.price)}<span className="text-sm font-normal text-gray-400">/{product.unit}</span>
                        </span>
                        <span className="text-xs text-gray-400">
                          {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
            <div className="mt-8 text-center sm:hidden">
              <Button
                variant="outline"
                onClick={() => { setSelectedCategory(''); setView('marketplace') }}
                className="text-emerald-600"
              >
                View All Products
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Top Farms */}
      {topFarms.length > 0 && (
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-gray-900">Top Rated Farms</h2>
              <p className="mt-3 text-gray-500">Verified farms with the freshest produce</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {topFarms.map((farm) => (
                <Card key={farm.id} className="overflow-hidden border shadow-sm">
                  <div className="h-32 bg-gray-100">
                    {farm.image ? (
                      <img src={farm.image} alt={farm.farmName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
                        <Sprout className="h-8 w-8 text-emerald-300" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900">{farm.farmName}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      <Sprout className="mr-1 inline h-3 w-3" />
                      {farm.location}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium text-gray-700">{farm.rating.toFixed(1)}</span>
                      <span className="text-sm text-gray-400">
                        ({farm.farmer?.name || 'Farmer'})
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="border-t bg-gray-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Why FarmConnect?</h2>
            <p className="mt-3 text-gray-500">Built for farmers, designed for everyone</p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-600 py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">Ready to get started?</h2>
          <p className="mt-4 text-lg text-emerald-100">
            Join thousands of farmers and buyers on Nigeria&apos;s leading farm-to-consumer marketplace.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              onClick={() => setView('register')}
              className="bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-6"
            >
              Create Account
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => { setSelectedCategory(''); setView('marketplace') }}
              className="border-white/40 bg-transparent px-8 py-6 text-white hover:bg-white/10"
            >
              Browse Products
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Leaf className="h-4 w-4" />
              </div>
              <span className="font-bold text-gray-900">
                Farm<span className="text-emerald-600">Connect</span>
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Virtual Farm Product Marketplace — Direct Farmer-to-Consumer Trading
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

