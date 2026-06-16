import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const driverId = searchParams.get('driverId')

    const where: Record<string, unknown> = {}
    if (driverId) {
      where.driverId = driverId
    }

    const deliveries = await db.delivery.findMany({
      where,
      include: {
        order: {
          include: {
            buyer: {
              select: { id: true, name: true, phone: true },
            },
            orderItems: {
              include: {
                product: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
        driver: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(deliveries)
  } catch (error) {
    console.error('Get deliveries error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, driverId, trackingCode } = body

    if (!orderId || !driverId) {
      return NextResponse.json({ error: 'orderId and driverId are required' }, { status: 400 })
    }

    // Check order exists and is not already assigned
    const existingDelivery = await db.delivery.findUnique({
      where: { orderId },
    })

    if (existingDelivery) {
      return NextResponse.json({ error: 'Delivery already exists for this order' }, { status: 409 })
    }

    const delivery = await db.delivery.create({
      data: {
        orderId,
        driverId,
        trackingCode: trackingCode || `VF-${Date.now()}`,
        status: 'PENDING',
      },
      include: {
        order: true,
        driver: {
          select: { id: true, name: true, phone: true },
        },
      },
    })

    // Update order status to SHIPPED
    await db.order.update({
      where: { id: orderId },
      data: { status: 'SHIPPED' },
    })

    return NextResponse.json(delivery, { status: 201 })
  } catch (error) {
    console.error('Create delivery error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id) {
      return NextResponse.json({ error: 'Delivery id is required' }, { status: 400 })
    }

    const validStatuses = ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = { status }
    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date()
    }

    const delivery = await db.delivery.update({
      where: { id },
      data: updateData,
      include: {
        order: {
          include: {
            buyer: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
        driver: {
          select: { id: true, name: true, phone: true },
        },
      },
    })

    // If delivered, also update the order status
    if (status === 'DELIVERED') {
      await db.order.update({
        where: { id: delivery.orderId },
        data: { status: 'DELIVERED' },
      })
    }

    return NextResponse.json(delivery)
  } catch (error) {
    console.error('Update delivery error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}