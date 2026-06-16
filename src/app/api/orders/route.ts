import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const buyerId = searchParams.get('buyerId')
    const farmId = searchParams.get('farmId')

    const where: Record<string, unknown> = {}

    if (buyerId) {
      where.buyerId = buyerId
    }

    // If farmId is provided, find orders containing products from that farm
    if (farmId) {
      const farmProductIds = await db.product
        .findMany({
          where: { farmId },
          select: { id: true },
        })
        .then((ps) => ps.map((p) => p.id))

      where.orderItems = {
        some: {
          productId: { in: farmProductIds },
        },
      }
    }

    const orders = await db.order.findMany({
      where,
      include: {
        buyer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        orderItems: {
          include: {
            product: {
              include: {
                farm: {
                  select: { id: true, farmName: true },
                },
              },
            },
          },
        },
        delivery: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { buyerId, items, deliveryAddress, phone, paymentMethod } = body

    if (!buyerId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'buyerId and items are required' }, { status: 400 })
    }

    if (!deliveryAddress) {
      return NextResponse.json({ error: 'deliveryAddress is required' }, { status: 400 })
    }

    // Fetch products and validate
    const productIds = items.map((item: { productId: string }) => item.productId)
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
    })

    const productMap = new Map(products.map((p) => [p.id, p]))

    let totalAmount = 0
    const orderItemsData = []

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        )
      }
      if (product.quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${product.quantity}` },
          { status: 400 }
        )
      }
      totalAmount += product.price * item.quantity
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      })
    }

    const order = await db.order.create({
      data: {
        buyerId,
        totalAmount,
        status: 'PENDING',
        paymentMethod: paymentMethod || '',
        deliveryAddress,
        phone: phone || '',
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        buyer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    })

    // Decrement product stock for each ordered item
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } },
      })
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}