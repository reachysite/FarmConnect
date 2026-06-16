'use client'

import { useAppStore, type Product, type CartItem } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Leaf,
  Star,
  MapPin,
  ArrowLeft,
  Truck,
  CheckCircle2,
  CreditCard,
  Loader2,
  Package,
  X,
  Building2,
  Landmark,
  Store,
  ShieldCheck,
  Wallet,
  Phone,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const categories = [
  { value: '', label: 'All' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'grains', label: 'Grains' },
  { value: 'livestock', label: 'Livestock' },
]

function toLocalPath(name: string): string {
  return `/images/products/${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`
}

function ProductImage({ src, name, className }: { src: string | undefined; name: string; className?: string }) {
  const fallback = toLocalPath(name)
  return (
    <img
      src={src || fallback}
      alt={name}
      onError={(e) => { const el = e.currentTarget; if (!el.src.startsWith('/images/')) el.src = fallback; }}
      className={className}
    />
  )
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

function formatPrice(price: number) {
  return '₦' + price.toLocaleString()
}

const paymentLabels: Record<string, string> = {
  paystack: 'Paystack',
  flutterwave: 'Flutterwave',
  atm: 'ATM Card (Visa/Mastercard/Verve)',
  bank: 'Bank Transfer',
}

const paymentMethods = [
  {
    id: 'paystack',
    label: 'Pay with Paystack',
    desc: 'You will be redirected to Paystack\'s secure checkout page. Supports all Nigerian debit cards (Visa, Mastercard, Verve), USSD banking (*737#, *901#, etc.), and direct bank account debits. Your payment is confirmed instantly once completed.',
    detail: 'After clicking "Confirm Payment", a Paystack popup will appear. Enter your card details or choose USSD/bank transfer. You\'ll receive an SMS/email receipt from Paystack after successful payment.',
    badge: 'Recommended',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'flutterwave',
    label: 'Pay with Flutterwave',
    desc: 'You will be redirected to Flutterwave\'s secure payment portal. Accepts Visa, Mastercard, Verve cards, mobile money wallets, USSD codes, and Barter payments. Widely trusted across Nigeria for seamless transactions.',
    detail: 'After clicking "Confirm Payment", a Flutterwave popup will open. Select your preferred payment channel (card, USSD, bank transfer, or mobile money). Payment confirmation is instant.',
    badge: '',
    iconColor: 'text-blue-500',
  },
  {
    id: 'atm',
    label: 'ATM Card Payment',
    desc: 'Pay directly using your Nigerian debit card. Supports Visa, Mastercard, and Verve cards issued by any Nigerian bank. Your card details are encrypted and processed securely — we never store your card information.',
    detail: 'After clicking "Confirm Payment", enter your 16-digit card number, expiry date (MM/YY), and 3-digit CVV at the back of your card. An OTP may be sent to your registered phone number for verification. Payment is confirmed instantly.',
    badge: '',
    iconColor: 'text-purple-500',
  },
  {
    id: 'bank',
    label: 'Bank Transfer',
    desc: 'Transfer the total order amount directly to our bank account below. After making the transfer, your order will be verified within 1-2 business hours once we confirm receipt of payment.',
    detail: 'Bank: Access Bank | Account Number: 0123456789 | Account Name: FarmConnect Technologies Ltd. Use your Order ID as the payment reference. You can also pay via mobile/online banking app.',
    badge: '',
    iconColor: 'text-amber-600',
  },
]

// --- Browse Products ---
function BrowseProducts() {
  const {
    products, setProducts, farms, setFarms,
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    addToCart, setSelectedProductId, setBuyerTab,
    buyerTab,
  } = useAppStore()
  const { toast } = useToast()

  const filteredProducts = products.filter((p) => {
    const matchCategory = !selectedCategory || p.category === selectedCategory
    const matchSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.farm?.farmName?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  const handleAddToCart = (product: Product) => {
    const state = useAppStore.getState()
    if (!state.user) {
      toast({ title: 'Login Required', description: 'Please sign in to add items to your cart', variant: 'destructive' })
      return
    }
    addToCart(product)
    toast({ title: 'Added to cart', description: `${product.name} added to your cart` })
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search products, farms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
              className={
                selectedCategory === cat.value
                  ? 'bg-emerald-600 hover:bg-emerald-700 shrink-0'
                  : 'shrink-0'
              }
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Leaf className="mb-4 h-16 w-16" />
          <p className="text-lg font-medium">No products found</p>
          <p className="mt-1 text-sm">Try adjusting your search or filter</p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredProducts.map((product) => (
            <motion.div key={product.id} variants={item}>
              <Card className="group h-full overflow-hidden border shadow-sm transition-all hover:shadow-md">
                <div
                  className="relative h-44 cursor-pointer overflow-hidden bg-gray-100"
                  onClick={() => setSelectedProductId(product.id)}
                >
                                 <ProductImage src={product.image} name={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <Badge className="absolute left-3 top-3 bg-emerald-600 text-white capitalize">
                    {product.category}
                  </Badge>
                  {product.quantity <= 5 && product.quantity > 0 && (
                    <Badge className="absolute right-3 top-3 bg-amber-500 text-white">
                      Low Stock
                    </Badge>
                  )}
                  {product.quantity === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Badge variant="secondary" className="text-sm">Out of Stock</Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="mt-0.5 text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {product.farm?.farmName || 'Local Farm'}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0 text-gray-400 hover:text-emerald-600"
                      onClick={() => setSelectedProductId(product.id)}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-gray-500">{product.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-emerald-600">
                      {formatPrice(product.price)}
                      <span className="text-xs font-normal text-gray-400">/{product.unit}</span>
                    </span>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.quantity === 0}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

// --- Product Detail ---
function ProductDetail() {
  const {
    selectedProductId, setSelectedProductId,
    addToCart, products, setBuyerTab,
  } = useAppStore()
  const { toast } = useToast()

  const product = products.find((p) => p.id === selectedProductId)

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Package className="mb-4 h-12 w-12" />
        <p>Product not found</p>
      </div>
    )
  }

  const handleAdd = () => {
    const state = useAppStore.getState()
    if (!state.user) {
      toast({ title: 'Login Required', description: 'Please sign in to add items to your cart', variant: 'destructive' })
      return
    }
    addToCart(product)
    toast({ title: 'Added to cart', description: `${product.name} added to your cart` })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Button variant="ghost" onClick={() => setSelectedProductId(null)} className="text-gray-600">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="overflow-hidden">
                 <div className="flex h-72 items-center justify-center bg-gray-100 sm:h-96">
            <ProductImage src={product.image} name={product.name} className="h-full w-full object-cover" />
          </div>
        </Card>

        <div className="space-y-6">
          <div>
            <Badge className="mb-2 capitalize">{product.category}</Badge>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              {product.farm?.farmName || 'Local Farm'} &middot; {product.farm?.location || 'Nigeria'}
            </p>
          </div>

          <div>
            <span className="text-3xl font-bold text-emerald-600">
              {formatPrice(product.price)}
            </span>
            <span className="text-gray-400"> /{product.unit}</span>
          </div>

          <p className="leading-relaxed text-gray-600">{product.description}</p>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Available Stock:</span>
              <p className="font-semibold text-gray-900">{product.quantity} {product.unit}</p>
            </div>
            <div>
              <span className="text-gray-500">Harvest Date:</span>
              <p className="font-semibold text-gray-900">
                {product.harvestDate ? new Date(product.harvestDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full bg-emerald-600 py-6 text-lg hover:bg-emerald-700"
            onClick={handleAdd}
            disabled={product.quantity === 0}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// --- Cart ---
function CartView() {
  const {
    cart, removeFromCart, updateCartQuantity, clearCart,
    getCartTotal, setBuyerTab,
  } = useAppStore()
  const total = getCartTotal()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-gray-400">
          <ShoppingCart className="mb-4 h-16 w-16" />
          <p className="text-lg font-medium">Your cart is empty</p>
          <Button
            variant="outline"
            className="mt-4 text-emerald-600"
            onClick={() => setBuyerTab('browse')}
          >
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-3 lg:col-span-2">
            <AnimatePresence>
              {cart.map((item: CartItem) => (
                <motion.div
                  key={item.product.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                >
                  <Card className="flex items-center gap-4 p-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                                           <ProductImage src={item.product.image} name={item.product.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">{item.product.farm?.farmName || 'Farm'}</p>
                      <p className="mt-1 font-semibold text-emerald-600">
                        {formatPrice(item.product.price)}/{item.product.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="w-24 text-right font-semibold text-gray-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-400 hover:text-red-600"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            <Button
              variant="ghost"
              className="text-red-500"
              onClick={clearCart}
            >
              Clear Cart
            </Button>
          </div>

          {/* Summary */}
          <Card className="h-fit border-2">
            <CardContent className="space-y-4 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal ({cart.length} items)</span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className="font-medium text-emerald-600">Free</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-emerald-600">{formatPrice(total)}</span>
              </div>
              <Button
                className="w-full bg-emerald-600 py-6 text-lg hover:bg-emerald-700"
                onClick={() => {
                  if (!useAppStore.getState().user) {
                    toast({ title: 'Login Required', description: 'Please sign in or create an account to proceed with checkout', variant: 'destructive' })
                    return
                  }
                  setBuyerTab('checkout')
                }}
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// --- Checkout ---
function Checkout() {
  const {
    cart, clearCart, getCartTotal, setBuyerTab, setView, user, setOrders,
  } = useAppStore()
  const { toast } = useToast()
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState(user?.phone || '')
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState('paystack')
  const [showConfirm, setShowConfirm] = useState(false)

  const total = getCartTotal()

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
          <Store className="h-10 w-10 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Login Required</h2>
        <p className="mt-2 max-w-md text-center text-gray-500">You need to be signed in to proceed with checkout. Please log in or create a buyer account.</p>
        <div className="mt-8 flex gap-4">
          <Button onClick={() => setView('login')} className="bg-emerald-600 hover:bg-emerald-700">
            Sign In
          </Button>
          <Button variant="outline" onClick={() => setView('register')}>
            Create Account
          </Button>
        </div>
      </div>
    )
  }

  const handleReviewOrder = () => {
    if (!address.trim()) {
      toast({ title: 'Delivery Address Required', description: 'Please enter your delivery address to proceed', variant: 'destructive' })
      return
    }
    if (!phone.trim()) {
      toast({ title: 'Phone Number Required', description: 'Please enter your phone number', variant: 'destructive' })
      return
    }
    if (cart.length === 0) {
      toast({ title: 'Cart Empty', description: 'Add items to your cart before checkout', variant: 'destructive' })
      return
    }
    setShowConfirm(true)
  }

  const handleConfirmPayment = async () => {
    if (!user) return
    setShowConfirm(false)
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: user.id,
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          deliveryAddress: address,
          phone: phone,
          paymentMethod: selectedPayment,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Order failed')

      clearCart()
      setOrderPlaced(true)
      toast({ title: 'Payment Confirmed!', description: `Order placed successfully via ${paymentLabels[selectedPayment]}` })

      const ordersRes = await fetch(`/api/orders?buyerId=${user.id}`)
      const ordersData = await ordersRes.json()
      setOrders(ordersData)
    } catch (err: any) {
      toast({ title: 'Payment Failed', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (orderPlaced) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Order Placed Successfully!</h2>
        <p className="mt-2 text-gray-500">Your farm-fresh products are on the way</p>
        <div className="mt-8 flex gap-4">
          <Button onClick={() => { setBuyerTab('orders') }} className="bg-emerald-600 hover:bg-emerald-700">
            View Orders
          </Button>
          <Button variant="outline" onClick={() => setBuyerTab('browse')}>
            Continue Shopping
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setBuyerTab('cart')} className="text-gray-600">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart
      </Button>
      <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h3 className="text-lg font-semibold">Delivery Details</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label2>Delivery Address</Label2>
                  <Input
                    placeholder="Enter your delivery address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label2>Phone Number</Label2>
                  <Input
                    placeholder="+234 800 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Payment Method</h3>
              <div className="grid gap-3">
                {paymentMethods.map((method) => {
                  const isSelected = selectedPayment === method.id
                  const borderColor = isSelected ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50'
                  const textColor = isSelected ? 'text-emerald-900' : 'text-gray-700'
                  const descColor = isSelected ? 'text-emerald-700' : 'text-gray-400'
                  const iconColor = isSelected ? 'text-emerald-600' : method.iconColor
                  const radioBorder = isSelected ? 'border-emerald-500' : 'border-gray-300'
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPayment(method.id)}
                      className={"flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 text-left transition-all " + borderColor}
                    >
                      <div className={"mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors " + radioBorder}>
                        {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />}
                      </div>
                      {method.id === 'bank'
                        ? <Landmark className={"mt-0.5 h-5 w-5 shrink-0 " + iconColor} />
                        : <CreditCard className={"mt-0.5 h-5 w-5 shrink-0 " + iconColor} />
                      }
                      <div className="flex-1">
                        <span className={"font-medium " + textColor}>{method.label}</span>
                        <p className={"mt-1 text-xs leading-relaxed " + descColor}>{method.desc}</p>
                        {isSelected && method.detail && (
                          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
                            <p className="text-xs leading-relaxed text-emerald-800">{method.detail}</p>
                          </div>
                        )}
                      </div>
                      {method.badge ? (
                        <Badge className="shrink-0 bg-emerald-600 text-white">{method.badge}</Badge>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit border-2">
            <CardContent className="space-y-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
            <Separator />
            <div className="space-y-3">
              {cart.map((ci) => (
                <div key={ci.product.id} className="flex justify-between text-sm">
                  <span className="text-gray-500">{ci.product.name} x{ci.quantity}</span>
                  <span className="font-medium">{formatPrice(ci.product.price * ci.quantity)}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery</span>
              <span className="font-medium text-emerald-600">Free</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-emerald-600">{formatPrice(total)}</span>
            </div>
            {/* Selected payment display */}
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3">
              <Wallet className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-emerald-700">Paying with:</span>
              <span className="text-sm font-semibold text-emerald-900">{paymentLabels[selectedPayment]}</span>
            </div>

            <Button
              className="w-full bg-emerald-600 py-6 text-lg hover:bg-emerald-700"
              onClick={handleReviewOrder}
              disabled={loading || cart.length === 0}
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-5 w-5" />
              )}
              Review & Confirm Payment
            </Button>
          </CardContent>
        </Card>

        {/* Payment Confirmation Dialog */}
        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent className="max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Confirm Your Order
              </AlertDialogTitle>
              <AlertDialogDescription className="sr-only">
                Review your order details and confirm payment before placing your order.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4 py-2">
              {/* Items Summary */}
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="mb-2 text-xs font-semibold text-gray-500 uppercase">Order Items</p>
                <div className="space-y-1.5">
                  {cart.map((ci) => (
                    <div key={ci.product.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">{ci.product.name} x{ci.quantity}</span>
                      <span className="font-medium text-gray-900">{formatPrice(ci.product.price * ci.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p className="mb-1 text-xs font-semibold text-emerald-600 uppercase">Payment Method</p>
                <p className="text-sm font-semibold text-emerald-900">{paymentLabels[selectedPayment]}</p>
              </div>

              {/* Delivery Info */}
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="mb-1 text-xs font-semibold text-gray-500 uppercase">Delivery Details</p>
                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  {address}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-700">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  {phone}
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-emerald-600">{formatPrice(total)}</span>
              </div>
            </div>

            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                onClick={handleConfirmPayment}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirm Payment
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </div>
    </div>
  )
}

function Label2({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium leading-none text-gray-700">{children}</label>
  )
}

// --- My Orders ---
function MyOrders() {
  const { orders, setOrders, user } = useAppStore()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadOrders() {
      if (!user) return
      setLoading(true)
      try {
        const res = await fetch(`/api/orders?buyerId=${user.id}`)
        const data = await res.json()
        setOrders(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [user, setOrders])

  const statusColor: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    PAID: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-gray-400">
          <Package className="mb-4 h-16 w-16" />
          <p className="text-lg font-medium">No orders yet</p>
          <p className="mt-1 text-sm">Start shopping to see your orders here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                {/* Order Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">Order #{order.id.slice(-8).toUpperCase()}</h3>
                      <Badge className={statusColor[order.status] || 'bg-gray-100'}>{order.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">{formatPrice(order.totalAmount)}</p>
                    <p className="text-sm text-gray-500">
                      {(order.orderItems || []).reduce((sum, item) => sum + item.quantity, 0)} items
                    </p>
                  </div>
                </div>

                {/* Product Items */}
                {(order.orderItems && order.orderItems.length > 0) && (
                  <div className="mt-4 space-y-2">
                    <Separator className="mb-3" />
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
                                                  <ProductImage src={item.product?.image} name={item.product?.name || 'Product'} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{item.product?.name || 'Product'}</p>
                          <p className="text-xs text-gray-500">
                            {formatPrice(item.price)} each
                          </p>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          x{item.quantity}
                        </Badge>
                        <p className="text-sm font-semibold text-gray-900 shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {order.deliveryAddress && (
                  <div className="mt-3 flex items-center gap-1 text-sm text-gray-500">
                    <Truck className="h-3 w-3" />
                    {order.deliveryAddress}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Main Marketplace ---
export default function MarketplacePage() {
  const {
    products, setProducts, farms, setFarms,
    buyerTab, setBuyerTab, selectedProductId,
    user,
  } = useAppStore()

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
      } catch (err) {
        console.error('Failed to load data:', err)
      }
    }
    if (products.length === 0) loadData()
  }, [])

  // If a product is selected, show detail
  if (selectedProductId) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductDetail />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Buyer Role Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Buyer Marketplace</h2>
            <p className="text-xs text-blue-100">Browse, shop, and track your farm-fresh orders</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs value={buyerTab} onValueChange={(v) => setBuyerTab(v as typeof buyerTab)}>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Marketplace</h1>
              <p className="mt-1 text-gray-500">Fresh farm products from verified local farmers</p>
            </div>
            <TabsList>
              <TabsTrigger value="browse">Browse</TabsTrigger>
              <TabsTrigger value="cart" className="relative">
                Cart
                {useAppStore.getState().getCartCount() > 0 && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white">
                    {useAppStore.getState().getCartCount()}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="checkout">Checkout</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="browse"><BrowseProducts /></TabsContent>
          <TabsContent value="cart"><CartView /></TabsContent>
          <TabsContent value="orders"><MyOrders /></TabsContent>
          <TabsContent value="checkout"><Checkout /></TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

