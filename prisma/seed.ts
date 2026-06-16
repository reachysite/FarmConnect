import { db } from '../src/lib/db'

async function main() {
  console.log('🌱 Seeding database...')

  // Clean up existing data
  await db.review.deleteMany()
  await db.delivery.deleteMany()
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.product.deleteMany()
  await db.farm.deleteMany()
  await db.user.deleteMany()

  // ─── Users ───
  const users = await Promise.all([
    db.user.create({
      data: {
        id: 'user_farmer1',
        name: 'Adebayo Okonkwo',
        email: 'adebayo@farm.ng',
        password: 'password',
        phone: '+234 801 234 5678',
        address: 'Ibadan, Oyo State',
        role: 'FARMER',
        image: '',
      },
    }),
    db.user.create({
      data: {
        id: 'user_farmer2',
        name: 'Fatima Musa',
        email: 'fatima@farm.ng',
        password: 'password',
        phone: '+234 802 345 6789',
        address: 'Kano, Kano State',
        role: 'FARMER',
        image: '',
      },
    }),
    db.user.create({
      data: {
        id: 'user_buyer1',
        name: 'Chinedu Eze',
        email: 'chinedu@buy.ng',
        password: 'password',
        phone: '+234 803 456 7890',
        address: 'Lagos Island, Lagos State',
        role: 'BUYER',
        image: '',
      },
    }),
    db.user.create({
      data: {
        id: 'user_logistics1',
        name: 'Emeka Nwosu',
        email: 'emeka@logistics.ng',
        password: 'password',
        phone: '+234 804 567 8901',
        address: 'Abuja, FCT',
        role: 'LOGISTICS',
        image: '',
      },
    }),
  ])

  const [farmer1, farmer2, buyer1, logistics1] = users

  // ─── Farms ───
  const farms = await Promise.all([
    db.farm.create({
      data: {
        id: 'farm_1',
        farmerId: farmer1.id,
        farmName: 'Green Harvest Farm',
        location: 'Ibadan, Oyo State',
        description:
          'A family-owned farm specializing in organic vegetables and tubers, established in 2015. We use sustainable farming practices to produce fresh, healthy crops.',
        image: '/images/farms/green-harvest-farm.png',
        rating: 4.5,
      },
    }),
    db.farm.create({
      data: {
        id: 'farm_2',
        farmerId: farmer2.id,
        farmName: 'Sahel Produce',
        location: 'Kano, Kano State',
        description:
          'A large-scale farm in Northern Nigeria focused on grains, legumes, and spices. We supply markets across the region with high-quality produce.',
        image: '/images/farms/sahel-produce.png',
        rating: 4.2,
      },
    }),
  ])

  const [farm1, farm2] = farms

  // ─── Products ───
  const products = await Promise.all([
    db.product.create({
      data: {
        id: 'prod_1', farmId: farm1.id,
        name: 'Fresh Tomatoes',
        description: 'Ripe, juicy tomatoes freshly harvested from the farm.',
        price: 1500, quantity: 200, unit: 'kg', category: 'vegetables',
        image: '/images/products/tomatoes.png',
        harvestDate: new Date('2025-01-10'),
      },
    }),
    db.product.create({
      data: {
        id: 'prod_2', farmId: farm1.id,
        name: 'Red Bell Pepper',
        description: 'Sweet red bell peppers, great for salads and cooking.',
        price: 3000, quantity: 80, unit: 'kg', category: 'vegetables',
        image: '/images/products/bell-pepper.png',
        harvestDate: new Date('2025-01-08'),
      },
    }),
    db.product.create({
      data: {
        id: 'prod_3', farmId: farm1.id,
        name: 'Carrots',
        description: 'Fresh orange carrots, rich in vitamins.',
        price: 1200, quantity: 150, unit: 'kg', category: 'vegetables',
        image: '/images/products/carrots.png',
        harvestDate: new Date('2025-01-09'),
      },
    }),
    db.product.create({
      data: {
        id: 'prod_4', farmId: farm1.id,
        name: 'Green Beans',
        description: 'Crisp green beans harvested at peak freshness.',
        price: 2000, quantity: 60, unit: 'kg', category: 'vegetables',
        image: '/images/products/green-beans.png',
        harvestDate: new Date('2025-01-11'),
      },
    }),
    db.product.create({
      data: {
        id: 'prod_5', farmId: farm1.id,
        name: 'Cucumber',
        description: 'Cool, refreshing cucumbers perfect for salads.',
        price: 800, quantity: 300, unit: 'kg', category: 'vegetables',
        image: '/images/products/cucumber.png',
        harvestDate: new Date('2025-01-12'),
      },
    }),
    db.product.create({
      data: {
        id: 'prod_6', farmId: farm1.id,
        name: 'Yam Tubers',
        description: 'Premium yam tubers from the fertile soils of Oyo State.',
        price: 2500, quantity: 500, unit: 'kg', category: 'tubers',
        image: '/images/products/yam.png',
        harvestDate: new Date('2025-01-05'),
      },
    }),
    db.product.create({
      data: {
        id: 'prod_7', farmId: farm1.id,
        name: 'Sweet Potatoes',
        description: 'Delicious sweet potatoes, great for boiling or roasting.',
        price: 1200, quantity: 180, unit: 'kg', category: 'tubers',
        image: '/images/products/sweet-potatoes.png',
        harvestDate: new Date('2025-01-07'),
      },
    }),
    db.product.create({
      data: {
        id: 'prod_8', farmId: farm2.id,
        name: 'White Maize',
        description: 'High-quality white maize suitable for flour and feed.',
        price: 600, quantity: 2000, unit: 'kg', category: 'grains',
        image: '/images/products/white-maize.png',
        harvestDate: new Date('2024-12-20'),
      },
    }),
    db.product.create({
      data: {
        id: 'prod_9', farmId: farm2.id,
        name: 'Brown Beans (Oloyin)',
        description: 'Premium honey beans, a Nigerian staple.',
        price: 2500, quantity: 800, unit: 'kg', category: 'legumes',
        image: '/images/products/brown-beans.png',
        harvestDate: new Date('2024-12-15'),
      },
    }),
    db.product.create({
      data: {
        id: 'prod_10', farmId: farm2.id,
        name: 'Sorghum',
        description: 'Drought-resistant sorghum grains for food and beverage.',
        price: 500, quantity: 3000, unit: 'kg', category: 'grains',
        image: '/images/products/sorghum.png',
        harvestDate: new Date('2024-12-18'),
      },
    }),
    db.product.create({
      data: {
        id: 'prod_11', farmId: farm2.id,
        name: 'Dried Pepper (Ata Rodo)',
        description: 'Hot scotch bonnet peppers, sun-dried for long storage.',
        price: 4000, quantity: 120, unit: 'kg', category: 'spices',
        image: '/images/products/dried-pepper.png',
        harvestDate: new Date('2025-01-01'),
      },
    }),
    db.product.create({
      data: {
        id: 'prod_12', farmId: farm2.id,
        name: 'Groundnut (Peanuts)',
        description: 'Fresh groundnuts in shell, great for snacking and oil extraction.',
        price: 1800, quantity: 600, unit: 'kg', category: 'legumes',
        image: '/images/products/groundnut.png',
        harvestDate: new Date('2024-12-25'),
      },
    }),
    db.product.create({
      data: {
        id: 'prod_13', farmId: farm2.id,
        name: 'Sesame Seeds (Beniseed)',
        description: 'Premium sesame seeds for cooking and oil production.',
        price: 5500, quantity: 200, unit: 'kg', category: 'grains',
        image: '/images/products/sesame-seeds.png',
        harvestDate: new Date('2025-01-02'),
      },
    }),
    db.product.create({
      data: {
        id: 'prod_14', farmId: farm2.id,
        name: 'Onions',
        description: 'Large red onions, essential for Nigerian cooking.',
        price: 900, quantity: 400, unit: 'kg', category: 'vegetables',
        image: '/images/products/onions.png',
        harvestDate: new Date('2025-01-06'),
      },
    }),
    db.product.create({
      data: {
        id: 'prod_15', farmId: farm1.id,
        name: 'Mangoes',
        description: 'Sweet, juicy mangoes harvested at peak ripeness from our orchard.',
        price: 2500, quantity: 100, unit: 'kg', category: 'fruits',
        image: '/images/products/mango.png',
        harvestDate: new Date('2025-01-15'),
      },
    }),
    db.product.create({
      data: {
        id: 'prod_16', farmId: farm1.id,
        name: 'Oranges',
        description: 'Fresh, tangy oranges bursting with vitamin C.',
        price: 1800, quantity: 150, unit: 'kg', category: 'fruits',
        image: '/images/products/oranges.png',
        harvestDate: new Date('2025-01-14'),
      },
    }),
    db.product.create({
      data: {
        id: 'prod_17', farmId: farm1.id,
        name: 'Bananas',
        description: 'Ripe plantain and banana bunches, great for cooking or snacking.',
        price: 1200, quantity: 200, unit: 'bunch', category: 'fruits',
        image: '/images/products/bananas.png',
        harvestDate: new Date('2025-01-16'),
      },
    }),
    db.product.create({
      data: {
        id: 'prod_18', farmId: farm1.id,
        name: 'Watermelon',
        description: 'Large, refreshing watermelons perfect for the Nigerian heat.',
        price: 800, quantity: 80, unit: 'piece', category: 'fruits',
        image: '/images/products/watermelon.png',
        harvestDate: new Date('2025-01-17'),
      },
    }),
    db.product.create({
      data: {
        id: 'prod_19', farmId: farm2.id,
        name: 'Pineapple',
        description: 'Sweet, golden pineapples grown in the tropical South.',
        price: 1500, quantity: 60, unit: 'piece', category: 'fruits',
        image: '/images/products/pineapple.png',
        harvestDate: new Date('2025-01-13'),
      },
    }),
    db.product.create({
      data: {
        id: 'prod_20', farmId: farm2.id,
        name: 'Pawpaw (Papaya)',
        description: 'Fresh pawpaw rich in vitamins and digestive enzymes.',
        price: 1000, quantity: 40, unit: 'piece', category: 'fruits',
        image: '/images/products/pawpaw.png',
        harvestDate: new Date('2025-01-12'),
      },
    }),
    db.product.create({
      data: {
        id: 'prod_21', farmId: farm1.id,
        name: 'Farm Eggs (Crate)',
        description: 'Fresh free-range eggs, packed in crates of 30.',
        price: 3500, quantity: 50, unit: 'crate', category: 'livestock',
        image: '/images/products/eggs.png',
        harvestDate: new Date('2025-01-18'),
      },
    }),
    db.product.create({
      data: {
        id: 'prod_22', farmId: farm1.id,
        name: 'Live Chicken',
        description: 'Healthy, fully grown live chickens for sale.',
        price: 4500, quantity: 30, unit: 'piece', category: 'livestock',
        image: '/images/products/live-chicken.png',
        harvestDate: new Date('2025-01-18'),
      },
    }),
    db.product.create({
      data: {
        id: 'prod_23', farmId: farm2.id,
        name: 'Goat Meat',
        description: 'Fresh, inspected goat meat cuts, great for Nigerian pepper soup and stews.',
        price: 8000, quantity: 25, unit: 'kg', category: 'livestock',
        image: '/images/products/goat-meat.png',
        harvestDate: new Date('2025-01-19'),
      },
    }),
    db.product.create({
      data: {
        id: 'prod_24', farmId: farm2.id,
        name: 'Fresh Catfish',
        description: 'Live catfish from our fish farm, cleaned and ready for cooking.',
        price: 3500, quantity: 100, unit: 'kg', category: 'livestock',
        image: '/images/products/catfish.png',
        harvestDate: new Date('2025-01-20'),
      },
    }),
  ])

  // ─── Orders ───
  const order1 = await db.order.create({
    data: {
      id: 'order_1', buyerId: buyer1.id,
      totalAmount: 1500 * 10 + 3000 * 5,
      status: 'PENDING',
      deliveryAddress: '45 Marina Street, Lagos Island, Lagos',
      phone: buyer1.phone,
    },
  })
  await db.orderItem.createMany({
    data: [
      { id: 'oi_1', orderId: order1.id, productId: products[0].id, quantity: 10, price: 1500 },
      { id: 'oi_2', orderId: order1.id, productId: products[1].id, quantity: 5, price: 3000 },
    ],
  })

  const order2 = await db.order.create({
    data: {
      id: 'order_2', buyerId: buyer1.id,
      totalAmount: 2500 * 20 + 1200 * 10,
      status: 'SHIPPED',
      deliveryAddress: '12 Broad Street, Lagos Island, Lagos',
      phone: buyer1.phone,
    },
  })
  await db.orderItem.createMany({
    data: [
      { id: 'oi_3', orderId: order2.id, productId: products[5].id, quantity: 20, price: 2500 },
      { id: 'oi_4', orderId: order2.id, productId: products[6].id, quantity: 10, price: 1200 },
    ],
  })

  await db.delivery.create({
    data: {
      id: 'delivery_1', orderId: order2.id, driverId: logistics1.id,
      status: 'IN_TRANSIT', trackingCode: 'VF-2025-NG-00421', deliveredAt: null,
    },
  })

  const order3 = await db.order.create({
    data: {
      id: 'order_3', buyerId: buyer1.id,
      totalAmount: 600 * 50 + 2500 * 30,
      status: 'DELIVERED',
      deliveryAddress: '8 Awolowo Road, Ikoyi, Lagos',
      phone: buyer1.phone,
    },
  })
  await db.orderItem.createMany({
    data: [
      { id: 'oi_5', orderId: order3.id, productId: products[7].id, quantity: 50, price: 600 },
      { id: 'oi_6', orderId: order3.id, productId: products[8].id, quantity: 30, price: 2500 },
    ],
  })

  // ─── Reviews ───
  await db.review.createMany({
    data: [
      { id: 'review_1', userId: buyer1.id, productId: products[0].id, rating: 5, comment: 'Absolutely fresh and delicious tomatoes! Arrived in perfect condition. Will definitely order again.' },
      { id: 'review_2', userId: buyer1.id, productId: products[5].id, rating: 4, comment: 'Good quality yams. Some were a bit small but overall great value for money.' },
      { id: 'review_3', userId: buyer1.id, productId: products[7].id, rating: 5, comment: 'Excellent maize grains. Very clean and well-dried. Perfect for making pap.' },
      { id: 'review_4', userId: buyer1.id, productId: products[8].id, rating: 4, comment: 'Nice oloyin beans. Cooks soft and tastes great. Just a few stones to pick out.' },
    ],
  })

  console.log('✅ Seed completed successfully!')
  console.log(`   Users:      ${4}`)
  console.log(`   Farms:      ${2}`)
  console.log(`   Products:   ${products.length}`)
  console.log(`   Orders:     ${3}`)
  console.log(`   OrderItems: ${6}`)
  console.log(`   Deliveries: ${1}`)
  console.log(`   Reviews:    ${4}`)
}

main()
  .then(async () => { await db.$disconnect() })
  .catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1) })