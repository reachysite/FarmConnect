'use client'

import { useAppStore, type Delivery, type Order } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  Truck,
  Package,
  MapPin,
  CheckCircle2,
  Loader2,
  Clock,
  Navigation,
  Box,
  Route,
  Warehouse,
  TrendingUp,
  DollarSign,
  PackageCheck,
  ArrowRight,
  Phone,
  User,
  ChevronRight,
  AlertTriangle,
  ClipboardList,
  BarChart3,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

function formatPrice(price: number) {
  return `₦${price.toLocaleString()}`
}

const deliveryStatusSteps = [
  { key: 'PENDING', label: 'Pending', icon: Clock },
  { key: 'PICKED_UP', label: 'Picked Up', icon: Package },
  { key: 'IN_TRANSIT', label: 'In Transit', icon: Navigation },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
]

type LogisticsTab = 'overview' | 'pickup' | 'active' | 'completed'

export default function LogisticsDashboard() {
  const { user, orders, setOrders } = useAppStore()
  const { toast } = useToast()
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<LogisticsTab>('overview')
  const [searchQuery, setSearchQuery] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [ordersRes, deliveriesRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/deliveries'),
      ])
      const ordersData = await ordersRes.json()
      const deliveriesData = await deliveriesRes.json()
      setAllOrders(ordersData)
      setOrders(ordersData)
      setDeliveries(deliveriesData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAcceptDelivery = async (orderId: string) => {
    if (!user) return
    try {
      const res = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          driverId: user.id,
          trackingCode: `FC${Date.now().toString(36).toUpperCase()}`,
        }),
      })
      if (!res.ok) throw new Error('Failed to create delivery')
      const data = await res.json()
      setDeliveries([...deliveries, data])
      toast({ title: 'Delivery Accepted', description: 'You have been assigned to this delivery. Head to pickup point.' })
      setAllOrders(allOrders.map((o) => (o.id === orderId ? { ...o, status: 'SHIPPED' } : o)))
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    }
  }

  const handleUpdateDeliveryStatus = async (deliveryId: string, status: string) => {
    try {
      const res = await fetch('/api/deliveries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deliveryId, status }),
      })
      if (!res.ok) throw new Error('Update failed')
      setDeliveries(deliveries.map((d) => (d.id === deliveryId ? { ...d, status } : d)))
      toast({ title: 'Status Updated', description: `Delivery marked as: ${status.replace(/_/g, ' ')}` })

      if (status === 'DELIVERED') {
        const delivery = deliveries.find((d) => d.id === deliveryId)
        if (delivery) {
          setAllOrders(allOrders.map((o) => (o.id === delivery.orderId ? { ...o, status: 'DELIVERED' } : o)))
        }
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    }
  }

  // Orders that need delivery (PAID or SHIPPED without active delivery)
  const availableOrders = allOrders.filter(
    (o) => ['PAID', 'SHIPPED'].includes(o.status) &&
    !deliveries.find((d) => d.orderId === o.id && !['DELIVERED'].includes(d.status))
  ).filter((o) => {
    if (!searchQuery) return true
    return (
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.deliveryAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const activeDeliveries = deliveries.filter((d) => d.status !== 'DELIVERED')
  const completedDeliveries = deliveries.filter((d) => d.status === 'DELIVERED')

  const totalEarnings = completedDeliveries.reduce((sum, d) => {
    const order = allOrders.find((o) => o.id === d.orderId)
    return sum + (order ? order.totalAmount * 0.05 : 0)
  }, 0)

  const statusColor: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    PICKED_UP: 'bg-blue-100 text-blue-700 border-blue-200',
    IN_TRANSIT: 'bg-purple-100 text-purple-700 border-purple-200',
    DELIVERED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  }

  const orderStatusColor: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    PAID: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }

  const tabs: { key: LogisticsTab; label: string; icon: any; count: number }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart3, count: 0 },
    { key: 'pickup', label: 'Pickup Queue', icon: ClipboardList, count: availableOrders.length },
    { key: 'active', label: 'Active', icon: Navigation, count: activeDeliveries.length },
    { key: 'completed', label: 'Completed', icon: CheckCircle2, count: completedDeliveries.length },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-600" />
          <p className="mt-2 text-sm text-gray-500">Loading logistics data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Logistics Role Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white shadow-lg">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Logistics Control Center</h2>
              <p className="text-sm text-amber-100">Manage shipments, track deliveries, and optimize routes across the supply chain</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <div className="rounded-lg bg-white/10 px-3 py-2 text-center backdrop-blur-sm">
              <p className="text-xs text-amber-200">Earnings</p>
              <p className="text-lg font-bold text-white">{formatPrice(totalEarnings)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto border-b border-gray-200 pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                  activeTab === tab.key ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { title: 'Pending Pickup', value: availableOrders.length, icon: ClipboardList, color: 'bg-amber-100 text-amber-600', desc: 'Orders awaiting driver' },
                { title: 'Active Deliveries', value: activeDeliveries.length, icon: Navigation, color: 'bg-blue-100 text-blue-600', desc: 'Currently in transit' },
                { title: 'Completed', value: completedDeliveries.length, icon: PackageCheck, color: 'bg-emerald-100 text-emerald-600', desc: 'Successfully delivered' },
                { title: 'Total Earnings', value: formatPrice(totalEarnings), icon: DollarSign, color: 'bg-purple-100 text-purple-600', desc: '5% commission' },
              ].map((s, i) => (
                <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.color}`}>
                          <s.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{s.title}</p>
                          <p className="text-xl font-bold text-gray-900">{s.value}</p>
                          <p className="text-[10px] text-gray-400">{s.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Supply Chain Pipeline */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Route className="h-5 w-5 text-amber-600" />
                  Supply Chain Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-50 via-blue-50 to-emerald-50 p-6">
                  {deliveryStatusSteps.map((step, i) => {
                    const StepIcon = step.icon
                    const count = step.key === 'PENDING'
                      ? availableOrders.length
                      : step.key === 'PICKED_UP'
                        ? deliveries.filter((d) => d.status === 'PICKED_UP').length
                        : step.key === 'IN_TRANSIT'
                          ? deliveries.filter((d) => d.status === 'IN_TRANSIT').length
                          : completedDeliveries.length
                    return (
                      <div key={step.key} className="flex flex-col items-center">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-full border-2 ${
                          count > 0 ? 'border-amber-400 bg-white shadow-md' : 'border-gray-200 bg-white'
                        }`}>
                          <StepIcon className={`h-6 w-6 ${count > 0 ? 'text-amber-600' : 'text-gray-300'}`} />
                        </div>
                        <p className="mt-2 text-xs font-medium text-gray-600">{step.label}</p>
                        <p className={`text-lg font-bold ${count > 0 ? 'text-gray-900' : 'text-gray-300'}`}>{count}</p>
                        {i < deliveryStatusSteps.length - 1 && (
                          <ArrowRight className="absolute text-gray-300 lg:ml-24 xl:ml-28 hidden sm:block" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Urgent Pickups */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Urgent Pickups
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {availableOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <Warehouse className="mb-2 h-10 w-10" />
                      <p className="text-sm">No pending pickups</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {availableOrders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50/50 p-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Order #{order.id.slice(-8).toUpperCase()}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {order.deliveryAddress || 'No address'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-amber-600">{formatPrice(order.totalAmount)}</p>
                            <Badge className="text-[10px] bg-amber-100 text-amber-700">Pending</Badge>
                          </div>
                        </div>
                      ))}
                      {availableOrders.length > 3 && (
                        <Button variant="ghost" size="sm" className="w-full text-amber-600" onClick={() => setActiveTab('pickup')}>
                          View all {availableOrders.length} pending orders <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Active Deliveries Quick View */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Navigation className="h-5 w-5 text-blue-500" />
                    Active Shipments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeDeliveries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                      <Truck className="mb-2 h-10 w-10" />
                      <p className="text-sm">No active shipments</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeDeliveries.map((delivery) => {
                        const order = allOrders.find((o) => o.id === delivery.orderId)
                        const currentStepIdx = deliveryStatusSteps.findIndex((s) => s.key === delivery.status)
                        return (
                          <div key={delivery.id} className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">#{order?.id.slice(-8).toUpperCase() || '...'}</p>
                                <p className="font-mono text-xs text-blue-600">{delivery.trackingCode}</p>
                              </div>
                              <Badge className={statusColor[delivery.status] || ''}>{delivery.status.replace(/_/g, ' ')}</Badge>
                            </div>
                            {/* Mini progress bar */}
                            <div className="mt-2 flex gap-1">
                              {deliveryStatusSteps.map((s, i) => (
                                <div key={s.key} className={`h-1.5 flex-1 rounded-full ${i <= currentStepIdx ? 'bg-blue-500' : 'bg-gray-200'}`} />
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Pickup Queue Tab */}
        {activeTab === 'pickup' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Pickup Queue</h2>
                <p className="text-sm text-gray-500">Orders ready for pickup and delivery assignment</p>
              </div>
              <div className="relative w-full sm:w-72">
                <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by order ID, address, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {availableOrders.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Warehouse className="mb-4 h-16 w-16" />
                  <p className="text-lg font-medium">No orders available for pickup</p>
                  <p className="mt-1 text-sm">Check back later for new delivery requests</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {availableOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-2 border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900">
                              #{order.id.slice(-8).toUpperCase()}
                            </h3>
                            <Badge className={`mt-1 ${orderStatusColor[order.status] || ''}`}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="rounded-lg bg-amber-50 px-3 py-1.5 text-right">
                            <p className="text-xs text-gray-500">Order Value</p>
                            <p className="font-bold text-amber-600">{formatPrice(order.totalAmount)}</p>
                          </div>
                        </div>

                        {/* Items count */}
                        <div className="mb-3 rounded-lg bg-gray-50 p-3">
                          <p className="text-xs font-medium text-gray-500 mb-1">Items Ordered</p>
                          <div className="flex flex-wrap gap-1">
                            {(order.orderItems || []).slice(0, 3).map((item) => (
                              <Badge key={item.id} variant="outline" className="text-[10px]">
                                {item.product?.name || 'Product'} x{item.quantity}
                              </Badge>
                            ))}
                            {(order.orderItems || []).length > 3 && (
                              <Badge variant="secondary" className="text-[10px]">
                                +{(order.orderItems || []).length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <Separator className="my-3" />

                        {/* Delivery Info */}
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                            <p className="text-sm text-gray-600">{order.deliveryAddress || 'No delivery address'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                            <p className="text-sm text-gray-600">{order.phone || 'No phone'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 shrink-0 text-gray-400" />
                            <p className="text-sm text-gray-600">{order.buyer?.name || 'Customer'}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <p className="text-xs text-gray-400">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </p>
                          <Button
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700"
                            onClick={() => handleAcceptDelivery(order.id)}
                          >
                            <Truck className="mr-1.5 h-4 w-4" />
                            Accept & Pickup
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Active Deliveries Tab */}
        {activeTab === 'active' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Active Deliveries</h2>
              <p className="text-sm text-gray-500">Manage and track your in-progress deliveries</p>
            </div>

            {activeDeliveries.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Navigation className="mb-4 h-16 w-16" />
                  <p className="text-lg font-medium">No active deliveries</p>
                  <p className="mt-1 text-sm">Accept orders from the pickup queue to get started</p>
                  <Button className="mt-4 bg-amber-600 hover:bg-amber-700" onClick={() => setActiveTab('pickup')}>
                    Go to Pickup Queue
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeDeliveries.map((delivery) => {
                  const order = allOrders.find((o) => o.id === delivery.orderId)
                  const currentStep = deliveryStatusSteps.findIndex((s) => s.key === delivery.status)
                  const StatusIcon = deliveryStatusSteps[currentStep]?.icon || Clock

                  return (
                    <motion.div
                      key={delivery.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Card className="overflow-hidden border-2 shadow-sm">
                        <div className={`h-1.5 ${
                          delivery.status === 'PICKED_UP' ? 'bg-blue-500' :
                          delivery.status === 'IN_TRANSIT' ? 'bg-purple-500' :
                          'bg-amber-500'
                        }`} />
                        <CardContent className="p-5">
                          {/* Header */}
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                delivery.status === 'PICKED_UP' ? 'bg-blue-100 text-blue-600' :
                                delivery.status === 'IN_TRANSIT' ? 'bg-purple-100 text-purple-600' :
                                'bg-amber-100 text-amber-600'
                              }`}>
                                <StatusIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-bold text-gray-900">
                                    #{order?.id.slice(-8).toUpperCase() || delivery.orderId.slice(-8)}
                                  </h3>
                                  <Badge className={statusColor[delivery.status] || ''}>
                                    {delivery.status.replace(/_/g, ' ')}
                                  </Badge>
                                </div>
                                <p className="mt-1 font-mono text-sm text-amber-600">
                                  Tracking: {delivery.trackingCode || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="rounded-lg bg-gray-50 px-4 py-2 text-right">
                              <p className="text-xs text-gray-500">Delivery Fee</p>
                              <p className="text-lg font-bold text-gray-900">
                                {order ? formatPrice(order.totalAmount * 0.05) : '₦0'}
                              </p>
                            </div>
                          </div>

                          {/* Progress Steps */}
                          <div className="mt-6">
                            <div className="flex items-center justify-between">
                              {deliveryStatusSteps.map((step, i) => {
                                const StepIcon = step.icon
                                const isCompleted = i < currentStep
                                const isCurrent = i === currentStep
                                return (
                                  <div key={step.key} className="flex flex-1 flex-col items-center">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                                      isCompleted
                                        ? 'border-emerald-500 bg-emerald-500 text-white'
                                        : isCurrent
                                          ? 'border-amber-500 bg-amber-500 text-white'
                                          : 'border-gray-200 bg-white text-gray-300'
                                    }`}>
                                      {isCompleted ? (
                                        <CheckCircle2 className="h-5 w-5" />
                                      ) : (
                                        <StepIcon className="h-4 w-4" />
                                      )}
                                    </div>
                                    <span className={`mt-2 text-xs font-medium ${isCurrent ? 'text-amber-600' : isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
                                      {step.label}
                                    </span>
                                    {/* Connector line */}
                                    {i < deliveryStatusSteps.length - 1 && (
                                      <div className={`mt-[-1.5rem] h-0.5 w-full min-w-8 ${
                                        i < currentStep ? 'bg-emerald-300' : 'bg-gray-200'
                                      }`} />
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          {/* Order Details */}
                          <div className="mt-6 grid gap-4 sm:grid-cols-3">
                            <div className="flex items-start gap-2">
                              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                              <div>
                                <p className="text-xs font-medium text-gray-500">Destination</p>
                                <p className="text-sm text-gray-700">{order?.deliveryAddress || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                              <div>
                                <p className="text-xs font-medium text-gray-500">Customer Phone</p>
                                <p className="text-sm text-gray-700">{order?.phone || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Package className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                              <div>
                                <p className="text-xs font-medium text-gray-500">Items</p>
                                <div className="flex flex-wrap gap-1">
                                  {(order?.orderItems || []).slice(0, 3).map((item) => (
                                    <span key={item.id} className="text-xs text-gray-600">
                                      {item.product?.name || 'Item'} x{item.quantity}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Status Update */}
                          {delivery.status !== 'DELIVERED' && (
                            <div className="mt-6 flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                              <TrendingUp className="h-4 w-4 text-gray-500" />
                              <p className="flex-1 text-sm font-medium text-gray-700">Update Delivery Status</p>
                              <Select
                                onValueChange={(v) => handleUpdateDeliveryStatus(delivery.id, v)}
                              >
                                <SelectTrigger className="w-48">
                                  <SelectValue placeholder="Select next status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {deliveryStatusSteps
                                    .filter((s) => deliveryStatusSteps.indexOf(s) > currentStep)
                                    .map((s) => (
                                      <SelectItem key={s.key} value={s.key}>
                                        Mark as {s.label}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Completed Tab */}
        {activeTab === 'completed' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Completed Deliveries</h2>
              <p className="text-sm text-gray-500">History of all successfully delivered orders</p>
            </div>

            {completedDeliveries.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <PackageCheck className="mb-4 h-16 w-16" />
                  <p className="text-lg font-medium">No completed deliveries yet</p>
                  <p className="mt-1 text-sm">Completed deliveries will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {completedDeliveries.map((delivery) => {
                  const order = allOrders.find((o) => o.id === delivery.orderId)
                  const fee = order ? order.totalAmount * 0.05 : 0
                  return (
                    <motion.div
                      key={delivery.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="border shadow-sm">
                        <CardContent className="flex items-center gap-4 p-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">
                                #{order?.id.slice(-8).toUpperCase() || '...'}
                              </h3>
                              <Badge className="bg-emerald-100 text-emerald-700">Delivered</Badge>
                            </div>
                            <p className="text-xs text-gray-500">
                              {order?.deliveryAddress || 'N/A'}
                              {delivery.deliveredAt && ` · Delivered ${new Date(delivery.deliveredAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Your Fee</p>
                            <p className="font-bold text-emerald-600">{formatPrice(fee)}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}

                {/* Earnings Summary */}
                <Card className="bg-gradient-to-r from-amber-50 to-emerald-50 border-amber-200">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Earnings ({completedDeliveries.length} deliveries)</p>
                        <p className="text-xs text-gray-400">5% commission on each delivery</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-amber-600">{formatPrice(totalEarnings)}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
