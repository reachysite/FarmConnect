import { create } from 'zustand'

// Types
export type UserRole = 'FARMER' | 'BUYER' | 'LOGISTICS' | 'ADMIN'
export type ViewType = 'landing' | 'login' | 'register' | 'marketplace' | 'farmer-dashboard' | 'logistics-dashboard' | 'checkout'
export type FarmerTab = 'overview' | 'products' | 'orders' | 'inventory' | 'add-product'
export type BuyerTab = 'browse' | 'product-detail' | 'cart' | 'orders' | 'checkout'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  phone: string
  address: string
  image: string
}

export interface Product {
  id: string
  farmId: string
  name: string
  description: string
  price: number
  quantity: number
  unit: string
  category: string
  image: string
  harvestDate: string | null
  createdAt: string
  updatedAt: string
  farm?: Farm
}

export interface Farm {
  id: string
  farmerId: string
  farmName: string
  location: string
  description: string
  image: string
  rating: number
  farmer?: { name: string; id: string }
  products?: Product[]
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  buyerId: string
  totalAmount: number
  status: string
  paymentMethod: string
  deliveryAddress: string
  phone: string
  createdAt: string
  orderItems?: OrderItem[]
  delivery?: Delivery
  buyer?: { id: string; name: string; email: string; phone: string }
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  product?: Product
}

export interface Delivery {
  id: string
  orderId: string
  driverId: string
  status: string
  trackingCode: string
  deliveredAt: string | null
  createdAt: string
}

export interface Review {
  id: string
  userId: string
  productId: string
  rating: number
  comment: string
  createdAt: string
  user?: { name: string }
}

// App Store
interface AppStore {
  // Navigation
  currentView: ViewType
  setView: (view: ViewType) => void

  farmerTab: FarmerTab
  setFarmerTab: (tab: FarmerTab) => void

  buyerTab: BuyerTab
  setBuyerTab: (tab: BuyerTab) => void

  selectedProductId: string | null
  setSelectedProductId: (id: string | null) => void

  // Auth
  user: User | null
  setUser: (user: User | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  // Cart
  cart: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number

  // Data
  products: Product[]
  setProducts: (products: Product[]) => void
  farms: Farm[]
  setFarms: (farms: Farm[]) => void
  orders: Order[]
  setOrders: (orders: Order[]) => void
  stats: { totalProducts: number; totalOrders: number; revenue: number; lowStockCount: number } | null
  setStats: (stats: { totalProducts: number; totalOrders: number; revenue: number; lowStockCount: number }) => void

  // Search & filter
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Navigation
  currentView: 'landing',
  setView: (view) => set({ currentView: view }),

  farmerTab: 'overview',
  setFarmerTab: (tab) => set({ farmerTab: tab }),

  buyerTab: 'browse',
  setBuyerTab: (tab) => set({ buyerTab: tab }),

  selectedProductId: null,
  setSelectedProductId: (id) => set({ selectedProductId: id }),

  // Auth
  user: null,
  setUser: (user) => set({ user }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Cart
  cart: [],
  addToCart: (product, quantity = 1) => {
    const { cart } = get()
    const existing = cart.find(item => item.product.id === product.id)
    if (existing) {
      set({
        cart: cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      })
    } else {
      set({ cart: [...cart, { product, quantity }] })
    }
  },
  removeFromCart: (productId) => {
    set({ cart: get().cart.filter(item => item.product.id !== productId) })
  },
  updateCartQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId)
      return
    }
    set({
      cart: get().cart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    })
  },
  clearCart: () => set({ cart: [] }),
  getCartTotal: () => {
    return get().cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    )
  },
  getCartCount: () => {
    return get().cart.reduce((count, item) => count + item.quantity, 0)
  },

  // Data
  products: [],
  setProducts: (products) => set({ products }),
  farms: [],
  setFarms: (farms) => set({ farms }),
  orders: [],
  setOrders: (orders) => set({ orders }),
  stats: null,
  setStats: (stats) => set({ stats }),

  // Search & filter
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedCategory: '',
  setSelectedCategory: (category) => set({ selectedCategory: category }),
}))
