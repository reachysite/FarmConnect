'use client'

import { useAppStore, type Product } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  AlertTriangle,
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  Leaf,
  Loader2,
  TrendingUp,
  BoxesIcon,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowLeft,
  X,
  ImagePlus,
  Upload,
  Sprout,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
}

function formatPrice(price: number) {
  return `₦${price.toLocaleString()}`
}

// --- Overview ---
function Overview() {
  const { stats, setStats, orders, setOrders, products, user, farms } = useAppStore()

  useEffect(() => {
    async function loadData() {
      if (!user) return
      try {
        const farm = farms.find((f) => f.farmerId === user.id)
        const [statsRes, ordersRes] = await Promise.all([
          fetch(`/api/stats?userId=${user.id}`),
          farm ? fetch(`/api/orders?farmId=${farm.id}`) : Promise.resolve(new Response('[]')),
        ])
        const statsData = await statsRes.json()
        const ordersData = await ordersRes.json()
        setStats(statsData)
        setOrders(ordersData)
      } catch (err) {
        console.error(err)
      }
    }
    loadData()
  }, [user, setStats, setOrders])

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts ?? 0,
      icon: Package,
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Total Revenue',
      value: formatPrice(stats?.revenue ?? 0),
      icon: DollarSign,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      title: 'Low Stock Items',
      value: stats?.lowStockCount ?? 0,
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Welcome back, {user?.name || 'Farmer'}
        </h1>
        <p className="mt-1 text-gray-500">Here&apos;s what&apos;s happening on your farm today</p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s) => (
          <motion.div key={s.title} variants={item}>
            <Card className="border shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{s.title}</p>
                    <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-center py-8 text-gray-400">No orders yet</p>
          ) : (
            <ScrollArea className="max-h-72">
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">{formatPrice(order.totalAmount)}</p>
                      <Badge className={
                        order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// --- Products Management ---
function ProductsManager() {
  const { products, setProducts, user, farms, setFarmerTab, farmerTab } = useAppStore()
  const { toast } = useToast()
  const [editing, setEditing] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)

  // Load fresh data - only this farmer's products
  useEffect(() => {
    async function load() {
      try {
        const farm = farms.find((f) => f.farmerId === user?.id)
        const url = farm ? `/api/products?farmId=${farm.id}` : '/api/products'
        const res = await fetch(url)
        const data = await res.json()
        setProducts(data)
      } catch (err) { console.error(err) }
    }
    load()
  }, [user, farms, setProducts])

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setProducts(products.filter((p) => p.id !== id))
      toast({ title: 'Deleted', description: 'Product removed successfully' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Products</h2>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setFarmerTab('add-product')}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-gray-400">
          <Package className="mb-4 h-16 w-16" />
          <p>No products yet. Add your first product!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden border shadow-sm">
                            <div className="flex h-32 items-center justify-center overflow-hidden bg-gray-100">
                <img
                  src={product.image || `/images/products/${product.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`}
                  alt={product.name}
                  onError={(e) => { const el = e.currentTarget; if (!el.src.startsWith('/images/')) el.src = `/images/products/${product.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`; }}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm capitalize text-gray-500">{product.category}</p>
                  </div>
                  <Badge
                    className={
                      product.quantity === 0 ? 'bg-red-100 text-red-700' :
                      product.quantity <= 5 ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }
                  >
                    {product.quantity} {product.unit}
                  </Badge>
                </div>
                <p className="mt-2 text-lg font-bold text-emerald-600">{formatPrice(product.price)}/{product.unit}</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditing(product)}
                  >
                    <Pencil className="mr-1 h-3 w-3" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog as overlay */}
      {editing && (
        <EditProductModal product={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}

function EditProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { products, setProducts } = useAppStore()
  const { toast } = useToast()
  const [form, setForm] = useState({
    name: product.name,
    description: product.description,
    price: product.price.toString(),
    quantity: product.quantity.toString(),
    unit: product.unit,
    category: product.category,
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          quantity: parseInt(form.quantity),
        }),
      })
      if (!res.ok) throw new Error('Update failed')
      const updated = await res.json()
      setProducts(products.map((p) => (p.id === product.id ? updated : p)))
      toast({ title: 'Updated', description: 'Product updated successfully' })
      onClose()
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Edit Product</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Price (₦)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegetables">Vegetables</SelectItem>
                  <SelectItem value="fruits">Fruits</SelectItem>
                  <SelectItem value="grains">Grains</SelectItem>
                  <SelectItem value="livestock">Livestock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Add Product ---
function AddProduct() {
  const { products, setProducts, user, farms, setFarmerTab } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', price: '', quantity: '', unit: 'kg', category: 'vegetables', image: '',
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast({ title: 'Invalid file', description: 'Only JPEG, PNG, WebP, and GIF images are allowed', variant: 'destructive' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum file size is 5MB', variant: 'destructive' })
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setForm({ ...form, image: data.url })
      setImagePreview(data.url)
      toast({ title: 'Image uploaded', description: 'Product image saved successfully' })
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.quantity) {
      toast({ title: 'Error', description: 'Please fill in required fields', variant: 'destructive' })
      return
    }

    const farm = farms.find((f) => f.farmerId === user?.id)
    if (!farm) {
      toast({ title: 'Error', description: 'No farm found for your account', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId: farm.id,
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          quantity: parseInt(form.quantity),
          unit: form.unit,
          category: form.category,
          image: form.image,
        }),
      })
      if (!res.ok) throw new Error('Failed to add product')
      const data = await res.json()
      setProducts([...products, data])
      toast({ title: 'Success', description: `${form.name} added to your products` })
      setFarmerTab('products')
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setFarmerTab('products')} className="text-gray-600">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
      </Button>

      <Card className="max-w-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input placeholder="e.g., Fresh Tomatoes" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe your product..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Product Image</Label>
              <div className="flex items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-500 transition-colors hover:border-emerald-400 hover:bg-emerald-50/50">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading ? 'Uploading...' : 'Click to upload image'}
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImageUpload} />
                </label>
                {imagePreview && (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border">
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400">JPEG, PNG, WebP, or GIF (max 5MB)</p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="space-y-2">
                <Label>Price (₦) *</Label>
                <Input type="number" placeholder="3500" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input type="number" placeholder="50" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="bag">bag</SelectItem>
                    <SelectItem value="bunch">bunch</SelectItem>
                    <SelectItem value="piece">piece</SelectItem>
                    <SelectItem value="cob">cob</SelectItem>
                    <SelectItem value="crate">crate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="fruits">Fruits</SelectItem>
                    <SelectItem value="grains">Grains</SelectItem>
                    <SelectItem value="livestock">Livestock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Orders Tab ---
function OrdersTab() {
  const { orders, setOrders, user, farms } = useAppStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      if (!user) return
      setLoading(true)
      try {
        const farm = farms.find((f) => f.farmerId === user.id)
        const url = farm ? `/api/orders?farmId=${farm.id}` : '/api/orders'
        const res = await fetch(url)
        const data = await res.json()
        setOrders(data)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    load()
  }, [user, setOrders])

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Update failed')
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)))
      toast({ title: 'Updated', description: `Order status changed to ${status}` })
    } catch (err: any) {
      console.error(err)
    }
  }

  const statusColor: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    PAID: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Orders</h2>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-gray-400">
          <ShoppingCart className="mb-4 h-16 w-16" />
          <p>No orders received yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </h3>
                      <Badge className={statusColor[order.status] || ''}>{order.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                      {order.deliveryAddress && ` - ${order.deliveryAddress}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.orderItems?.length || 0} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="flex flex-wrap gap-2">
                  {order.status === 'PENDING' && (
                    <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(order.id, 'PAID')}>
                      Mark as Paid
                    </Button>
                  )}
                  {order.status === 'PAID' && (
                    <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}>
                      <Truck className="mr-1 h-3 w-3" /> Mark as Shipped
                    </Button>
                  )}
                  {order.status === 'SHIPPED' && (
                    <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}>
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Mark as Delivered
                    </Button>
                  )}
                  {!['DELIVERED', 'CANCELLED'].includes(order.status) && (
                    <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50" onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}>
                      <XCircle className="mr-1 h-3 w-3" /> Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Inventory Tab ---
function InventoryTab() {
  const { products } = useAppStore()

  const lowStock = products.filter((p) => p.quantity > 0 && p.quantity <= 10)
  const outOfStock = products.filter((p) => p.quantity === 0)
  const inStock = products.filter((p) => p.quantity > 10)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border shadow-sm">
          <CardContent className="p-5 text-center">
            <BoxesIcon className="mx-auto mb-2 h-8 w-8 text-emerald-600" />
            <p className="text-2xl font-bold text-gray-900">{inStock.length}</p>
            <p className="text-sm text-gray-500">In Stock</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-5 text-center">
            <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-amber-500" />
            <p className="text-2xl font-bold text-gray-900">{lowStock.length}</p>
            <p className="text-sm text-gray-500">Low Stock</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-5 text-center">
            <XCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
            <p className="text-2xl font-bold text-gray-900">{outOfStock.length}</p>
            <p className="text-sm text-gray-500">Out of Stock</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {lowStock.length === 0 ? (
            <p className="py-4 text-center text-gray-400">All products are well stocked</p>
          ) : (
            <div className="space-y-2">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div>
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.farm?.farmName}</p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700">{p.quantity} {p.unit} left</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {outOfStock.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {outOfStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3">
                  <div>
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.farm?.farmName}</p>
                  </div>
                  <Badge className="bg-red-100 text-red-700">Out of Stock</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// --- Main Farmer Dashboard ---
export default function FarmerDashboard() {
  const {
    farmerTab, setFarmerTab,
    products, setProducts, farms, setFarms,
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Farmer Role Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white">
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Farmer Dashboard</h2>
            <p className="text-xs text-emerald-100">Manage your products, orders, and inventory</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs value={farmerTab} onValueChange={(v) => setFarmerTab(v as typeof farmerTab)}>
          <TabsList className="mb-8">
            <TabsTrigger value="overview">
              <LayoutDashboard className="mr-1.5 h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="products">
              <Package className="mr-1.5 h-4 w-4" /> Products
            </TabsTrigger>
            <TabsTrigger value="add-product">
              <Plus className="mr-1.5 h-4 w-4" /> Add Product
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ShoppingCart className="mr-1.5 h-4 w-4" /> Orders
            </TabsTrigger>
            <TabsTrigger value="inventory">
              <BoxesIcon className="mr-1.5 h-4 w-4" /> Inventory
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><Overview /></TabsContent>
          <TabsContent value="products"><ProductsManager /></TabsContent>
          <TabsContent value="add-product"><AddProduct /></TabsContent>
          <TabsContent value="orders"><OrdersTab /></TabsContent>
          <TabsContent value="inventory"><InventoryTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

