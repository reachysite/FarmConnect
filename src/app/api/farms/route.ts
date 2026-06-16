import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const farms = await db.farm.findMany({
      include: {
        farmer: {
          select: { id: true, name: true, email: true, phone: true, image: true },
        },
        products: {
          select: { id: true, name: true, price: true, quantity: true },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(farms)
  } catch (error) {
    console.error('Get farms error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}