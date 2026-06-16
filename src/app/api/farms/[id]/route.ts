import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const farm = await db.farm.findUnique({
      where: { id },
      include: {
        farmer: {
          select: { id: true, name: true, email: true, phone: true, image: true },
        },
        products: {
          include: {
            reviews: {
              select: { rating: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 })
    }

    const productsWithRating = farm.products.map((p) => {
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

    return NextResponse.json({
      ...farm,
      products: productsWithRating,
    })
  } catch (error) {
    console.error('Get farm error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}