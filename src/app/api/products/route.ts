import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}

    if (category && category !== 'all') {
      where.category = category
    }

    if (search) {
      where.name = { contains: search }
    }

    const products = await db.product.findMany({
      where,
      include: {
        farm: {
          include: {
            farmer: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate average rating for each product
    const productsWithRating = products.map((p) => {
      const avgRating =
        p.reviews.length > 0
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : 0
      const { reviews, ...productWithoutReviews } = p
      return {
        ...productWithoutReviews,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: p.reviews.length,
      }
    })

    return NextResponse.json(productsWithRating)
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { farmId, name, price, quantity, unit, category, description, image, harvestDate } = body

    if (!farmId || !name || price === undefined || quantity === undefined) {
      return NextResponse.json(
        { error: 'farmId, name, price, and quantity are required' },
        { status: 400 }
      )
    }

    const product = await db.product.create({
      data: {
        farmId,
        name,
        description: description || '',
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        unit: unit || 'kg',
        category: category || 'vegetables',
        image: image || '',
        harvestDate: harvestDate ? new Date(harvestDate) : null,
      },
      include: {
        farm: {
          include: {
            farmer: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}