import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Find the farm(s) owned by this user
    const farms = await db.farm.findMany({
      where: { farmerId: userId },
      select: { id: true },
    })

    const farmIds = farms.map((f) => f.id)

    // Total products
    const totalProducts = await db.product.count({
      where: { farmId: { in: farmIds } },
    })

    // Total orders containing products from this farmer's farms
    const farmProductIds = await db.product
      .findMany({
        where: { farmId: { in: farmIds } },
        select: { id: true },
      })
      .then((ps) => ps.map((p) => p.id))

    const ordersContainingFarmProducts = await db.orderItem.groupBy({
      by: ['orderId'],
      where: { productId: { in: farmProductIds } },
    })

    const totalOrders = ordersContainingFarmProducts.length

    // Revenue: sum of (quantity * price) for all order items with farm's products
    const revenueData = await db.orderItem.aggregate({
      where: { productId: { in: farmProductIds } },
      _sum: { price: true },
    })

    // Calculate actual revenue: sum of price * quantity for each order item
    const orderItems = await db.orderItem.findMany({
      where: { productId: { in: farmProductIds } },
      select: { price: true, quantity: true },
    })

    const revenue = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Low stock count (products with quantity <= 100)
    const lowStockCount = await db.product.count({
      where: {
        farmId: { in: farmIds },
        quantity: { lte: 100 },
      },
    })

    return NextResponse.json({
      totalProducts,
      totalOrders,
      revenue,
      lowStockCount,
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}