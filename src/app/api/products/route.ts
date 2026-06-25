import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const bestSelling = searchParams.get('bestSelling');

    const all = searchParams.get('all') === 'true';
    const where: Record<string, unknown> = {};
    if (!all) {
      where.isAvailable = true;
    }

    if (category) {
      where.category = { slug: category };
    }
    if (featured === 'true') {
      where.isFeatured = true;
    }
    if (bestSelling === 'true') {
      where.isBestSelling = true;
    }
    if (search) {
      where.name = { contains: search };
    }

    const products = await db.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, unit, price, mrp, stock, minQuantity, image, isAvailable, isFeatured, isBestSelling, categoryId } = body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const product = await db.product.create({
      data: {
        name,
        slug,
        description: description || '',
        unit: unit || '1 pc',
        price: parseFloat(price) || 0,
        mrp: parseFloat(mrp) || 0,
        stock: parseInt(stock) || 0,
        minQuantity: parseInt(minQuantity) || 1,
        image: image || '',
        isAvailable: isAvailable !== false,
        isFeatured: isFeatured === true,
        isBestSelling: isBestSelling === true,
        categoryId,
      },
      include: { category: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.name !== undefined) updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (data.description !== undefined) updateData.description = data.description;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.price !== undefined) updateData.price = parseFloat(data.price);
    if (data.mrp !== undefined) updateData.mrp = parseFloat(data.mrp);
    if (data.stock !== undefined) updateData.stock = parseInt(data.stock);
    if (data.minQuantity !== undefined) updateData.minQuantity = parseInt(data.minQuantity);
    if (data.image !== undefined) updateData.image = data.image;
    if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.isBestSelling !== undefined) updateData.isBestSelling = data.isBestSelling;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

    const product = await db.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    await db.orderItem.deleteMany({ where: { productId: id } });
    await db.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}