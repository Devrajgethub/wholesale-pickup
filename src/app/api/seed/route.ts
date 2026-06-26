import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('[SEED] Starting database seed...');

    // Only seed if no categories exist (idempotent)
    const existing = await db.category.count();
    console.log('[SEED] Existing categories:', existing);

    if (existing > 0) {
      const productCount = await db.product.count();
      console.log('[SEED] Database already seeded with', existing, 'categories and', productCount, 'products');
      return NextResponse.json({ success: true, message: 'Database already seeded', categories: existing, products: productCount });
    }

    // Clear existing data
    await db.orderItem.deleteMany();
    await db.order.deleteMany();
    await db.product.deleteMany();
    await db.category.deleteMany();
    await db.user.deleteMany();
    console.log('[SEED] Cleared existing data');

    // Create admin user
    await db.user.create({
      data: {
        name: 'Shop Admin',
        mobile: '9999999999',
        businessName: 'ABC Wholesale Store',
        isAdmin: true,
      },
    });
    console.log('[SEED] Created admin user');

    // Create categories
    const categories = await Promise.all([
      db.category.create({ data: { name: 'Cooking Oil', slug: 'cooking-oil', image: '/categories/oil.png', sortOrder: 1 } }),
      db.category.create({ data: { name: 'Rice & Grains', slug: 'rice-grains', image: '/categories/rice.png', sortOrder: 2 } }),
      db.category.create({ data: { name: 'Spices & Masala', slug: 'spices-masala', image: '/categories/spices.png', sortOrder: 3 } }),
      db.category.create({ data: { name: 'Flour & Atta', slug: 'flour-atta', image: '/categories/flour.png', sortOrder: 4 } }),
      db.category.create({ data: { name: 'Pulses & Dal', slug: 'pulses-dal', image: '/categories/pulses.png', sortOrder: 5 } }),
      db.category.create({ data: { name: 'Sugar & Salt', slug: 'sugar-salt', image: '/categories/sugar.png', sortOrder: 6 } }),
      db.category.create({ data: { name: 'Snacks & Namkeen', slug: 'snacks-namkeen', image: '/categories/snacks.png', sortOrder: 7 } }),
      db.category.create({ data: { name: 'Cleaning Products', slug: 'cleaning', image: '/categories/cleaning.png', sortOrder: 8 } }),
    ]);
    console.log('[SEED] Created', categories.length, 'categories');

    // Create products
    const productsData = [
      // Cooking Oil
      { name: 'Fortune Mustard Oil', category: categories[0], unit: '1 Box - 10 Packets', price: 1450, mrp: 1550, stock: 25, minQty: 1, featured: true, bestSelling: true },
      { name: 'Fortune Soyabean Oil', category: categories[0], unit: '15 Ltr Can', price: 1850, mrp: 2050, stock: 30, minQty: 1, featured: true, bestSelling: false },
      { name: 'Saffola Gold Oil', category: categories[0], unit: '5 Ltr Can', price: 620, mrp: 699, stock: 20, minQty: 2, featured: false, bestSelling: true },
      { name: 'Dhara Mustard Oil', category: categories[0], unit: '1 Box - 12 Packets', price: 1320, mrp: 1440, stock: 15, minQty: 1, featured: false, bestSelling: false },
      // Rice & Grains
      { name: 'India Gate Basmati Rice', category: categories[1], unit: '25 kg Bag', price: 1150, mrp: 1350, stock: 40, minQty: 1, featured: true, bestSelling: true },
      { name: 'Daawat Rozana Basmati', category: categories[1], unit: '25 kg Bag', price: 890, mrp: 1050, stock: 35, minQty: 2, featured: false, bestSelling: true },
      { name: 'Royal Pusa Basmati', category: categories[1], unit: '50 kg Bag', price: 2100, mrp: 2400, stock: 20, minQty: 1, featured: true, bestSelling: false },
      // Spices
      { name: 'MDH Garam Masala', category: categories[2], unit: '1 Box - 12 Packs (100g)', price: 420, mrp: 480, stock: 50, minQty: 2, featured: false, bestSelling: true },
      { name: 'Everest Turmeric Powder', category: categories[2], unit: '1 Box - 20 Packs (100g)', price: 350, mrp: 400, stock: 45, minQty: 2, featured: true, bestSelling: false },
      { name: 'MDH Red Chilli Powder', category: categories[2], unit: '1 Box - 12 Packs (100g)', price: 380, mrp: 440, stock: 40, minQty: 2, featured: false, bestSelling: true },
      // Flour
      { name: 'Aashirvaad Atta', category: categories[3], unit: '25 kg Bag', price: 580, mrp: 680, stock: 50, minQty: 1, featured: true, bestSelling: true },
      { name: 'Fortune Chakki Atta', category: categories[3], unit: '25 kg Bag', price: 550, mrp: 650, stock: 40, minQty: 2, featured: false, bestSelling: false },
      // Pulses
      { name: 'Tata Masoor Dal', category: categories[4], unit: '25 kg Bag', price: 1450, mrp: 1650, stock: 30, minQty: 1, featured: true, bestSelling: true },
      { name: 'Tata Moong Dal', category: categories[4], unit: '25 kg Bag', price: 2100, mrp: 2400, stock: 25, minQty: 1, featured: false, bestSelling: false },
      { name: 'Rajdhani Toor Dal', category: categories[4], unit: '25 kg Bag', price: 1900, mrp: 2200, stock: 20, minQty: 1, featured: true, bestSelling: false },
      // Sugar & Salt
      { name: 'Madhur Sugar', category: categories[5], unit: '50 kg Bag', price: 2350, mrp: 2600, stock: 30, minQty: 1, featured: true, bestSelling: true },
      { name: 'Tata Salt', category: categories[5], unit: '1 Box - 24 Packs (1kg)', price: 380, mrp: 432, stock: 60, minQty: 2, featured: false, bestSelling: true },
      // Snacks
      { name: 'Haldiram Aloo Bhujia', category: categories[6], unit: '1 Box - 12 Packs (400g)', price: 540, mrp: 624, stock: 35, minQty: 2, featured: false, bestSelling: true },
      { name: 'Bikaji Moong Dal', category: categories[6], unit: '1 Box - 24 Packs (200g)', price: 420, mrp: 480, stock: 40, minQty: 2, featured: true, bestSelling: false },
      // Cleaning
      { name: 'Surf Excel Easy Wash', category: categories[7], unit: '1 Box - 12 Packs (1kg)', price: 540, mrp: 612, stock: 30, minQty: 2, featured: true, bestSelling: false },
      { name: 'Vim Dishwash Bar', category: categories[7], unit: '1 Box - 48 Bars (140g)', price: 480, mrp: 560, stock: 35, minQty: 2, featured: false, bestSelling: true },
    ];

    let createdCount = 0;
    for (const p of productsData) {
      const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await db.product.create({
        data: {
          name: p.name,
          slug,
          unit: p.unit,
          price: p.price,
          mrp: p.mrp,
          stock: p.stock,
          minQuantity: p.minQty,
          isAvailable: true,
          isFeatured: p.featured,
          isBestSelling: p.bestSelling,
          categoryId: p.category.id,
        },
      });
      createdCount++;
    }

    console.log('[SEED] Created', createdCount, 'products');
    console.log('[SEED] Database seed completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      categories: categories.length,
      products: createdCount,
    });
  } catch (error: any) {
    console.error('[SEED] FATAL ERROR:', error?.message || error);
    console.error('[SEED] Full error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to seed database',
      detail: error?.message,
      stack: error?.stack,
    }, { status: 500 });
  }
}